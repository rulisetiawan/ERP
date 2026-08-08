package models

import (
	"time"

	"github.com/google/uuid"
)

type ChartOfAccount struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Code          string    `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Name          string    `gorm:"type:varchar(100);not null" json:"name"`
	Category      string    `gorm:"type:varchar(30);not null" json:"category"`       // 'asset', 'liability', 'equity', 'revenue', 'expense'
	NormalBalance string    `gorm:"type:varchar(10);not null" json:"normal_balance"` // 'debit', 'credit'
}

type Journal struct {
	ID            uuid.UUID     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	JournalNumber string        `gorm:"type:varchar(50);uniqueIndex;not null" json:"journal_number"`
	RefType       string        `gorm:"type:varchar(30);not null" json:"ref_type"` // 'pos_sale', 'purchase', 'payroll', 'opname_adj', 'asset_depreciation'
	RefID         uuid.UUID     `gorm:"type:uuid;not null" json:"ref_id"`
	JournalDate   time.Time     `json:"journal_date"`
	Description   string        `gorm:"type:text" json:"description"`
	JournalItems  []JournalItem `gorm:"foreignKey:JournalID" json:"journal_items"`
	CreatedAt     time.Time     `json:"created_at"`
}

type JournalItem struct {
	ID             uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	JournalID      uuid.UUID       `gorm:"type:uuid;not null" json:"journal_id"`
	COAID          uuid.UUID       `gorm:"type:uuid;not null" json:"coa_id"`
	COA            *ChartOfAccount `gorm:"foreignKey:COAID" json:"coa,omitempty"`
	Debit          float64         `gorm:"type:numeric(15,2);default:0" json:"debit"`
	Credit         float64         `gorm:"type:numeric(15,2);default:0" json:"credit"`
}

type CreateJournalDTO struct {
	RefType     string            `json:"ref_type"`
	RefID       uuid.UUID         `json:"ref_id"`
	Description string            `json:"description"`
	Items       []JournalItemDTO  `json:"items"`
}

type JournalItemDTO struct {
	COAID  uuid.UUID `json:"coa_id"`
	Debit  float64   `json:"debit"`
	Credit float64   `json:"credit"`
}

type PnLReportDTO struct {
	TotalRevenue float64 `json:"total_revenue"`
	TotalCOGS    float64 `json:"total_cogs"`
	GrossProfit  float64 `json:"gross_profit"`
	TotalExpenses float64 `json:"total_expenses"`
	NetProfit    float64 `json:"net_profit"`
}
