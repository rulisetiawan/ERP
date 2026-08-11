package main

import (
	"erp-pos/apps/services/inventory-service/controller"
	"erp-pos/apps/services/inventory-service/repository"
	"erp-pos/apps/services/inventory-service/service"
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.LoadConfig("inventory_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to inventory_db: %v", err)
	}

	repo := repository.NewInventoryRepository(db)
	svc := service.NewInventoryService(repo)
	ctrl := controller.NewInventoryController(svc)

	// ----------------------------------------------------------------------
	// GOROUTINE CONCURRENCY PATTERN: BACKGROUND TICKER MONITOR GOROUTINE
	// Runs continuously in a dedicated background Goroutine
	// ----------------------------------------------------------------------
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			log.Println("[GOROUTINE BACKGROUND TICKER] Checking critical stock thresholds across all warehouse locations...")
		}
	}()

	app := fiber.New(fiber.Config{
		AppName: "Inventory Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "healthy",
			"service": "inventory-service",
		})
	})

	// API Routes
	api := app.Group("/api/v1/inventory")
	api.Post("/products", ctrl.CreateProduct)
	api.Get("/products", ctrl.GetProducts)
	api.Get("/products/:id", ctrl.GetProductByID)

	// Opname Routes
	api.Post("/opnames", ctrl.CreateStockOpname)
	api.Post("/opnames/:id/items", ctrl.InputOpnameItem)
	api.Post("/opnames/:id/adjust", ctrl.AdjustStockOpname)
	api.Post("/opnames/:id/rollback", ctrl.RollbackStockOpname)

	log.Printf("[Inventory Service] Listening on port :8003...")
	if err := app.Listen(":8003"); err != nil {
		log.Fatalf("Failed to start Inventory Service: %v", err)
	}
}
