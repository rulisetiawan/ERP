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

type Vendor struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Code          string    `gorm:"type:varchar(30);uniqueIndex;not null" json:"code"`
	Name          string    `gorm:"type:varchar(100);not null" json:"name"`
	Phone         string    `gorm:"type:varchar(20)" json:"phone"`
	Email         string    `gorm:"type:varchar(100)" json:"email"`
	Address       string    `gorm:"type:text" json:"address"`
	ContactPerson string    `gorm:"type:varchar(100)" json:"contact_person"`
	CreatedAt     time.Time `json:"created_at"`
}

type PurchaseOrder struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PONumber    string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"po_number"`
	VendorID    uuid.UUID `gorm:"type:uuid;not null" json:"vendor_id"`
	WarehouseID uuid.UUID `gorm:"type:uuid;not null" json:"warehouse_id"`
	Status      string    `gorm:"type:varchar(30);default:'draft'" json:"status"`
	TotalAmount float64   `gorm:"type:numeric(15,2);default:0" json:"total_amount"`
	Notes       string    `gorm:"type:text" json:"notes"`
	CreatedBy   uuid.UUID `gorm:"type:uuid;not null" json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

func main() {
	cfg := config.LoadConfig("purchasing_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to purchasing_db: %v", err)
	}

	_ = db.AutoMigrate(&Vendor{}, &PurchaseOrder{})

	app := fiber.New(fiber.Config{
		AppName: "Purchasing Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"status": "healthy", "service": "purchasing-service"})
	})

	api := app.Group("/api/v1/purchasing")

	api.Get("/vendors", func(c *fiber.Ctx) error {
		var vendors []Vendor
		db.Find(&vendors)
		return response.Success(c, 200, "Vendors retrieved", vendors)
	})

	api.Post("/vendors", func(c *fiber.Ctx) error {
		var vendor Vendor
		if err := c.BodyParser(&vendor); err != nil {
			return response.Error(c, 400, "Invalid payload", err.Error())
		}
		db.Create(&vendor)
		return response.Success(c, 201, "Vendor created", vendor)
	})

	api.Get("/orders", func(c *fiber.Ctx) error {
		var pos []PurchaseOrder
		db.Find(&pos)
		return response.Success(c, 200, "Purchase orders retrieved", pos)
	})

	log.Printf("[Purchasing Service] Listening on port :8005...")
	if err := app.Listen(":8005"); err != nil {
		log.Fatalf("Failed to start Purchasing Service: %v", err)
	}
}
