package main

import (
	"erp-pos/shared/pkg/config"
	"erp-pos/shared/pkg/database"
	"erp-pos/shared/pkg/response"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/google/uuid"
)

type Asset struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	AssetCode          string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"asset_code"`
	Name               string    `gorm:"type:varchar(150);not null" json:"name"`
	Category           string    `gorm:"type:varchar(50);default:'pos_equipment'" json:"category"`
	SerialNumber       string    `gorm:"type:varchar(100)" json:"serial_number"`
	PurchaseDate       time.Time `json:"purchase_date"`
	PurchaseCost       float64   `gorm:"type:numeric(15,2);default:0" json:"purchase_cost"`
	UsefulLifeMonths   int       `gorm:"default:48" json:"useful_life_months"`
	SalvageValue       float64   `gorm:"type:numeric(15,2);default:0" json:"salvage_value"`
	WarehouseID        uuid.UUID `gorm:"type:uuid;not null" json:"warehouse_id"`
	AssignedEmployeeID *uuid.UUID `gorm:"type:uuid" json:"assigned_employee_id,omitempty"`
	Status             string    `gorm:"type:varchar(30);default:'active'" json:"status"`
	QRCodeMinIOURL     string    `gorm:"type:text" json:"qr_code_minio_url"`
	CreatedAt          time.Time `json:"created_at"`
}

type AssetDepreciation struct {
	ID                      uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	AssetID                 uuid.UUID `gorm:"type:uuid;not null" json:"asset_id"`
	PeriodMonth             int       `gorm:"not null" json:"period_month"`
	PeriodYear              int       `gorm:"not null" json:"period_year"`
	DepreciationAmount      float64   `gorm:"type:numeric(15,2);not null" json:"depreciation_amount"`
	AccumulatedDepreciation float64   `gorm:"type:numeric(15,2);not null" json:"accumulated_depreciation"`
	BookValue               float64   `gorm:"type:numeric(15,2);not null" json:"book_value"`
	CreatedAt               time.Time `json:"created_at"`
}

func main() {
	cfg := config.LoadConfig("asset_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to asset_db: %v", err)
	}

	_ = db.AutoMigrate(&Asset{}, &AssetDepreciation{})

	app := fiber.New(fiber.Config{
		AppName: "Asset Management Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"status": "healthy", "service": "asset-service"})
	})

	api := app.Group("/api/v1/assets")

	api.Get("/items", func(c *fiber.Ctx) error {
		var assets []Asset
		db.Find(&assets)
		return response.Success(c, 200, "Assets retrieved", assets)
	})

	api.Post("/items", func(c *fiber.Ctx) error {
		var asset Asset
		if err := c.BodyParser(&asset); err != nil {
			return response.Error(c, 400, "Invalid payload", err.Error())
		}
		if asset.AssetCode == "" {
			asset.AssetCode = fmt.Sprintf("AST-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:4])
		}
		asset.QRCodeMinIOURL = fmt.Sprintf("https://minio.local/qr-codes/%s.png", asset.AssetCode)
		db.Create(&asset)
		return response.Success(c, 201, "Asset created", asset)
	})

	// Run Monthly Asset Depreciation Engine
	api.Post("/depreciations/run", func(c *fiber.Ctx) error {
		type DeprDTO struct {
			Month int `json:"month"`
			Year  int `json:"year"`
		}
		var dto DeprDTO
		_ = c.BodyParser(&dto)

		var assets []Asset
		db.Where("status = 'active'").Find(&assets)

		var results []AssetDepreciation
		for _, asset := range assets {
			monthlyDepr := (asset.PurchaseCost - asset.SalvageValue) / float64(asset.UsefulLifeMonths)
			depr := AssetDepreciation{
				AssetID:                 asset.ID,
				PeriodMonth:             dto.Month,
				PeriodYear:              dto.Year,
				DepreciationAmount:      monthlyDepr,
				AccumulatedDepreciation: monthlyDepr * 12,
				BookValue:               asset.PurchaseCost - (monthlyDepr * 12),
			}
			db.Create(&depr)
			results = append(results, depr)
		}

		return response.Success(c, 200, "Monthly asset depreciation calculated and posted", results)
	})

	log.Printf("[Asset Management Service] Listening on port :8010...")
	if err := app.Listen(":8010"); err != nil {
		log.Fatalf("Failed to start Asset Service: %v", err)
	}
}
