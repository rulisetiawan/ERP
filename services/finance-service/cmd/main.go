package main

import (
	"erp-pos/services/finance-service/controller"
	"erp-pos/services/finance-service/repository"
	"erp-pos/services/finance-service/service"
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.LoadConfig("finance_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to finance_db: %v", err)
	}

	repo := repository.NewFinanceRepository(db)
	svc := service.NewFinanceService(repo)
	ctrl := controller.NewFinanceController(svc)

	app := fiber.New(fiber.Config{
		AppName: "Finance Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "healthy",
			"service": "finance-service",
		})
	})

	// API Routes
	api := app.Group("/api/v1/finance")
	api.Get("/coa", ctrl.GetCOA)

	api.Post("/journals", ctrl.CreateJournal)
	api.Post("/journals/reversing", ctrl.ReversingJournal)
	api.Get("/journals", ctrl.GetJournals)

	api.Get("/reports/pnl", ctrl.GetPnLReport)

	log.Printf("[Finance Service] Listening on port :8006...")
	if err := app.Listen(":8006"); err != nil {
		log.Fatalf("Failed to start Finance Service: %v", err)
	}
}
