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

type ChatMessage struct {
	ID                  uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	RoomID              uuid.UUID `gorm:"type:uuid;not null" json:"room_id"`
	SenderUserID        uuid.UUID `gorm:"type:uuid;not null" json:"sender_user_id"`
	MessageText         string    `gorm:"type:text" json:"message_text"`
	AttachmentMinioURL string    `gorm:"type:text" json:"attachment_minio_url"`
	IsRead              bool      `gorm:"default:false" json:"is_read"`
	CreatedAt           time.Time `json:"created_at"`
}

func main() {
	cfg := config.LoadConfig("chat_db")

	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to chat_db: %v", err)
	}

	_ = db.AutoMigrate(&ChatMessage{})

	app := fiber.New(fiber.Config{
		AppName: "Chat & WhatsApp Service - ERP POS Enterprise v1.0",
	})

	app.Use(cors.New())
	app.Use(logger.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"status": "healthy", "service": "chat-service"})
	})

	api := app.Group("/api/v1/chat")

	api.Get("/messages", func(c *fiber.Ctx) error {
		var messages []ChatMessage
		db.Order("created_at DESC").Find(&messages)
		return response.Success(c, 200, "Messages retrieved", messages)
	})

	api.Post("/messages", func(c *fiber.Ctx) error {
		var msg ChatMessage
		if err := c.BodyParser(&msg); err != nil {
			return response.Error(c, 400, "Invalid payload", err.Error())
		}
		db.Create(&msg)
		return response.Success(c, 201, "Message sent", msg)
	})

	// WAHA Webhook Listener Endpoint
	app.Post("/api/v1/waha/webhook", func(c *fiber.Ctx) error {
		log.Println("[WAHA Webhook] Received incoming WhatsApp message/event")
		return response.Success(c, 200, "Webhook processed", nil)
	})

	log.Printf("[Chat & WhatsApp Service] Listening on port :8007...")
	if err := app.Listen(":8007"); err != nil {
		log.Fatalf("Failed to start Chat Service: %v", err)
	}
}
