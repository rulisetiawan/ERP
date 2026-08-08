"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Filter, Lock, ShieldCheck } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  isOwnerOnly?: boolean; // If true, only visible to Owner role
}

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  userRole?: string; // e.g. "Owner", "Super Admin", "Cashier", "Staff"
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Cari data...",
  filterOptions = [],
  userRole = "Owner", // Default role
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isOwner = userRole === "Owner" || userRole === "Super Admin" || userRole === "owner";

  // Filter columns based on Owner access
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => !col.isOwnerOnly || isOwner);
  }, [columns, isOwner]);

  // Handle Multi-Filter Change
  const handleFilterChange = (filterKey: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1);
  };

  // Filter and Search Logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search Query Matching across all fields
      const matchesSearch = searchQuery.trim() === "" || Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (!matchesSearch) return false;

      // 2. Multi-Filter Dropdown Matching
      for (const [key, val] of Object.entries(selectedFilters)) {
        if (val && val !== "ALL") {
          if (String(row[key] ?? "").toLowerCase() !== val.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchQuery, selectedFilters]);

  // Pagination Logic
  const totalEntries = filteredData.length;
  const totalPages = Math.max(Math.ceil(totalEntries / pageSize), 1);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, startIndex, pageSize]);

  return (
    <div className="space-y-4">
      {/* Top Multi-Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        {/* Left: Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Center: Multi-Filter Dropdowns */}
        {filterOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400 shrink-0" />
            {filterOptions.map((fo) => (
              <select
                key={fo.key}
                value={selectedFilters[fo.key] || "ALL"}
                onChange={(e) => handleFilterChange(fo.key, e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="ALL">Semua {fo.label}</option>
                {fo.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

        {/* Right: Owner Role Indicator */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mode Owner (Akses Harga Beli)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Mode Staff (Harga Beli Dibatasi)
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
            <tr>
              {visibleColumns.map((col, idx) => (
                <th key={idx} className="p-3.5">
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.isOwnerOnly && <Lock className="w-3 h-3 text-amber-400 inline" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="p-8 text-center text-slate-500">
                  Tidak ada data yang sesuai dengan pencarian / filter.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-slate-800/40 transition-colors">
                  {visibleColumns.map((col, colIdx) => (
                    <td key={colIdx} className="p-3.5">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? "-") : "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
        {/* Left: Total Entries */}
        <div className="text-slate-400">
          Menampilkan <span className="font-bold text-slate-100 font-mono">{totalEntries === 0 ? 0 : startIndex + 1}</span> s/d{" "}
          <span className="font-bold text-slate-100 font-mono">{Math.min(startIndex + pageSize, totalEntries)}</span> dari{" "}
          <span className="font-bold text-blue-400 font-mono">{totalEntries}</span> Total Data
        </div>

        {/* Right: Page Size & Navigation Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Baris Per Halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10 Baris</option>
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 font-mono font-bold text-blue-400">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
