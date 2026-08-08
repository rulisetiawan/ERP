package controller

import (
	"erp-pos/services/inventory-service/models"
	"erp-pos/services/inventory-service/service"
	"erp-pos/shared/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type InventoryController struct {
	svc service.InventoryService
}

func NewInventoryController(svc service.InventoryService) *InventoryController {
	return &InventoryController{svc: svc}
}

func (c *InventoryController) CreateProduct(ctx *fiber.Ctx) error {
	var dto models.CreateProductDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	product, err := c.svc.CreateProduct(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Product created successfully", product)
}

func (c *InventoryController) GetProducts(ctx *fiber.Ctx) error {
	query := ctx.Query("q")
	if query != "" {
		products, err := c.svc.SearchProducts(query)
		if err != nil {
			return response.Error(ctx, fiber.StatusInternalServerError, "Search failed", err.Error())
		}
		return response.Success(ctx, fiber.StatusOK, "Products retrieved", products)
	}

	products, err := c.svc.GetAllProducts()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch products", err.Error())
	}

	return response.Success(ctx, fiber.StatusOK, "Products retrieved", products)
}

func (c *InventoryController) GetProductByID(ctx *fiber.Ctx) error {
	idStr := ctx.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid Product ID", nil)
	}

	product, err := c.svc.GetProduct(id)
	if err != nil {
		return response.Error(ctx, fiber.StatusNotFound, "Product not found", nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Product details retrieved", product)
}

func (c *InventoryController) CreateStockOpname(ctx *fiber.Ctx) error {
	var dto models.CreateOpnameDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	// Mock User ID from Context
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	opname, err := c.svc.CreateStockOpname(userID, &dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Stock opname session started", opname)
}

func (c *InventoryController) InputOpnameItem(ctx *fiber.Ctx) error {
	opnameIDStr := ctx.Params("id")
	opnameID, err := uuid.Parse(opnameIDStr)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid Opname ID", nil)
	}

	var dto models.InputOpnameItemDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	item, err := c.svc.InputOpnameItem(opnameID, &dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Opname item count saved", item)
}

func (c *InventoryController) AdjustStockOpname(ctx *fiber.Ctx) error {
	opnameIDStr := ctx.Params("id")
	opnameID, err := uuid.Parse(opnameIDStr)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid Opname ID", nil)
	}

	approverID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	opname, err := c.svc.AdjustStockOpname(opnameID, approverID)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Stock opname approved and stock adjusted", opname)
}

func (c *InventoryController) RollbackStockOpname(ctx *fiber.Ctx) error {
	opnameIDStr := ctx.Params("id")
	opnameID, err := uuid.Parse(opnameIDStr)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid Opname ID", nil)
	}

	type RollbackBody struct {
		Reason string `json:"reason"`
	}

	var body RollbackBody
	_ = ctx.BodyParser(&body)
	if body.Reason == "" {
		body.Reason = "Manual Rollback Request by Manager"
	}

	userID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	opname, err := c.svc.RollbackStockOpname(opnameID, userID, body.Reason)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Stock opname rolled back and stock reverted", opname)
}
