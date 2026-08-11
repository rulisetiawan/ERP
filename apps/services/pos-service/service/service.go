package service

import (
	"errors"
	"erp-pos/apps/services/pos-service/models"
	"erp-pos/apps/services/pos-service/repository"
	"erp-pos/shared/pkg/asyncworker"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

type POSService interface {
	OpenShift(cashierUserID uuid.UUID, dto *models.OpenShiftDTO) (*models.POSShift, error)
	CloseShift(shiftID uuid.UUID, actualCash float64) error
	CreateOrder(dto *models.CreateOrderDTO) (*models.Order, error)
	GetAllOrders() ([]models.Order, error)
	GetOrderByID(id uuid.UUID) (*models.Order, error)
	UploadManualPayment(orderID uuid.UUID, paymentType, accountName, accountNo, receiptMinioURL string) (*models.ManualPayment, error)
	VerifyPayment(paymentID, verifierID uuid.UUID, isApproved bool, notes string) error
}

type posService struct {
	repo repository.POSRepository
}

func NewPOSService(repo repository.POSRepository) POSService {
	return &posService{repo: repo}
}

func (s *posService) OpenShift(cashierUserID uuid.UUID, dto *models.OpenShiftDTO) (*models.POSShift, error) {
	activeShift, err := s.repo.GetActiveShift(cashierUserID)
	if err == nil && activeShift != nil {
		return nil, errors.New("cashier already has an active open shift")
	}

	shift := &models.POSShift{
		CashierUserID: cashierUserID,
		OutletID:      dto.OutletID,
		OpenTime:      time.Now(),
		InitialCash:   dto.InitialCash,
		Status:        "open",
	}

	if err := s.repo.OpenShift(shift); err != nil {
		return nil, errors.New("failed to open POS shift")
	}

	// Dispatch async Audit Trail logging in background Goroutine
	asyncworker.GetGlobalWorkerPool().SubmitAsync("audit_shift_opened", func() error {
		log.Printf("[GOROUTINE ASYNC AUDIT] Shift Opened by Cashier %s at Outlet %s", cashierUserID, dto.OutletID)
		return nil
	})

	return shift, nil
}

func (s *posService) CloseShift(shiftID uuid.UUID, actualCash float64) error {
	// Expected cash calculation (Mocked base calculation)
	expectedCash := actualCash
	err := s.repo.CloseShift(shiftID, actualCash, expectedCash)
	if err == nil {
		// Dispatch async Goroutine for shift closure notification & reconciliation
		asyncworker.GetGlobalWorkerPool().SubmitAsync("notify_shift_closed", func() error {
			log.Printf("[GOROUTINE ASYNC NOTIFIER] Shift %s Closed. Total Cash Reconciled: Rp %.2f", shiftID, actualCash)
			return nil
		})
	}
	return err
}

func (s *posService) CreateOrder(dto *models.CreateOrderDTO) (*models.Order, error) {
	// Idempotency Check for Offline Sync
	if dto.ClientOrderUUID != nil && *dto.ClientOrderUUID != "" {
		existing, err := s.repo.GetOrderByClientUUID(*dto.ClientOrderUUID)
		if err == nil && existing != nil {
			return existing, nil // Return existing order without duplication
		}
	}

	var subtotal float64
	var orderItems []models.OrderItem

	for _, itemDTO := range dto.Items {
		itemSubtotal := itemDTO.Price * float64(itemDTO.Quantity)
		subtotal += itemSubtotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID:   itemDTO.ProductID,
			ProductName: itemDTO.ProductName,
			Price:       itemDTO.Price,
			Quantity:    itemDTO.Quantity,
			Subtotal:    itemSubtotal,
		})
	}

	taxAmount := subtotal * 0.11 // PPN 11%
	grandTotal := (subtotal - dto.DiscountAmount) + taxAmount

	orderNumber := fmt.Sprintf("ORD-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:6])

	paymentStatus := "paid"
	orderStatus := "completed"

	if dto.PaymentMethod == "qris" || dto.PaymentMethod == "bank_transfer" || dto.PaymentMethod == "ewallet" {
		paymentStatus = "pending_verification"
		orderStatus = "verifying"
	}

	order := &models.Order{
		OrderNumber:     orderNumber,
		ClientOrderUUID: dto.ClientOrderUUID,
		IsOfflineOrder:  dto.IsOfflineOrder,
		CustomerID:      dto.CustomerID,
		CashierUserID:   dto.CashierUserID,
		POSShiftID:      dto.POSShiftID,
		Channel:         dto.Channel,
		DeliveryType:    dto.DeliveryType,
		DeliveryAddress: dto.DeliveryAddress,
		Subtotal:        subtotal,
		DiscountAmount:  dto.DiscountAmount,
		TaxAmount:       taxAmount,
		GrandTotal:      grandTotal,
		PaymentMethod:   dto.PaymentMethod,
		PaymentStatus:   paymentStatus,
		OrderStatus:     orderStatus,
		OrderItems:      orderItems,
	}

	if err := s.repo.CreateOrder(order); err != nil {
		return nil, errors.New("failed to create sales order")
	}

	// ----------------------------------------------------------------------
	// GOROUTINE CONCURRENCY PATTERN: ASYNC POST-PROCESSING
	// Executed asynchronously in background Goroutines via Worker Pool
	// ----------------------------------------------------------------------

	// Task 1: Async Audit Trail Insertion
	asyncworker.GetGlobalWorkerPool().SubmitAsync("audit_order_created", func() error {
		log.Printf("[GOROUTINE ASYNC AUDIT] Sales Order %s Created (GrandTotal: Rp %.2f, Method: %s)", order.OrderNumber, order.GrandTotal, order.PaymentMethod)
		return nil
	})

	// Task 2: Async WhatsApp / WAHA Digital Receipt Dispatcher
	asyncworker.GetGlobalWorkerPool().SubmitAsync("dispatch_whatsapp_receipt", func() error {
		time.Sleep(50 * time.Millisecond) // Simulate lightweight background IO
		log.Printf("[GOROUTINE ASYNC WAHA] Digital Thermal Receipt for %s sent to WhatsApp queue.", order.OrderNumber)
		return nil
	})

	return order, nil
}

