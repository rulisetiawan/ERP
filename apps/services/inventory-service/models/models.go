package models

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID   uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name string    `gorm:"type:varchar(100);not null" json:"name"`
	Slug string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
}

type Warehouse struct {
	ID   uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Code string    `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Name string    `gorm:"type:varchar(100);not null" json:"name"`
	Type string    `gorm:"type:varchar(20);default:'outlet_store'" json:"type"` // 'central', 'outlet_store'
}

type MasterData struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Type      string    `gorm:"type:varchar(50);not null;index" json:"type"` // 'category', 'brand', 'variant', 'size', 'uom', 'department', 'payment_method', 'warehouse'
	Code      string    `gorm:"type:varchar(50)" json:"code"`
	Name      string    `gorm:"type:varchar(150);not null" json:"name"`
	ParentKey string    `gorm:"type:varchar(50)" json:"parent_key"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type Product struct {
	ID             uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CategoryID     *uuid.UUID     `gorm:"type:uuid" json:"category_id"`
	SKU            string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"sku"`
	Barcode        string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"barcode"`
	Name           string         `gorm:"type:varchar(150);not null" json:"name"`
	Brand          string         `gorm:"type:varchar(100)" json:"brand"`          // Model / Brand (contoh: Nike Air Max)
	VariantName    string         `gorm:"type:varchar(100)" json:"variant_name"`   // Variasi Warna / Bahan (contoh: Hitam Red)
	SubVariant     string         `gorm:"type:varchar(100)" json:"sub_variant"`    // Sub-Variasi Ukuran / Size (contoh: Size 42)
	Description    string         `gorm:"type:text" json:"description"`
	Unit           string         `gorm:"type:varchar(20);default:'Pcs'" json:"unit"`
	BuyPrice       float64        `gorm:"type:numeric(15,2);default:0" json:"buy_price"`
	SellPrice      float64        `gorm:"type:numeric(15,2);default:0" json:"sell_price"`
	MinStockAlert  int            `gorm:"default:5" json:"min_stock_alert"`
	ImageMinioURL  string         `gorm:"type:text" json:"image_minio_url"`
	Category       *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	ProductStocks  []ProductStock `gorm:"foreignKey:ProductID" json:"product_stocks,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
}

type ProductStock struct {
	ID               uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID        uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_product_warehouse" json:"product_id"`
	WarehouseID      uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_product_warehouse" json:"warehouse_id"`
	Quantity         int       `gorm:"default:0" json:"quantity"`
	ReservedQuantity int       `gorm:"default:0" json:"reserved_quantity"`
}

type StockMovement struct {
	ID                uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID         uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	WarehouseID       uuid.UUID `gorm:"type:uuid;not null" json:"warehouse_id"`
	Type              string    `gorm:"type:varchar(50);not null" json:"type"` // 'stock_in', 'stock_out', 'in_purchase', 'out_sale'
	SourceDestination string    `gorm:"type:varchar(150)" json:"source_destination"` // Supplier / Pembeli / Cabang
	ReasonCategory    string    `gorm:"type:varchar(100)" json:"reason_category"`    // Pembelian Baru, Retur, Rusak/Expired, Penjualan POS
	Quantity          int       `gorm:"not null" json:"quantity"`
	StockBefore       int       `gorm:"not null" json:"stock_before"`
	StockAfter        int       `gorm:"not null" json:"stock_after"`
	ReferenceType     string    `gorm:"type:varchar(50);not null" json:"reference_type"`
	ReferenceID       uuid.UUID `gorm:"type:uuid;not null" json:"reference_id"`
	Notes             string    `gorm:"type:text" json:"notes"`
	CreatedBy         uuid.UUID `gorm:"type:uuid;not null" json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`
}

type StockOpname struct {
	ID                  uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	WarehouseID         uuid.UUID         `gorm:"type:uuid;not null" json:"warehouse_id"`
	OpnameNumber        string            `gorm:"type:varchar(50);uniqueIndex;not null" json:"opname_number"`
	Status              string            `gorm:"type:varchar(20);default:'draft'" json:"status"` // 'draft', 'in_progress', 'completed', 'adjusted', 'restored'
	IsOperationalHours  bool              `gorm:"default:true" json:"is_operational_hours"`
	SnapshotTimestamp   time.Time         `json:"snapshot_timestamp"`
	Notes               string            `gorm:"type:text" json:"notes"`
	CreatedBy           uuid.UUID         `gorm:"type:uuid;not null" json:"created_by"`
	ApprovedBy          *uuid.UUID        `gorm:"type:uuid" json:"approved_by,omitempty"`
	OpnameItems         []StockOpnameItem `gorm:"foreignKey:StockOpnameID" json:"opname_items,omitempty"`
	CreatedAt           time.Time         `json:"created_at"`
	CompletedAt         *time.Time        `json:"completed_at,omitempty"`
	AdjustedAt          *time.Time        `json:"adjusted_at,omitempty"`
}

type StockOpnameItem struct {
	ID                     uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	StockOpnameID          uuid.UUID `gorm:"type:uuid;not null" json:"stock_opname_id"`
	ProductID              uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product                *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	SystemStock            int       `json:"system_stock"`
	SystemStockAtSnapshot  int       `gorm:"default:0" json:"system_stock_at_snapshot"`
	SalesDeltaDuringOpname int       `gorm:"default:0" json:"sales_delta_during_opname"`
	PhysicalStock          int       `json:"physical_stock"`
	Variance               int       `json:"variance"`
	UnitCost               float64   `gorm:"type:numeric(15,2);default:0" json:"unit_cost"`
	VarianceValue          float64   `gorm:"type:numeric(15,2);default:0" json:"variance_value"`
	Condition              string    `gorm:"type:varchar(20);default:'good'" json:"condition"` // 'good', 'damaged', 'expired', 'missing'
	PhotoMinIOURL          string    `gorm:"type:text" json:"photo_minio_url"`
	Notes                  string    `gorm:"type:text" json:"notes"`
}

type StockOpnameHistory struct {
	ID             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	StockOpnameID  uuid.UUID `gorm:"type:uuid;not null" json:"stock_opname_id"`
	Action         string    `gorm:"type:varchar(50);not null" json:"action"`
	PerformedBy    uuid.UUID `gorm:"type:uuid;not null" json:"performed_by"`
	Reason         string    `gorm:"type:text" json:"reason"`
	BeforeSnapshot string    `gorm:"type:jsonb" json:"before_snapshot"`
	AfterSnapshot  string    `gorm:"type:jsonb" json:"after_snapshot"`
	CreatedAt      time.Time `json:"created_at"`
}

type CreateProductDTO struct {
	CategoryID    *uuid.UUID `json:"category_id"`
	SKU           string     `json:"sku"`
	Barcode       string     `json:"barcode"`
	Name          string     `json:"name"`
	Brand         string     `json:"brand"`
	VariantName   string     `json:"variant_name"`
	SubVariant    string     `json:"sub_variant"`
	Description   string     `json:"description"`
	Unit          string     `json:"unit"`
	BuyPrice      float64    `json:"buy_price"`
	SellPrice     float64    `json:"sell_price"`
	MinStockAlert int        `json:"min_stock_alert"`
	ImageMinioURL string     `json:"image_minio_url"`
}

type CreateStockMovementDTO struct {
	ProductID         uuid.UUID `json:"product_id"`
	WarehouseID       uuid.UUID `json:"warehouse_id"`
	Type              string    `json:"type"` // 'stock_in' atau 'stock_out'
	SourceDestination string    `json:"source_destination"`
	ReasonCategory    string    `json:"reason_category"`
	Quantity          int       `json:"quantity"`
	Notes             string    `json:"notes"`
}

type CreateOpnameDTO struct {
	WarehouseID        uuid.UUID `json:"warehouse_id"`
	IsOperationalHours bool      `json:"is_operational_hours"`
	Notes              string    `json:"notes"`
}

type InputOpnameItemDTO struct {
	ProductID     uuid.UUID `json:"product_id"`
	PhysicalStock int       `json:"physical_stock"`
	Condition     string    `json:"condition"`
	PhotoMinIOURL string    `json:"photo_minio_url"`
	Notes         string    `json:"notes"`
}
