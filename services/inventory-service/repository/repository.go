package repository

import (
	"erp-pos/services/inventory-service/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryRepository interface {
	CreateProduct(product *models.Product) error
	GetProductByID(id uuid.UUID) (*models.Product, error)
	GetProductBySKUOrBarcode(identifier string) (*models.Product, error)
	SearchProducts(query string) ([]models.Product, error)
	GetAllProducts() ([]models.Product, error)
	GetStock(productID, warehouseID uuid.UUID) (*models.ProductStock, error)
	UpdateStockQuantity(productID, warehouseID uuid.UUID, delta int) error
	CreateStockMovement(movement *models.StockMovement) error
	CreateStockOpname(opname *models.StockOpname) error
	GetStockOpnameByID(id uuid.UUID) (*models.StockOpname, error)
	UpdateStockOpnameStatus(id uuid.UUID, status string, approverID *uuid.UUID) error
	SaveOpnameItem(item *models.StockOpnameItem) error
	CreateOpnameHistory(history *models.StockOpnameHistory) error
}

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) InventoryRepository {
	_ = db.AutoMigrate(
		&models.Category{},
		&models.Warehouse{},
		&models.Product{},
		&models.ProductStock{},
		&models.StockMovement{},
		&models.StockOpname{},
		&models.StockOpnameItem{},
		&models.StockOpnameHistory{},
	)
	return &inventoryRepository{db: db}
}

func (r *inventoryRepository) CreateProduct(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *inventoryRepository) GetProductByID(id uuid.UUID) (*models.Product, error) {
	var product models.Product
	if err := r.db.Preload("Category").Preload("ProductStocks").First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *inventoryRepository) GetProductBySKUOrBarcode(identifier string) (*models.Product, error) {
	var product models.Product
	err := r.db.Preload("Category").Where("sku = ? OR barcode = ?", identifier, identifier).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *inventoryRepository) SearchProducts(query string) ([]models.Product, error) {
	var products []models.Product
	searchPattern := "%" + query + "%"
	err := r.db.Preload("Category").
		Where("name ILIKE ? OR sku ILIKE ? OR barcode ILIKE ?", searchPattern, searchPattern, searchPattern).
		Limit(50).Find(&products).Error
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (r *inventoryRepository) GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	if err := r.db.Preload("Category").Preload("ProductStocks").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *inventoryRepository) GetStock(productID, warehouseID uuid.UUID) (*models.ProductStock, error) {
	var stock models.ProductStock
	err := r.db.Where("product_id = ? AND warehouse_id = ?", productID, warehouseID).First(&stock).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Auto initialize 0 stock
			stock = models.ProductStock{
				ProductID:   productID,
				WarehouseID: warehouseID,
				Quantity:    0,
			}
			_ = r.db.Create(&stock)
			return &stock, nil
		}
		return nil, err
	}
	return &stock, nil
}

func (r *inventoryRepository) UpdateStockQuantity(productID, warehouseID uuid.UUID, delta int) error {
	return r.db.Model(&models.ProductStock{}).
		Where("product_id = ? AND warehouse_id = ?", productID, warehouseID).
		UpdateColumn("quantity", gorm.Expr("quantity + ?", delta)).Error
}

func (r *inventoryRepository) CreateStockMovement(movement *models.StockMovement) error {
	return r.db.Create(movement).Error
}

func (r *inventoryRepository) CreateStockOpname(opname *models.StockOpname) error {
	return r.db.Create(opname).Error
}

func (r *inventoryRepository) GetStockOpnameByID(id uuid.UUID) (*models.StockOpname, error) {
	var opname models.StockOpname
	err := r.db.Preload("OpnameItems.Product").First(&opname, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &opname, nil
}

func (r *inventoryRepository) UpdateStockOpnameStatus(id uuid.UUID, status string, approverID *uuid.UUID) error {
	updates := map[string]interface{}{"status": status}
	if approverID != nil {
		updates["approved_by"] = approverID
	}
	return r.db.Model(&models.StockOpname{}).Where("id = ?", id).Updates(updates).Error
}

func (r *inventoryRepository) SaveOpnameItem(item *models.StockOpnameItem) error {
	return r.db.Save(item).Error
}

func (r *inventoryRepository) CreateOpnameHistory(history *models.StockOpnameHistory) error {
	return r.db.Create(history).Error
}