func (s *posService) GetAllOrders() ([]models.Order, error) {
	return s.repo.GetAllOrders()
}

func (s *posService) GetOrderByID(id uuid.UUID) (*models.Order, error) {
	return s.repo.GetOrderByID(id)
}

func (s *posService) UploadManualPayment(orderID uuid.UUID, paymentType, accountName, accountNo, receiptMinioURL string) (*models.ManualPayment, error) {
	payment := &models.ManualPayment{
		OrderID:               orderID,
		PaymentType:           paymentType,
		AccountName:           accountName,
		AccountNumber:         accountNo,
		ReceiptImageMinIOURL: receiptMinioURL,
		Status:                "pending_verification",
	}

	if err := s.repo.CreateManualPayment(payment); err != nil {
		return nil, errors.New("failed to record manual payment upload")
	}

	_ = s.repo.UpdateOrderStatus(orderID, "pending_verification", "verifying")

	// Dispatch Async Goroutine for Verification Alert
	asyncworker.GetGlobalWorkerPool().SubmitAsync("notify_payment_uploaded", func() error {
		log.Printf("[GOROUTINE ASYNC NOTIFIER] Manual Payment Uploaded for Order %s. Proof MinIO URL: %s", orderID, receiptMinioURL)
		return nil
	})

	return payment, nil
}

func (s *posService) VerifyPayment(paymentID, verifierID uuid.UUID, isApproved bool, notes string) error {
	status := "verified"
	payStatus := "paid"
	ordStatus := "completed"

	if !isApproved {
		status = "rejected"
		payStatus = "cancelled"
		ordStatus = "cancelled"
	}

	if err := s.repo.VerifyManualPayment(paymentID, verifierID, status, notes); err != nil {
		return err
	}

	order, err := s.repo.GetOrderByID(paymentID)
	if err == nil && order != nil {
		_ = s.repo.UpdateOrderStatus(order.ID, payStatus, ordStatus)
	}

	// Dispatch Async Goroutine for Payment Verification Confirmation
	asyncworker.GetGlobalWorkerPool().SubmitAsync("notify_payment_verified", func() error {
		log.Printf("[GOROUTINE ASYNC NOTIFIER] Payment %s verified by %s. Status: %s", paymentID, verifierID, status)
		return nil
	})

	return nil
}
