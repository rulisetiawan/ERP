package service

import (
	"errors"
	"erp-pos/apps/services/finance-service/models"
	"erp-pos/apps/services/finance-service/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type FinanceService interface {
	GetAllCOA() ([]models.ChartOfAccount, error)
	CreateJournal(dto *models.CreateJournalDTO) (*models.Journal, error)
	CreateReversingJournal(refType string, refID uuid.UUID, reason string) (*models.Journal, error)
	GetAllJournals() ([]models.Journal, error)
	GetPnLReport() (*models.PnLReportDTO, error)
}

type financeService struct {
	repo repository.FinanceRepository
}

func NewFinanceService(repo repository.FinanceRepository) FinanceService {
	return &financeService{repo: repo}
}

func (s *financeService) GetAllCOA() ([]models.ChartOfAccount, error) {
	return s.repo.GetAllCOA()
}

func (s *financeService) CreateJournal(dto *models.CreateJournalDTO) (*models.Journal, error) {
	var totalDebit, totalCredit float64
	var journalItems []models.JournalItem

	for _, itemDTO := range dto.Items {
		totalDebit += itemDTO.Debit
		totalCredit += itemDTO.Credit

		journalItems = append(journalItems, models.JournalItem{
			COAID:  itemDTO.COAID,
			Debit:  itemDTO.Debit,
			Credit: itemDTO.Credit,
		})
	}

	if totalDebit != totalCredit {
		return nil, errors.New("unbalanced journal: Total Debit must equal Total Credit")
	}

	journalNumber := fmt.Sprintf("JRN-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:6])

	journal := &models.Journal{
		JournalNumber: journalNumber,
		RefType:       dto.RefType,
		RefID:         dto.RefID,
		JournalDate:   time.Now(),
		Description:   dto.Description,
		JournalItems:  journalItems,
	}

	if err := s.repo.CreateJournal(journal); err != nil {
		return nil, errors.New("failed to record journal entry")
	}

	return journal, nil
}

func (s *financeService) CreateReversingJournal(refType string, refID uuid.UUID, reason string) (*models.Journal, error) {
	originalJournal, err := s.repo.GetJournalByRef(refType, refID)
	if err != nil {
		return nil, errors.New("original journal entry not found for reversing")
	}

	var reversedItems []models.JournalItem
	var totalDebit, totalCredit float64

	// Swap Debit & Credit
	for _, item := range originalJournal.JournalItems {
		reversedItems = append(reversedItems, models.JournalItem{
			COAID:  item.COAID,
			Debit:  item.Credit, // Swapped
			Credit: item.Debit,  // Swapped
		})
		totalDebit += item.Credit
		totalCredit += item.Debit
	}

	journalNumber := fmt.Sprintf("REV-JRN-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:6])

	reversingJournal := &models.Journal{
		JournalNumber: journalNumber,
		RefType:       refType + "_reversal",
		RefID:         refID,
		JournalDate:   time.Now(),
		Description:   fmt.Sprintf("Reversing Journal for #%s. Reason: %s", originalJournal.JournalNumber, reason),
		JournalItems:  reversedItems,
	}

	if err := s.repo.CreateJournal(reversingJournal); err != nil {
		return nil, errors.New("failed to record reversing journal")
	}

	return reversingJournal, nil
}

func (s *financeService) GetAllJournals() ([]models.Journal, error) {
	return s.repo.GetAllJournals()
}

func (s *financeService) GetPnLReport() (*models.PnLReportDTO, error) {
	// Mock PnL calculations based on journals
	return &models.PnLReportDTO{
		TotalRevenue:  150000000.0,
		TotalCOGS:     85000000.0,
		GrossProfit:   65000000.0,
		TotalExpenses: 25000000.0,
		NetProfit:     40000000.0,
	}, nil
}
