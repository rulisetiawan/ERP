package models

import (
	"time"

	"github.com/google/uuid"
)

type Employee struct {
	ID                uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID            uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	EmployeeCode      string    `gorm:"type:varchar(20);uniqueIndex;not null" json:"employee_code"`
	FullName          string    `gorm:"type:varchar(100);not null" json:"full_name"`
	Department        string    `gorm:"type:varchar(50);not null" json:"department"`
	Position          string    `gorm:"type:varchar(50);not null" json:"position"`
	BaseSalary        float64   `gorm:"type:numeric(15,2);default:0" json:"base_salary"`
	BankName          string    `gorm:"type:varchar(50)" json:"bank_name"`
	BankAccountNumber string    `gorm:"type:varchar(50)" json:"bank_account_number"`
	CreatedAt         time.Time `json:"created_at"`
}

type WorkShift struct {
	ID               uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name             string    `gorm:"type:varchar(50);not null" json:"name"`
	StartTime        string    `gorm:"type:time;not null" json:"start_time"`
	EndTime          string    `gorm:"type:time;not null" json:"end_time"`
	ToleranceMinutes int       `gorm:"default:15" json:"tolerance_minutes"`
}

type Attendance struct {
	ID                  uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	EmployeeID          uuid.UUID  `gorm:"type:uuid;not null" json:"employee_id"`
	Employee            *Employee  `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	ShiftID             *uuid.UUID `gorm:"type:uuid" json:"shift_id,omitempty"`
	ClockInTime         time.Time  `json:"clock_in_time"`
	ClockOutTime        *time.Time `json:"clock_out_time,omitempty"`
	ClockInLat          float64    `gorm:"type:decimal(10,8)" json:"clock_in_lat"`
	ClockInLng          float64    `gorm:"type:decimal(11,8)" json:"clock_in_lng"`
	ClockInPhotoMinioURL string    `gorm:"type:text" json:"clock_in_photo_minio_url"`
	IsOfflineAttendance bool       `gorm:"default:false" json:"is_offline_attendance"`
	ClientTimestamp     *time.Time `json:"client_timestamp,omitempty"`
	Status              string     `gorm:"type:varchar(20);default:'present'" json:"status"` // 'present', 'late', 'absent', 'leave'
}

type Payroll struct {
	ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	EmployeeID      uuid.UUID `gorm:"type:uuid;not null" json:"employee_id"`
	Employee        *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	PeriodMonth     int       `gorm:"not null" json:"period_month"`
	PeriodYear      int       `gorm:"not null" json:"period_year"`
	BaseSalary      float64   `gorm:"type:numeric(15,2);not null" json:"base_salary"`
	OvertimePay     float64   `gorm:"type:numeric(15,2);default:0" json:"overtime_pay"`
	Allowances      float64   `gorm:"type:numeric(15,2);default:0" json:"allowances"`
	Deductions      float64   `gorm:"type:numeric(15,2);default:0" json:"deductions"`
	NetSalary       float64   `gorm:"type:numeric(15,2);not null" json:"net_salary"`
	PDFSlipMinioURL string    `gorm:"type:text" json:"pdf_slip_minio_url"`
	PaymentStatus   string    `gorm:"type:varchar(20);default:'draft'" json:"payment_status"` // 'draft', 'approved', 'paid'
	CreatedAt       time.Time `json:"created_at"`
}

type CreateEmployeeDTO struct {
	UserID            uuid.UUID `json:"user_id"`
	EmployeeCode      string    `json:"employee_code"`
	FullName          string    `json:"full_name"`
	Department        string    `json:"department"`
	Position          string    `json:"position"`
	BaseSalary        float64   `json:"base_salary"`
	BankName          string    `json:"bank_name"`
	BankAccountNumber string    `json:"bank_account_number"`
}

type ClockInDTO struct {
	EmployeeID          uuid.UUID  `json:"employee_id"`
	ShiftID             *uuid.UUID `json:"shift_id"`
	Lat                 float64    `json:"lat"`
	Lng                 float64    `json:"lng"`
	PhotoMinIOURL       string     `json:"photo_minio_url"`
	IsOfflineAttendance bool       `json:"is_offline_attendance"`
	ClientTimestamp     *time.Time `json:"client_timestamp"`
}

type RunPayrollDTO struct {
	PeriodMonth int `json:"period_month"`
	PeriodYear  int `json:"period_year"`
}
