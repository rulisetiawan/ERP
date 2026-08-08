package main

import (
	"erp-pos/services/hr-payroll-service/controller"
	"erp-pos/services/hr-payroll-service/repository"
	"erp-pos/services/hr-payroll-service/service"
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.LoadConfig("hr_payroll_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to hr_payroll_db: %v", err)
	}

	repo := repository.NewHRRepository(db)
	svc := service.NewHRService(repo)
	ctrl := controller.NewHRController(svc)

	app := fiber.New(fiber.Config{
		AppName: "HR & Payroll Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "healthy",
			"service": "hr-payroll-service",
		})
	})

	// API Routes
	api := app.Group("/api/v1/hr")
	api.Post("/employees", ctrl.CreateEmployee)
	api.Get("/employees", ctrl.GetEmployees)

	api.Post("/attendances/clock-in", ctrl.ClockIn)
	api.Get("/attendances", ctrl.GetAttendances)

	api.Post("/payrolls/run", ctrl.RunPayroll)

	log.Printf("[HR & Payroll Service] Listening on port :8002...")
	if err := app.Listen(":8002"); err != nil {
		log.Fatalf("Failed to start HR Payroll Service: %v", err)
	}
}
