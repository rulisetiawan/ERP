package main

import (
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"erp-pos/shared/pkg/response"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/google/uuid"
)

type Member struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	MemberCode  string    `gorm:"type:varchar(30);uniqueIndex;not null" json:"member_code"`
	TotalPoints int       `gorm:"default:0" json:"total_points"`
	TotalSpent  float64   `gorm:"type:numeric(15,2);default:0" json:"total_spent"`
	CurrentTier string    `gorm:"type:varchar(20);default:'bronze'" json:"current_tier"`
	CreatedAt   time.Time `json:"created_at"`
}

func main() {
	cfg := config.LoadConfig("crm_loyalty_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to crm_loyalty_db: %v", err)
	}

	_ = db.AutoMigrate(&Member{})

	app := fiber.New(fiber.Config{
		AppName: "CRM & Loyalty Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"status": "healthy", "service": "crm-loyalty-service"})
	})

	api := app.Group("/api/v1/crm")

	api.Get("/members", func(c *fiber.Ctx) error {
		var members []Member
		db.Find(&members)
		return response.Success(c, 200, "Members retrieved", members)
	})

	api.Post("/members", func(c *fiber.Ctx) error {
		var member Member
		if err := c.BodyParser(&member); err != nil {
			return response.Error(c, 400, "Invalid payload", err.Error())
		}
		db.Create(&member)
		return response.Success(c, 201, "Member registered", member)
	})

	log.Printf("[CRM Loyalty Service] Listening on port :8008...")
	if err := app.Listen(":8008"); err != nil {
		log.Fatalf("Failed to start CRM Loyalty Service: %v", err)
	}
}
