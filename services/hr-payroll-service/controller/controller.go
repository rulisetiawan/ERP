package controller

import (
	"erp-pos/services/hr-payroll-service/models"
	"erp-pos/services/hr-payroll-service/service"
	"erp-pos/shared/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type HRController struct {
	svc service.HRService
}

func NewHRController(svc service.HRService) *HRController {
	return &HRController{svc: svc}
}

func (c *HRController) CreateEmployee(ctx *fiber.Ctx) error {
	var dto models.CreateEmployeeDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	emp, err := c.svc.CreateEmployee(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Employee record created", emp)
}

func (c *HRController) GetEmployees(ctx *fiber.Ctx) error {
	employees, err := c.svc.GetAllEmployees()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch employees", err.Error())
	}
	return response.Success(ctx, fiber.StatusOK, "Employees retrieved", employees)
}

func (c *HRController) ClockIn(ctx *fiber.Ctx) error {
	var dto models.ClockInDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	att, err := c.svc.ClockIn(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "Attendance clock-in recorded", att)
}

func (c *HRController) GetAttendances(ctx *fiber.Ctx) error {
	attendances, err := c.svc.GetAllAttendances()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch attendances", err.Error())
	}
	return response.Success(ctx, fiber.StatusOK, "Attendances retrieved", attendances)
}

func (c *HRController) RunPayroll(ctx *fiber.Ctx) error {
	var dto models.RunPayrollDTO
	if err := ctx.BodyParser(&dto); err != nil || dto.PeriodMonth == 0 || dto.PeriodYear == 0 {
		return response.Error(ctx, fiber.StatusBadRequest, "Period month and year are required", nil)
	}

	payrolls, err := c.svc.RunPayroll(dto.PeriodMonth, dto.PeriodYear)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Payroll batch executed successfully", payrolls)
}
