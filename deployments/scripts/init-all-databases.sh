#!/bin/bash
set -e

echo "=========================================================="
echo " Starting Auto-Creation of 10 Microservice Databases..."
echo "=========================================================="

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE hr_payroll_db;
    CREATE DATABASE inventory_db;
    CREATE DATABASE pos_sales_db;
    CREATE DATABASE purchasing_db;
    CREATE DATABASE crm_loyalty_db;
    CREATE DATABASE chat_db;
    CREATE DATABASE finance_db;
    CREATE DATABASE ai_assistant_db;
    CREATE DATABASE asset_db;
EOSQL

echo "=========================================================="
echo " All 10 Microservice Databases Created Successfully!"
echo "=========================================================="
