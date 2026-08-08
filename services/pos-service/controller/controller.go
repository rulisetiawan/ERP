package controller

import (
	"erp-pos/services/pos-service/models"
	"erp-pos/services/pos-service/service"
	"erp-pos/shared/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type POSController struct {
	svc service.POSService
}

func NewPOSController(svc service.POSService) *POSController {
	return &POSController{svc: svc}
}

func (c *POSController) OpenShift(ctx *fiber.Ctx) error {
	var dto models.OpenShiftDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	cashierID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	shift, err := c.svc.OpenShift(cashierID, &dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "POS shift opened", shift)
}

func (c *POSController) CloseShift(ctx *fiber.Ctx) error {
	shiftIDStr := ctx.Params("id")
	shiftID, err := uuid.Parse(shiftIDStr)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid Shift ID", nil)
	}

	var dto models.CloseShiftDTO
	_ = ctx.BodyParser(&dto)

	if err := c.svc.CloseShift(shiftID, dto.ActualFinalCash); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "POS shift closed", nil)
}

func (c *POSController) CreateOrder(ctx *fiber.Ctx) error {
	var dto models.CreateOrderDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	order, err := c.svc.CreateOrder(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Order created successfully", order)
}

func (c *POSController) GetOrders(ctx *fiber.Ctx) error {
	orders, err := c.svc.GetAllOrders()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch orders", err.Error())
	}
	return response.Success(ctx, fiber.StatusOK, "Orders retrieved", orders)
}

func (c *POSController) GetOrderByID(ctx *fiber.Ctx) error {
	idStr := ctx.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid Order ID", nil)
	}

	order, err := c.svc.GetOrderByID(id)
	if err != nil {
		return response.Error(ctx, fiber.StatusNotFound, "Order not found", nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Order details retrieved", order)
}

func (c *POSController) UploadManualPayment(ctx *fiber.Ctx) error {
	type UploadBody struct {
		OrderID               uuid.UUID `json:"order_id"`
		PaymentType           string    `json:"payment_type"`
		AccountName           string    `json:"account_name"`
		AccountNumber         string    `json:"account_number"`
		ReceiptImageMinIOURL string    `json:"receipt_image_minio_url"`
	}

	var body UploadBody
	if err := ctx.BodyParser(&body); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	payment, err := c.svc.UploadManualPayment(body.OrderID, body.PaymentType, body.AccountName, body.AccountNumber, body.ReceiptImageMinIOURL)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Manual payment receipt uploaded", payment)
}
