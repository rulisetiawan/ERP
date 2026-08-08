package database

import (
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB(dsn string) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	maxRetries := 10
	retryInterval := 2 * time.Second

	for i := 1; i <= maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err == nil {
			sqlDB, errDB := db.DB()
			if errDB == nil && sqlDB.Ping() == nil {
				sqlDB.SetMaxIdleConns(10)
				sqlDB.SetMaxOpenConns(100)
				sqlDB.SetConnMaxLifetime(time.Hour)

				log.Println("[Database] Successfully connected to PostgreSQL")
				return db, nil
			}
		}

		log.Printf("[Database] Connecting to PostgreSQL (Attempt %d/%d)... Error: %v", i, maxRetries, err)
		time.Sleep(retryInterval)
	}

	return nil, err
}
