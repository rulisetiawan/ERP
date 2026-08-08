package service

import (
	"errors"
	"erp-pos/apps/services/hr-payroll-service/models"
	"erp-pos/apps/services/hr-payroll-service/repository"
	"fmt"
	"time"
)

type HRService interface {
	CreateEmployee(dto *models.CreateEmployeeDTO) (*models.Employee, error)
	GetAllEmployees() ([]models.Employee, error)
	ClockIn(dto *models.ClockInDTO) (*models.Attendance, error)
	GetAllAttendances() ([]models.Attendance, error)
	RunPayroll(month, year int) ([]models.Payroll, error)
}

type hrService struct {
	repo repository.HRRepository
}

func NewHRService(repo repository.HRRepository) HRService {
	return &hrService{repo: repo}
}

func (s *hrService) CreateEmployee(dto *models.CreateEmployeeDTO) (*models.Employee, error) {
	emp := &models.Employee{
		UserID:            dto.UserID,
		EmployeeCode:      dto.EmployeeCode,
		FullName:          dto.FullName,
		Department:        dto.Department,
		Position:          dto.Position,
		BaseSalary:        dto.BaseSalary,
		BankName:          dto.BankName,
		BankAccountNumber: dto.BankAccountNumber,
	}

	if err := s.repo.CreateEmployee(emp); err != nil {
		return nil, errors.New("failed to create employee record")
	}

	return emp, nil
}

func (s *hrService) GetAllEmployees() ([]models.Employee, error) {
	return s.repo.GetAllEmployees()
}

func (s *hrService) ClockIn(dto *models.ClockInDTO) (*models.Attendance, error) {
	clockInTime := time.Now()
	if dto.IsOfflineAttendance && dto.ClientTimestamp != nil {
		clockInTime = *dto.ClientTimestamp
	}

	att := &models.Attendance{
		EmployeeID:           dto.EmployeeID,
		ShiftID:              dto.ShiftID,
		ClockInTime:          clockInTime,
		ClockInLat:           dto.Lat,
		ClockInLng:           dto.Lng,
		ClockInPhotoMinioURL: dto.PhotoMinIOURL,
		IsOfflineAttendance: dto.IsOfflineAttendance,
		ClientTimestamp:     dto.ClientTimestamp,
		Status:               "present",
	}

	if err := s.repo.ClockIn(att); err != nil {
		return nil, errors.New("failed to record attendance clock-in")
	}

	return att, nil
}

func (s *hrService) GetAllAttendances() ([]models.Attendance, error) {
	return s.repo.GetAllAttendances()
}

func (s *hrService) RunPayroll(month, year int) ([]models.Payroll, error) {
	employees, err := s.repo.GetAllEmployees()
	if err != nil || len(employees) == 0 {
		return nil, errors.New("no active employees found for payroll run")
	}

	var generatedPayrolls []models.Payroll

	for _, emp := range employees {
		overtimePay := 0.0
		allowances := 500000.0  // Standard Allowance
		deductions := 150000.0  // BPJS & Tax deduction

		netSalary := (emp.BaseSalary + overtimePay + allowances) - deductions
		pdfSlipURL := fmt.Sprintf("https://minio.local/pay-slips/SLIP-%d%02d-%s.pdf", year, month, emp.EmployeeCode)

		payroll := models.Payroll{
			EmployeeID:      emp.ID,
			PeriodMonth:     month,
			PeriodYear:      year,
			BaseSalary:      emp.BaseSalary,
			OvertimePay:     overtimePay,
			Allowances:      allowances,
			Deductions:      deductions,
			NetSalary:       netSalary,
			PDFSlipMinioURL: pdfSlipURL,
			PaymentStatus:   "approved",
		}

		_ = s.repo.CreatePayroll(&payroll)
		generatedPayrolls = append(generatedPayrolls, payroll)
	}

	return generatedPayrolls, nil
}
