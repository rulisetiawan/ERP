package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort        string
	DatabaseURL    string
	JWTSecret      string
	MinIOEndpoint  string
	MinIOAccessKey string
	MinIOSecretKey string
	MinIOBucket    string
	KafkaBrokers   string
	WAHAUrl        string
	OllamaUrl      string
}

func LoadConfig(dbName string) *Config {
	_ = godotenv.Load()

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "erp_user")
	dbPass := getEnv("DB_PASS", "erp_password")

	dbURL := "host=" + dbHost + " user=" + dbUser + " password=" + dbPass + " dbname=" + dbName + " port=" + dbPort + " sslmode=disable TimeZone=Asia/Jakarta"

	return &Config{
		AppPort:        getEnv("APP_PORT", "8001"),
		DatabaseURL:    dbURL,
		JWTSecret:      getEnv("JWT_SECRET", "super-secret-jwt-key-erp-pos-2026"),
		MinIOEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinIOAccessKey: getEnv("MINIO_ACCESS_KEY", "minio_admin"),
		MinIOSecretKey: getEnv("MINIO_SECRET_KEY", "minio_password123"),
		MinIOBucket:    getEnv("MINIO_BUCKET", "erp-pos-storage"),
		KafkaBrokers:   getEnv("KAFKA_BROKERS", "localhost:9092"),
		WAHAUrl:        getEnv("WAHA_URL", "http://localhost:3000"),
		OllamaUrl:      getEnv("OLLAMA_URL", "http://localhost:11434"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
