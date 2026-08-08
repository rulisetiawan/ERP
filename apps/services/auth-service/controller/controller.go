package controller

import (
	"erp-pos/apps/services/auth-service/models"
	"erp-pos/apps/services/auth-service/service"
	"erp-pos/shared/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type AuthController struct {
	svc service.AuthService
}

func NewAuthController(svc service.AuthService) *AuthController {
	return &AuthController{svc: svc}
}

func (c *AuthController) Register(ctx *fiber.Ctx) error {
	var dto models.RegisterDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	res, err := c.svc.Register(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusCreated, "User registered successfully", res)
}

func (c *AuthController) Login(ctx *fiber.Ctx) error {
	var dto models.LoginDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return response.Error(ctx, fiber.StatusBadRequest, "Invalid request payload", err.Error())
	}

	res, err := c.svc.Login(&dto)
	if err != nil {
		return response.Error(ctx, fiber.StatusUnauthorized, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Login successful", res)
}

func (c *AuthController) RefreshToken(ctx *fiber.Ctx) error {
	type RefreshBody struct {
		RefreshToken string `json:"refresh_token"`
	}

	var body RefreshBody
	if err := ctx.BodyParser(&body); err != nil || body.RefreshToken == "" {
		return response.Error(ctx, fiber.StatusBadRequest, "Refresh token is required", nil)
	}

	res, err := c.svc.RefreshToken(body.RefreshToken)
	if err != nil {
		return response.Error(ctx, fiber.StatusUnauthorized, err.Error(), nil)
	}

	return response.Success(ctx, fiber.StatusOK, "Token refreshed successfully", res)
}

func (c *AuthController) GetSystemParameters(ctx *fiber.Ctx) error {
	params, err := c.svc.GetSystemParameters()
	if err != nil {
		return response.Error(ctx, fiber.StatusInternalServerError, "Failed to fetch parameters", err.Error())
	}

	return response.Success(ctx, fiber.StatusOK, "System parameters retrieved", params)
}
