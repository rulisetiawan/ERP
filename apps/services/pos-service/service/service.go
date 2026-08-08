package service

import (
	"errors"
	"erp-pos/apps/services/pos-service/models"
	"erp-pos/apps/services/pos-service/repository"
	"fmt"
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

	return shift, nil
}

func (s *posService) CloseShift(shiftID uuid.UUID, actualCash float64) error {
	// Expected cash calculation (Mocked base calculation)
	expectedCash := actualCash
	return s.repo.CloseShift(shiftID, actualCash, expectedCash)
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

	return nil
}
