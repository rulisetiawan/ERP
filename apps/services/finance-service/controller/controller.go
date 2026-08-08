package controller

import (
	"erp-pos/apps/services/finance-service/models"
	"erp-pos/apps/services/finance-service/service"
	"erp-pos/shared/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FinanceController struct {
	svc service.FinanceService
}

func NewFinanceController(svc service.FinanceService) *FinanceController {
	return &FinanceController{svc: svc}
}

func (c *FinanceController) GetCOA(ctx *fiber.Ctx) error {
	coas, err := c.svc.GetAllCOA()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch Chart of Accounts", err.Error())
	}
	return response.Success(ctx, fiber.StatusOK, "Chart of Accounts retrieved", coas)
}

func (c *FinanceController) CreateJournal(ctx *fiber.Ctx) error {
	var dto models.CreateJournalDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	journal, err := c.svc.CreateJournal(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Journal entry recorded", journal)
}

func (c *FinanceController) ReversingJournal(ctx *fiber.Ctx) error {
	type ReversingBody struct {
		RefType string    `json:"ref_type"`
		RefID   uuid.UUID `json:"ref_id"`
		Reason  string    `json:"reason"`
	}

	var body ReversingBody
	if err := ctx.BodyParser(&body); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	journal, err := c.svc.CreateReversingJournal(body.RefType, body.RefID, body.Reason)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Reversing journal recorded", journal)
}

func (c *FinanceController) GetJournals(ctx *fiber.Ctx) error {
	journals, err := c.svc.GetAllJournals()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch journals", err.Error())
	}
	return response.Success(ctx, fiber.StatusOK, "Journals retrieved", journals)
}

func (c *FinanceController) GetPnLReport(ctx *fiber.Ctx) error {
	report, err := c.svc.GetPnLReport()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to generate PnL Report", err.Error())
	}
	return response.Success(ctx, fiber.StatusOK, "Profit & Loss Report generated", report)
}
