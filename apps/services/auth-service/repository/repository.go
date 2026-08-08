package repository

import (
	"errors"
	"erp-pos/apps/services/auth-service/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthRepository interface {
	CreateUser(user *models.User) error
	GetUserByID(id uuid.UUID) (*models.User, error)
	GetUserByEmailOrUsername(identifier string) (*models.User, error)
	AssignRoleToUser(userID, roleID uuid.UUID, outletID *uuid.UUID) error
	GetRoleByName(name string) (*models.Role, error)
	GetUserRoles(userID uuid.UUID) ([]models.Role, error)
	CreateRefreshToken(token *models.RefreshToken) error
	GetRefreshToken(tokenStr string) (*models.RefreshToken, error)
	DeleteRefreshToken(tokenStr string) error
	GetAllSystemParameters() ([]models.SystemParameter, error)
	GetSystemParameterByKey(key string) (*models.SystemParameter, error)
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *authRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Roles").First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) GetUserByEmailOrUsername(identifier string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Roles").Where("email = ? OR username = ?", identifier, identifier).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) AssignRoleToUser(userID, roleID uuid.UUID, outletID *uuid.UUID) error {
	userRole := models.UserRole{
		UserID:   userID,
		RoleID:   roleID,
		OutletID: outletID,
	}
	return r.db.Create(&userRole).Error
}

func (r *authRepository) GetRoleByName(name string) (*models.Role, error) {
	var role models.Role
	if err := r.db.Where("name = ?", name).First(&role).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *authRepository) GetUserRoles(userID uuid.UUID) ([]models.Role, error) {
	var user models.User
	if err := r.db.Preload("Roles").First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return user.Roles, nil
}

func (r *authRepository) CreateRefreshToken(token *models.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *authRepository) GetRefreshToken(tokenStr string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	if err := r.db.Where("token = ?", tokenStr).First(&token).Error; err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *authRepository) DeleteRefreshToken(tokenStr string) error {
	return r.db.Where("token = ?", tokenStr).Delete(&models.RefreshToken{}).Error
}

func (r *authRepository) GetAllSystemParameters() ([]models.SystemParameter, error) {
	var params []models.SystemParameter
	if err := r.db.Find(&params).Error; err != nil {
		return nil, err
	}
	return params, nil
}

func (r *authRepository) GetSystemParameterByKey(key string) (*models.SystemParameter, error) {
	var param models.SystemParameter
	if err := r.db.Where("param_key = ?", key).First(&param).Error; err != nil {
		return nil, errors.New("parameter not found")
	}
	return &param, nil
}
