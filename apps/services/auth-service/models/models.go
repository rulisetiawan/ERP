package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username     string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email        string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Phone        string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"phone"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	Roles        []Role         `gorm:"many2many:user_roles;" json:"roles,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Role struct {
	ID              uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name            string       `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
	Description     string       `json:"description"`
	IsSystemDefault bool         `gorm:"default:false" json:"is_system_default"`
	Permissions     []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
	CreatedAt       time.Time    `json:"created_at"`
}

type Permission struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Code        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	Module      string    `gorm:"type:varchar(50);not null" json:"module"`
	Description string    `json:"description"`
}

type UserRole struct {
	UserID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	RoleID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"role_id"`
	OutletID *uuid.UUID `gorm:"type:uuid" json:"outlet_id,omitempty"`
}

type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Token     string    `gorm:"type:text;uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type SystemParameter struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ParamKey    string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"param_key"`
	ParamValue  string    `gorm:"type:text;not null" json:"param_value"`
	DataType    string    `gorm:"type:varchar(20);default:'string'" json:"data_type"`
	Category    string    `gorm:"type:varchar(50);not null" json:"category"`
	Description string    `json:"description"`
	IsEditable  bool      `gorm:"default:true" json:"is_editable"`
	UpdatedBy   *uuid.UUID `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RegisterDTO struct {
	Username string   `json:"username" validate:"required"`
	Email    string   `json:"email" validate:"required,email"`
	Phone    string   `json:"phone" validate:"required"`
	Password string   `json:"password" validate:"required,min=6"`
	Roles    []string `json:"roles"`
}

type LoginDTO struct {
	EmailOrUsername string `json:"email_or_username" validate:"required"`
	Password        string `json:"password" validate:"required"`
}

type AuthResponseDTO struct {
	AccessToken  string   `json:"access_token"`
	RefreshToken string   `json:"refresh_token"`
	User         User     `json:"user"`
	Roles        []string `json:"roles"`
}
