package service

import (
	"errors"
	"erp-pos/services/auth-service/models"
	"erp-pos/services/auth-service/repository"
	"erp-pos/shared/pkg/config"
	jwtPkg "erp-pos/shared/pkg/jwt"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(dto *models.RegisterDTO) (*models.AuthResponseDTO, error)
	Login(dto *models.LoginDTO) (*models.AuthResponseDTO, error)
	RefreshToken(refreshTokenStr string) (*models.AuthResponseDTO, error)
	GetSystemParameters() ([]models.SystemParameter, error)
}

type authService struct {
	repo repository.AuthRepository
	cfg  *config.Config
}

func NewAuthService(repo repository.AuthRepository, cfg *config.Config) AuthService {
	return &authService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *authService) Register(dto *models.RegisterDTO) (*models.AuthResponseDTO, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to encrypt password")
	}

	user := &models.User{
		Username:     dto.Username,
		Email:        dto.Email,
		Phone:        dto.Phone,
		PasswordHash: string(hashedPassword),
		IsActive:     true,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, errors.New("username/email/phone already exists")
	}

	// Assign roles
	roleNames := dto.Roles
	if len(roleNames) == 0 {
		roleNames = []string{"customer"}
	}

	for _, roleName := range roleNames {
		role, err := s.repo.GetRoleByName(roleName)
		if err == nil {
			_ = s.repo.AssignRoleToUser(user.ID, role.ID, nil)
		}
	}

	return s.generateAuthResponse(user, roleNames)
}

func (s *authService) Login(dto *models.LoginDTO) (*models.AuthResponseDTO, error) {
	user, err := s.repo.GetUserByEmailOrUsername(dto.EmailOrUsername)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(dto.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	var roleNames []string
	for _, r := range user.Roles {
		roleNames = append(roleNames, r.Name)
	}

	return s.generateAuthResponse(user, roleNames)
}

func (s *authService) RefreshToken(refreshTokenStr string) (*models.AuthResponseDTO, error) {
	token, err := s.repo.GetRefreshToken(refreshTokenStr)
	if err != nil || token.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("invalid or expired refresh token")
	}

	user, err := s.repo.GetUserByID(token.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	var roleNames []string
	for _, r := range user.Roles {
		roleNames = append(roleNames, r.Name)
	}

	// Rotate refresh token
	_ = s.repo.DeleteRefreshToken(refreshTokenStr)
	return s.generateAuthResponse(user, roleNames)
}

func (s *authService) GetSystemParameters() ([]models.SystemParameter, error) {
	return s.repo.GetAllSystemParameters()
}

func (s *authService) generateAuthResponse(user *models.User, roleNames []string) (*models.AuthResponseDTO, error) {
	accessToken, err := jwtPkg.GenerateToken(user.ID.String(), user.Username, user.Email, roleNames, s.cfg.JWTSecret, 24*time.Hour)
	if err != nil {
		return nil, err
	}

	refreshTokenStr := uuid.New().String()
	refreshTokenObj := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshTokenStr,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour), // 30 days
	}
	_ = s.repo.CreateRefreshToken(refreshTokenObj)

	return &models.AuthResponseDTO{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenStr,
		User:         *user,
		Roles:        roleNames,
	}, nil
}
