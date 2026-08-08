package repository

import (
	"erp-pos/services/pos-service/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type POSRepository interface {
	OpenShift(shift *models.POSShift) error
	GetActiveShift(cashierUserID uuid.UUID) (*models.POSShift, error)
	CloseShift(shiftID uuid.UUID, actualCash, expectedCash float64) error
	CreateOrder(order *models.Order) error
	GetOrderByID(id uuid.UUID) (*models.Order, error)
	GetOrderByClientUUID(clientUUID string) (*models.Order, error)
	GetAllOrders() ([]models.Order, error)
	CreateManualPayment(payment *models.ManualPayment) error
	VerifyManualPayment(paymentID, verifierID uuid.UUID, status string, notes string) error
	UpdateOrderStatus(orderID uuid.UUID, paymentStatus, orderStatus string) error
}

type posRepository struct {
	db *gorm.DB
}

func NewPOSRepository(db *gorm.DB) POSRepository {
	_ = db.AutoMigrate(&models.POSShift{}, &models.Order{}, &models.OrderItem{}, &models.ManualPayment{})
	return &posRepository{db: db}
}

func (r *posRepository) OpenShift(shift *models.POSShift) error {
	return r.db.Create(shift).Error
}

func (r *posRepository) GetActiveShift(cashierUserID uuid.UUID) (*models.POSShift, error) {
	var shift models.POSShift
	err := r.db.Where("cashier_user_id = ? AND status = 'open'", cashierUserID).First(&shift).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

func (r *posRepository) CloseShift(shiftID uuid.UUID, actualCash, expectedCash float64) error {
	return r.db.Model(&models.POSShift{}).Where("id = ?", shiftID).Updates(map[string]interface{}{
		"status":              "closed",
		"actual_final_cash":   actualCash,
		"expected_final_cash": expectedCash,
	}).Error
}

func (r *posRepository) CreateOrder(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *posRepository) GetOrderByID(id uuid.UUID) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("OrderItems").Preload("ManualPayment").First(&order, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *posRepository) GetOrderByClientUUID(clientUUID string) (*models.Order, error) {
	var order models.Order
	err := r.db.Where("client_order_uuid = ?", clientUUID).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *posRepository) GetAllOrders() ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Preload("OrderItems").Preload("ManualPayment").Order("created_at DESC").Find(&orders).Error
	if err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *posRepository) CreateManualPayment(payment *models.ManualPayment) error {
	return r.db.Create(payment).Error
}

func (r *posRepository) VerifyManualPayment(paymentID, verifierID uuid.UUID, status string, notes string) error {
	return r.db.Model(&models.ManualPayment{}).Where("id = ?", paymentID).Updates(map[string]interface{}{
		"status":      status,
		"verified_by": verifierID,
		"notes":       notes,
	}).Error
}

func (r *posRepository) UpdateOrderStatus(orderID uuid.UUID, paymentStatus, orderStatus string) error {
	return r.db.Model(&models.Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
		"payment_status": paymentStatus,
		"order_status":   orderStatus,
	}).Error
}
