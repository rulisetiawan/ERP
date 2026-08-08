package repository

import (
	"erp-pos/apps/services/hr-payroll-service/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HRRepository interface {
	CreateEmployee(emp *models.Employee) error
	GetEmployeeByID(id uuid.UUID) (*models.Employee, error)
	GetAllEmployees() ([]models.Employee, error)
	ClockIn(att *models.Attendance) error
	GetAttendancesByEmployee(employeeID uuid.UUID) ([]models.Attendance, error)
	GetAllAttendances() ([]models.Attendance, error)
	CreatePayroll(p *models.Payroll) error
	GetPayrollsByPeriod(month, year int) ([]models.Payroll, error)
}

type hrRepository struct {
	db *gorm.DB
}

func NewHRRepository(db *gorm.DB) HRRepository {
	_ = db.AutoMigrate(&models.Employee{}, &models.Attendance{}, &models.Payroll{})
	return &hrRepository{db: db}
}

func (r *hrRepository) CreateEmployee(emp *models.Employee) error {
	return r.db.Create(emp).Error
}

func (r *hrRepository) GetEmployeeByID(id uuid.UUID) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.First(&emp, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &emp, nil
}

func (r *hrRepository) GetAllEmployees() ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Find(&employees).Error
	if err != nil {
		return nil, err
	}
	return employees, nil
}

func (r *hrRepository) ClockIn(att *models.Attendance) error {
	return r.db.Create(att).Error
}

func (r *hrRepository) GetAttendancesByEmployee(employeeID uuid.UUID) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Where("employee_id = ?", employeeID).Order("clock_in_time DESC").Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

func (r *hrRepository) GetAllAttendances() ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Preload("Employee").Order("clock_in_time DESC").Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

func (r *hrRepository) CreatePayroll(p *models.Payroll) error {
	return r.db.Create(p).Error
}

func (r *hrRepository) GetPayrollsByPeriod(month, year int) ([]models.Payroll, error) {
	var payrolls []models.Payroll
	err := r.db.Preload("Employee").Where("period_month = ? AND period_year = ?", month, year).Find(&payrolls).Error
	if err != nil {
		return nil, err
	}
	return payrolls, nil
}
