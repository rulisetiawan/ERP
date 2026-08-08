package main

import (
	"erp-pos/apps/services/auth-service/controller"
	"erp-pos/apps/services/auth-service/repository"
	"erp-pos/apps/services/auth-service/service"
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.LoadConfig("auth_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to auth_db: %v", err)
	}

	authRepo := repository.NewAuthRepository(db)
	authSvc := service.NewAuthService(authRepo, cfg)
	authCtrl := controller.NewAuthController(authSvc)

	app := fiber.New(fiber.Config{
		AppName: "Auth Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "healthy",
			"service": "auth-service",
		})
	})

	// API Routes
	api := app.Group("/api/v1/auth")
	api.Post("/register", authCtrl.Register)
	api.Post("/login", authCtrl.Login)
	api.Post("/refresh", authCtrl.RefreshToken)
	api.Get("/parameters", authCtrl.GetSystemParameters)

	log.Printf("[Auth Service] Listening on port :8001...")
	if err := app.Listen(":8001"); err != nil {
		log.Fatalf("Failed to start Auth Service: %v", err)
	}
}
