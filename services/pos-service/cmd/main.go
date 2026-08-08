package main

import (
	"erp-pos/services/pos-service/controller"
	"erp-pos/services/pos-service/repository"
	"erp-pos/services/pos-service/service"
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.LoadConfig("pos_sales_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to pos_sales_db: %v", err)
	}

	repo := repository.NewPOSRepository(db)
	svc := service.NewPOSService(repo)
	ctrl := controller.NewPOSController(svc)

	app := fiber.New(fiber.Config{
		AppName: "POS & Sales Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "healthy",
			"service": "pos-service",
		})
	})

	// API Routes
	api := app.Group("/api/v1/pos")
	api.Post("/shifts/open", ctrl.OpenShift)
	api.Post("/shifts/:id/close", ctrl.CloseShift)

	api.Post("/orders", ctrl.CreateOrder)
	api.Get("/orders", ctrl.GetOrders)
	api.Get("/orders/:id", ctrl.GetOrderByID)

	api.Post("/payments/upload", ctrl.UploadManualPayment)

	log.Printf("[POS Service] Listening on port :8004...")
	if err := app.Listen(":8004"); err != nil {
		log.Fatalf("Failed to start POS Service: %v", err)
	}
}
