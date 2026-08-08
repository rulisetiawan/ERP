package repository

import (
	"erp-pos/apps/services/finance-service/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FinanceRepository interface {
	CreateCOA(coa *models.ChartOfAccount) error
	GetCOAByID(id uuid.UUID) (*models.ChartOfAccount, error)
	GetAllCOA() ([]models.ChartOfAccount, error)
	CreateJournal(journal *models.Journal) error
	GetAllJournals() ([]models.Journal, error)
	GetJournalByRef(refType string, refID uuid.UUID) (*models.Journal, error)
}

type financeRepository struct {
	db *gorm.DB
}

func NewFinanceRepository(db *gorm.DB) FinanceRepository {
	return &financeRepository{db: db}
}

func (r *financeRepository) CreateCOA(coa *models.ChartOfAccount) error {
	return r.db.Create(coa).Error
}

func (r *financeRepository) GetCOAByID(id uuid.UUID) (*models.ChartOfAccount, error) {
	var coa models.ChartOfAccount
	err := r.db.First(&coa, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &coa, nil
}

func (r *financeRepository) GetAllCOA() ([]models.ChartOfAccount, error) {
	var coas []models.ChartOfAccount
	err := r.db.Order("code ASC").Find(&coas).Error
	if err != nil {
		return nil, err
	}
	return coas, nil
}

func (r *financeRepository) CreateJournal(journal *models.Journal) error {
	return r.db.Create(journal).Error
}

func (r *financeRepository) GetAllJournals() ([]models.Journal, error) {
	var journals []models.Journal
	err := r.db.Preload("JournalItems.COA").Order("created_at DESC").Find(&journals).Error
	if err != nil {
		return nil, err
	}
	return journals, nil
}

func (r *financeRepository) GetJournalByRef(refType string, refID uuid.UUID) (*models.Journal, error) {
	var journal models.Journal
	err := r.db.Preload("JournalItems.COA").Where("ref_type = ? AND ref_id = ?", refType, refID).First(&journal).Error
	if err != nil {
		return nil, err
	}
	return &journal, nil
}
