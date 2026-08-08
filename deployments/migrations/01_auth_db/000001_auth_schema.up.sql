CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Master Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Master Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

-- 5. Mapping Role ke Permission
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 6. User Role Assignment (Multi-Outlet Scope)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    outlet_id UUID,
    PRIMARY KEY (user_id, role_id)
);

-- 7. Central System Audit Logs (Range Partitioned by Month)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4(),
    service_name VARCHAR(50) NOT NULL,
    user_id UUID,
    username VARCHAR(50),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_params JSONB,
    request_body JSONB,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS audit_logs_2026_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS audit_logs_2026_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-08-01 00:00:00+00') TO ('2026-09-01 00:00:00+00');

-- 8. Central System Error Logs (Observability)
DO $$ BEGIN
    CREATE TYPE error_severity AS ENUM ('warning', 'error', 'critical', 'fatal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT uuid_generate_v4(),
    service_name VARCHAR(50) NOT NULL,
    trace_id VARCHAR(100) NOT NULL,
    error_code VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity error_severity NOT NULL DEFAULT 'error',
    user_id UUID,
    request_url TEXT,
    request_method VARCHAR(10),
    request_payload JSONB,
    environment VARCHAR(20) NOT NULL DEFAULT 'development',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS error_logs_2026_07 PARTITION OF error_logs
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS error_logs_2026_08 PARTITION OF error_logs
    FOR VALUES FROM ('2026-08-01 00:00:00+00') TO ('2026-09-01 00:00:00+00');

-- 9. Central System Parameters
CREATE TABLE IF NOT EXISTS system_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    param_key VARCHAR(100) NOT NULL UNIQUE,
    param_value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL DEFAULT 'string',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_editable BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Roles
INSERT INTO roles (name, description, is_system_default) VALUES
('super_admin', 'Super Administrator dengan Akses Penuh Sistem', TRUE),
('owner', 'Pemilik Usaha / Eksekutif', TRUE),
('store_manager', 'Manajer Toko / Outlet', TRUE),
('cashier', 'Kasir POS Terminal', TRUE),
('warehouse_staff', 'Staf Gudang & Logistik', TRUE),
('hr_staff', 'Staf HR & Payroll', TRUE),
('finance_accountant', 'Staf Keuangan & Akuntan', TRUE),
('customer_support', 'Staf Layanan Pelanggan & WhatsApp', TRUE),
('customer', 'Pelanggan / Pembeli', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed Default Parameters
INSERT INTO system_parameters (param_key, param_value, data_type, category, description) VALUES
('company.name', 'PT ERP POS Indonesia', 'string', 'company', 'Nama Resmi Perusahaan'),
('company.address', 'Jl. Jenderal Sudirman No. 1, Jakarta Pusat', 'string', 'company', 'Alamat Kantor Pusat'),
('company.phone', '0812-3456-7890', 'string', 'company', 'Nomor Telepon Kantor'),
('company.currency', 'Rp', 'string', 'company', 'Simbol Mata Uang Default'),
('pos.tax_percentage', '11.0', 'number', 'pos', 'Persentase Pajak PPN Default (%)'),
('pos.allow_negative_stock', 'false', 'boolean', 'pos', 'Izinkan Transaksi Kasir saat Stok Kosong'),
('pos.receipt_footer_note', 'Terima Kasih Telah Berbelanja!', 'string', 'pos', 'Catatan Kaki Struk Belanja'),
('crm.spend_per_point', '10000', 'number', 'crm', 'Nominal Belanja untuk 1 Poin'),
('crm.point_redeem_value_rupiah', '100', 'number', 'crm', 'Nilai Tukar 1 Poin ke Rupiah'),
('hr.geofence_radius_meters', '100', 'number', 'hr', 'Radius Maksimum Absensi GPS (Meter)'),
('hr.grace_period_late_minutes', '15', 'number', 'hr', 'Toleransi Menit Keterlambatan Absensi'),
('whatsapp.waha_api_url', 'http://waha:3000', 'string', 'whatsapp', 'Endpoint WAHA WhatsApp API'),
('whatsapp.auto_send_receipt', 'true', 'boolean', 'whatsapp', 'Kirim Struk POS ke WA'),
('whatsapp.auto_send_payslip', 'true', 'boolean', 'whatsapp', 'Kirim Slip Gaji ke WA'),
('ai.ollama_base_url', 'http://host.docker.internal:11434', 'string', 'ai', 'Endpoint Ollama Local AI Host'),
('ai.default_model', 'llama3', 'string', 'ai', 'Model Local LLM Default')
ON CONFLICT (param_key) DO NOTHING;
