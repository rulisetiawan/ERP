package service

import (
	"encoding/json"
	"errors"
	"erp-pos/services/inventory-service/models"
	"erp-pos/services/inventory-service/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type InventoryService interface {
	CreateProduct(dto *models.CreateProductDTO) (*models.Product, error)
	GetProduct(id uuid.UUID) (*models.Product, error)
	SearchProducts(query string) ([]models.Product, error)
	GetAllProducts() ([]models.Product, error)
	CreateStockOpname(createdBy uuid.UUID, dto *models.CreateOpnameDTO) (*models.StockOpname, error)
	InputOpnameItem(opnameID uuid.UUID, dto *models.InputOpnameItemDTO) (*models.StockOpnameItem, error)
	AdjustStockOpname(opnameID, approverID uuid.UUID) (*models.StockOpname, error)
	RollbackStockOpname(opnameID, userID uuid.UUID, reason string) (*models.StockOpname, error)
}

type inventoryService struct {
	repo repository.InventoryRepository
}

func NewInventoryService(repo repository.InventoryRepository) InventoryService {
	return &inventoryService{repo: repo}
}

func (s *inventoryService) CreateProduct(dto *models.CreateProductDTO) (*models.Product, error) {
	product := &models.Product{
		CategoryID:    dto.CategoryID,
		SKU:           dto.SKU,
		Barcode:       dto.Barcode,
		Name:          dto.Name,
		Brand:         dto.Brand,
		VariantName:   dto.VariantName,
		SubVariant:    dto.SubVariant,
		Description:   dto.Description,
		Unit:          dto.Unit,
		BuyPrice:      dto.BuyPrice,
		SellPrice:     dto.SellPrice,
		MinStockAlert: dto.MinStockAlert,
		ImageMinioURL: dto.ImageMinioURL,
	}

	if err := s.repo.CreateProduct(product); err != nil {
		return nil, errors.New("failed to create product (SKU or Barcode must be unique)")
	}
	return product, nil
}

func (s *inventoryService) GetProduct(id uuid.UUID) (*models.Product, error) {
	return s.repo.GetProductByID(id)
}

func (s *inventoryService) SearchProducts(query string) ([]models.Product, error) {
	return s.repo.SearchProducts(query)
}

func (s *inventoryService) GetAllProducts() ([]models.Product, error) {
	return s.repo.GetAllProducts()
}

