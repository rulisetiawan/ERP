package models

import (
	"time"

	"github.com/google/uuid"
)

type POSShift struct {
	ID                 uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CashierUserID      uuid.UUID  `gorm:"type:uuid;not null" json:"cashier_user_id"`
	OutletID           uuid.UUID  `gorm:"type:uuid;not null" json:"outlet_id"`
	OpenTime           time.Time  `json:"open_time"`
	CloseTime          *time.Time `json:"close_time,omitempty"`
	InitialCash        float64    `gorm:"type:numeric(15,2);default:0" json:"initial_cash"`
	ExpectedFinalCash  float64    `gorm:"type:numeric(15,2);default:0" json:"expected_final_cash"`
	ActualFinalCash    float64    `gorm:"type:numeric(15,2);default:0" json:"actual_final_cash"`
	Status             string     `gorm:"type:varchar(20);default:'open'" json:"status"` // 'open', 'closed'
}

type Order struct {
	ID              uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderNumber     string          `gorm:"type:varchar(50);uniqueIndex;not null" json:"order_number"`
	ClientOrderUUID *string         `gorm:"type:varchar(100);uniqueIndex" json:"client_order_uuid,omitempty"`
	IsOfflineOrder  bool            `gorm:"default:false" json:"is_offline_order"`
	CustomerID      *uuid.UUID      `gorm:"type:uuid" json:"customer_id,omitempty"`
	CashierUserID   *uuid.UUID      `gorm:"type:uuid" json:"cashier_user_id,omitempty"`
	POSShiftID      *uuid.UUID      `gorm:"type:uuid" json:"pos_shift_id,omitempty"`
	Channel         string          `gorm:"type:varchar(30);default:'pos_terminal'" json:"channel"` // 'pos_terminal', 'web_catalog', 'mobile_app', 'ai_assistant'
	DeliveryType    string          `gorm:"type:varchar(20);default:'pickup'" json:"delivery_type"` // 'delivery', 'pickup'
	DeliveryAddress string          `gorm:"type:text" json:"delivery_address"`
	Subtotal        float64         `gorm:"type:numeric(15,2);default:0" json:"subtotal"`
	DiscountAmount  float64         `gorm:"type:numeric(15,2);default:0" json:"discount_amount"`
	TaxAmount       float64         `gorm:"type:numeric(15,2);default:0" json:"tax_amount"`
	GrandTotal      float64         `gorm:"type:numeric(15,2);default:0" json:"grand_total"`
	PaymentMethod   string          `gorm:"type:varchar(30);default:'cash'" json:"payment_method"` // 'cash', 'qris', 'bank_transfer', 'ewallet'
	PaymentStatus   string          `gorm:"type:varchar(30);default:'unpaid'" json:"payment_status"` // 'unpaid', 'pending_verification', 'paid', 'cancelled'
	OrderStatus     string          `gorm:"type:varchar(30);default:'placed'" json:"order_status"` // 'placed', 'verifying', 'processing', 'ready', 'completed', 'cancelled'
	OrderItems      []OrderItem     `gorm:"foreignKey:OrderID" json:"order_items"`
	ManualPayment   *ManualPayment  `gorm:"foreignKey:OrderID" json:"manual_payment,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
}

type OrderItem struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID     uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	ProductID   uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	ProductName string    `gorm:"type:varchar(150);not null" json:"product_name"`
	Price       float64   `gorm:"type:numeric(15,2);not null" json:"price"`
	Quantity    int       `gorm:"not null" json:"quantity"`
	Subtotal    float64   `gorm:"type:numeric(15,2);not null" json:"subtotal"`
}

type ManualPayment struct {
	ID                    uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID               uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex" json:"order_id"`
	PaymentType           string     `gorm:"type:varchar(30);not null" json:"payment_type"`
	AccountName           string     `gorm:"type:varchar(100)" json:"account_name"`
	AccountNumber         string     `gorm:"type:varchar(50)" json:"account_number"`
	ReceiptImageMinIOURL string     `gorm:"type:text;not null" json:"receipt_image_minio_url"`
	VerifiedBy            *uuid.UUID `gorm:"type:uuid" json:"verified_by,omitempty"`
	VerifiedAt            *time.Time `json:"verified_at,omitempty"`
	Status                string     `gorm:"type:varchar(30);default:'pending_verification'" json:"status"`
	Notes                 string     `gorm:"type:text" json:"notes"`
}

type CreateOrderDTO struct {
	ClientOrderUUID *string         `json:"client_order_uuid"`
	IsOfflineOrder  bool            `json:"is_offline_order"`
	CustomerID      *uuid.UUID      `json:"customer_id"`
	CashierUserID   *uuid.UUID      `json:"cashier_user_id"`
	POSShiftID      *uuid.UUID      `json:"pos_shift_id"`
	Channel         string          `json:"channel"`
	DeliveryType    string          `json:"delivery_type"`
	DeliveryAddress string          `json:"delivery_address"`
	DiscountAmount  float64         `json:"discount_amount"`
	PaymentMethod   string          `json:"payment_method"`
	Items           []OrderItemDTO  `json:"items"`
}

type OrderItemDTO struct {
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Price       float64   `json:"price"`
	Quantity    int       `json:"quantity"`
}

type OpenShiftDTO struct {
	OutletID    uuid.UUID `json:"outlet_id"`
	InitialCash float64   `json:"initial_cash"`
}

type CloseShiftDTO struct {
	ActualFinalCash float64 `json:"actual_final_cash"`
}