func (s *inventoryService) CreateStockOpname(createdBy uuid.UUID, dto *models.CreateOpnameDTO) (*models.StockOpname, error) {
	opnameNumber := fmt.Sprintf("SOP-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:6])

	opname := &models.StockOpname{
		WarehouseID:        dto.WarehouseID,
		OpnameNumber:       opnameNumber,
		Status:             "in_progress",
		IsOperationalHours: dto.IsOperationalHours,
		SnapshotTimestamp:  time.Now(),
		Notes:              dto.Notes,
		CreatedBy:          createdBy,
	}

	if err := s.repo.CreateStockOpname(opname); err != nil {
		return nil, errors.New("failed to create stock opname session")
	}

	return opname, nil
}

func (s *inventoryService) InputOpnameItem(opnameID uuid.UUID, dto *models.InputOpnameItemDTO) (*models.StockOpnameItem, error) {
	opname, err := s.repo.GetStockOpnameByID(opnameID)
	if err != nil || opname.Status != "in_progress" {
		return nil, errors.New("stock opname session is not active")
	}

	product, err := s.repo.GetProductByID(dto.ProductID)
	if err != nil {
		return nil, errors.New("product not found")
	}

	currentStock, err := s.repo.GetStock(dto.ProductID, opname.WarehouseID)
	if err != nil {
		return nil, err
	}

	// Snapshot Delta Compensation Algorithm
	systemStockSnapshot := currentStock.Quantity
	salesDelta := 0 // Mocked / tracked via POS event listener during opname window

	effectiveSystemStock := systemStockSnapshot - salesDelta
	variance := dto.PhysicalStock - effectiveSystemStock
	varianceValue := float64(variance) * product.BuyPrice

	item := &models.StockOpnameItem{
		StockOpnameID:          opnameID,
		ProductID:              dto.ProductID,
		SystemStock:            currentStock.Quantity,
		SystemStockAtSnapshot:  systemStockSnapshot,
		SalesDeltaDuringOpname: salesDelta,
		PhysicalStock:          dto.PhysicalStock,
		Variance:               variance,
		UnitCost:               product.BuyPrice,
		VarianceValue:          varianceValue,
		Condition:              dto.Condition,
		PhotoMinIOURL:          dto.PhotoMinIOURL,
		Notes:                  dto.Notes,
	}

	if err := s.repo.SaveOpnameItem(item); err != nil {
		return nil, errors.New("failed to save opname item count")
	}

	return item, nil
}

func (s *inventoryService) AdjustStockOpname(opnameID, approverID uuid.UUID) (*models.StockOpname, error) {
	opname, err := s.repo.GetStockOpnameByID(opnameID)
	if err != nil || (opname.Status != "in_progress" && opname.Status != "completed") {
		return nil, errors.New("invalid stock opname state for adjustment")
	}

	beforeSnapshot, _ := json.Marshal(opname)

	// Apply adjustments to ProductStocks & StockMovements
	for _, item := range opname.OpnameItems {
		if item.Variance != 0 {
			stock, _ := s.repo.GetStock(item.ProductID, opname.WarehouseID)
			stockBefore := stock.Quantity
			stockAfter := stockBefore + item.Variance

			_ = s.repo.UpdateStockQuantity(item.ProductID, opname.WarehouseID, item.Variance)

			movType := "in_opname_adj"
			if item.Variance < 0 {
				movType = "out_opname_adj"
			}

			movement := &models.StockMovement{
				ProductID:     item.ProductID,
				WarehouseID:   opname.WarehouseID,
				Type:          movType,
				Quantity:      item.Variance,
				StockBefore:   stockBefore,
				StockAfter:    stockAfter,
				ReferenceType: "stock_opname",
				ReferenceID:   opname.ID,
				Notes:         fmt.Sprintf("Stock Opname Adjustment #%s", opname.OpnameNumber),
				CreatedBy:     approverID,
			}
			_ = s.repo.CreateStockMovement(movement)
		}
	}

	_ = s.repo.UpdateStockOpnameStatus(opnameID, "adjusted", &approverID)
	updatedOpname, _ := s.repo.GetStockOpnameByID(opnameID)

	afterSnapshot, _ := json.Marshal(updatedOpname)

	// Audit Trail Log
	history := &models.StockOpnameHistory{
		StockOpnameID:  opnameID,
		Action:         "approved_adjusted",
		PerformedBy:    approverID,
		BeforeSnapshot: string(beforeSnapshot),
		AfterSnapshot:  string(afterSnapshot),
	}
	_ = s.repo.CreateOpnameHistory(history)

	return updatedOpname, nil
}

func (s *inventoryService) RollbackStockOpname(opnameID, userID uuid.UUID, reason string) (*models.StockOpname, error) {
	opname, err := s.repo.GetStockOpnameByID(opnameID)
	if err != nil || opname.Status != "adjusted" {
		return nil, errors.New("only adjusted stock opnames can be rolled back")
	}

	beforeSnapshot, _ := json.Marshal(opname)

	// Revert all variances
	for _, item := range opname.OpnameItems {
		if item.Variance != 0 {
			revertDelta := -item.Variance
			stock, _ := s.repo.GetStock(item.ProductID, opname.WarehouseID)
			stockBefore := stock.Quantity
			stockAfter := stockBefore + revertDelta

			_ = s.repo.UpdateStockQuantity(item.ProductID, opname.WarehouseID, revertDelta)

			movType := "in_opname_revert"
			if revertDelta < 0 {
				movType = "out_opname_revert"
			}

			movement := &models.StockMovement{
				ProductID:     item.ProductID,
				WarehouseID:   opname.WarehouseID,
				Type:          movType,
				Quantity:      revertDelta,
				StockBefore:   stockBefore,
				StockAfter:    stockAfter,
				ReferenceType: "stock_opname_rollback",
				ReferenceID:   opname.ID,
				Notes:         fmt.Sprintf("Rollback Opname #%s. Reason: %s", opname.OpnameNumber, reason),
				CreatedBy:     userID,
			}
			_ = s.repo.CreateStockMovement(movement)
		}
	}

	_ = s.repo.UpdateStockOpnameStatus(opnameID, "restored", &userID)
	updatedOpname, _ := s.repo.GetStockOpnameByID(opnameID)

	afterSnapshot, _ := json.Marshal(updatedOpname)

	history := &models.StockOpnameHistory{
		StockOpnameID:  opnameID,
		Action:         "restored_rollback",
		PerformedBy:    userID,
		Reason:         reason,
		BeforeSnapshot: string(beforeSnapshot),
		AfterSnapshot:  string(afterSnapshot),
	}
	_ = s.repo.CreateOpnameHistory(history)

	return updatedOpname, nil
}
