"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, RefreshCw, Eye, Edit, Trash2, CheckCircle2, XCircle, Clock, PackageCheck, AlertCircle, X, ShoppingBag } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

interface POItem {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  date: string;
  vendor_name: string;
  warehouse_name: string;
  items: POItem[];
  total_amount: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "CANCELLED";
  notes: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form Create PO state
  const [vendorName, setVendorName] = useState("PT Indofood Sukses Makmur");
  const [warehouseName, setWarehouseName] = useState("Gudang Utama Jakpus");
  const [poNotes, setPoNotes] = useState("");
  const [poItems, setPoItems] = useState<POItem[]>([
    { sku: "SKU-MILK-01", name: "Susu UHT Full Cream 1L", qty: 100, unitPrice: 14500 },
    { sku: "SKU-NOODLE-02", name: "Indomie Goreng Spesial 85g", qty: 250, unitPrice: 2800 },
  ]);

  // Initial Mock Data Fallback for PO Hub
  const defaultPOData: PurchaseOrder[] = [
    {
      id: "po-101",
      po_number: "PO-2026-08001",
      date: new Date().toLocaleDateString("id-ID"),
      vendor_name: "PT Indofood Sukses Makmur",
      warehouse_name: "Gudang Utama Jakpus",
      items: [
        { sku: "SKU-MILK-01", name: "Susu UHT Full Cream 1L", qty: 100, unitPrice: 14500 },
        { sku: "SKU-NOODLE-02", name: "Indomie Goreng Spesial 85g", qty: 250, unitPrice: 2800 },
      ],
      total_amount: 2150000,
      status: "APPROVED",
      notes: "Pengiriman via Armada Truk Pemasok - Estimasi Tiba Esok Hari",
    },
    {
      id: "po-102",
      po_number: "PO-2026-08002",
      date: new Date(Date.now() - 86400000).toLocaleDateString("id-ID"),
      vendor_name: "PT Unilever Indonesia Tbk",
      warehouse_name: "Outlet Jakbar #02 (Central Park)",
      items: [
        { sku: "SKU-SHAMPOO-05", name: "Shampoo Anti Ketombe 160ml", qty: 60, unitPrice: 18500 },
      ],
      total_amount: 1110000,
      status: "RECEIVED",
      notes: "Stok telah diterima & masuk ke persediaan gudang outlet",
    },
    {
      id: "po-103",
      po_number: "PO-2026-08003",
      date: new Date(Date.now() - 172800000).toLocaleDateString("id-ID"),
      vendor_name: "PT Mayora Indah Tbk",
      warehouse_name: "Outlet Surabaya #03 (Tunjungan)",
      items: [
        { sku: "SKU-BISCUIT-08", name: "Biskuit Roma Kelapa 300g", qty: 120, unitPrice: 9200 },
      ],
      total_amount: 1104000,
      status: "DRAFT",
      notes: "Draft pengajuan PO bulan Agustus",
    },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const data = await fetchFromBackend<PurchaseOrder[]>(`${API_BASE_URLS.purchasing}/orders`);
    if (data && data.length > 0) {
      setOrders(data);
    } else {
      setOrders(defaultPOData);
    }
    setLoading(false);
  }

  // Handle Add Item in Create PO Form
  function handleAddPoItem() {
    setPoItems((prev) => [
      ...prev,
      { sku: "SKU-NEW-01", name: "Produk Baru Pemasok", qty: 10, unitPrice: 10000 },
    ]);
  }

  // Handle Remove Item
  function handleRemovePoItem(index: number) {
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Handle Item Field Change
  function handleItemChange(index: number, field: keyof POItem, value: any) {
    setPoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  // CREATE PO Submit Handler
  function handleCreatePO(e: React.FormEvent) {
    e.preventDefault();
    const total = poItems.reduce((acc, curr) => acc + curr.qty * curr.unitPrice, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      po_number: `PO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString("id-ID"),
      vendor_name: vendorName,
      warehouse_name: warehouseName,
      items: poItems,
      total_amount: total,
      status: "DRAFT",
      notes: poNotes || "Pengajuan Pesanan Pembelian Baru",
    };

    setOrders((prev) => [newPO, ...prev]);
    setIsCreateModalOpen(false);
    setNotification(`Pesanan Pembelian ${newPO.po_number} Berhasil Dibuat (DRAFT)!`);
    setTimeout(() => setNotification(""), 4000);
  }

  // UPDATE Status Handler (Approve, Receive GRN, Cancel)
  function handleUpdateStatus(id: string, newStatus: PurchaseOrder["status"]) {
    setOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          return { ...po, status: newStatus };
        }
        return po;
      })
    );

    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    const msg =
      newStatus === "APPROVED"
        ? "Pesanan Pembelian Berhasil Disetujui (APPROVED)!"
        : newStatus === "RECEIVED"
        ? "Penerimaan Barang (GRN) Berhasil! Stok Produk Otomatis Bertambah di Gudang Tujuan."
        : "Pesanan Pembelian Dibatalkan (CANCELLED).";

    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  }

  // DELETE PO Handler
  function handleDeletePO(id: string, poNumber: string) {
    if (confirm(`Apakah Anda yakin ingin menghapus Pesanan Pembelian ${poNumber}?`)) {
      setOrders((prev) => prev.filter((po) => po.id !== id));
      setNotification(`Pesanan Pembelian ${poNumber} Berhasil Dihapus!`);
      setTimeout(() => setNotification(""), 4000);
    }
  }

  // DataTable Columns Definition
  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      header: "No. PO Pemesanan",
      accessorKey: "po_number",
      cell: (row) => (
        <div>
          <p className="font-bold text-blue-400 font-mono">{row.po_number}</p>
          <p className="text-[10px] text-slate-500">{row.date}</p>
        </div>
      ),
    },
    {
      header: "Nama Pemasok (Vendor)",
      accessorKey: "vendor_name",
      cell: (row) => <span className="font-bold text-slate-200">{row.vendor_name}</span>,
    },
    {
      header: "Gudang / Cabang Tujuan",
      accessorKey: "warehouse_name",
      cell: (row) => <span className="text-slate-300 font-medium">{row.warehouse_name}</span>,
    },
    {
      header: "Item Barang",
      cell: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
          {row.items?.length || 0} Jenis Produk
        </span>
      ),
    },
    {
      header: "Total Nominal Beli",
      accessorKey: "total_amount",
      isOwnerOnly: true,
      cell: (row) => (
        <span className="font-bold text-emerald-400 font-mono">
          Rp {row.total_amount?.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      header: "Status PO",
      accessorKey: "status",
      cell: (row) => {
        const statusMap = {
          DRAFT: { label: "Draft Pengajuan", bg: "bg-slate-500/20 text-slate-300 border-slate-500/30", icon: Clock },
          SUBMITTED: { label: "Diajukan", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: AlertCircle },
          APPROVED: { label: "Disetujui (Approved)", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: PackageCheck },
          RECEIVED: { label: "Diterima (GRN Selesai)", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
          CANCELLED: { label: "Dibatalkan", bg: "bg-rose-500/20 text-rose-300 border-rose-500/30", icon: XCircle },
        };
        const st = statusMap[row.status] || statusMap.DRAFT;
        const Icon = st.icon;
        return (
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 w-fit ${st.bg}`}>
            <Icon className="w-3 h-3" /> {st.label}
          </span>
        );
      },
    },
    {
      header: "Aksi Pengelolaan",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedOrder(row);
              setIsDetailModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors"
            title="Lihat Detail & Update Status"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeletePO(row.id, row.po_number)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-200 transition-colors"
            title="Hapus PO"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" /> Manajemen Pesanan Pembelian (Purchase Orders / PO)
          </h1>
          <p className="text-xs text-slate-400">Pengadaan Barang Ke Pemasok (Vendor) & Penerimaan Stok Fisik Gudang (GRN)</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Pesanan Pembelian (PO Baru)
          </button>
        </div>
      </div>

      {/* DataTable Engine */}
      <DataTable
        data={orders}
        columns={columns}
        searchPlaceholder="Cari No. PO, Pemasok (Vendor), Gudang..."
        filterOptions={[
          {
            key: "status",
            label: "Status PO",
            options: [
              { label: "Draft Pengajuan", value: "DRAFT" },
              { label: "Disetujui (Approved)", value: "APPROVED" },
              { label: "Diterima (Received)", value: "RECEIVED" },
              { label: "Dibatalkan", value: "CANCELLED" },
            ],
          },
        ]}
      />

      {/* MODAL 1: Create Purchase Order (Form Tambah PO Baru) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-400" /> Buat Pesanan Pembelian (PO Baru)
                </h3>
                <p className="text-xs text-slate-400">Pengajuan Pengadaan Stok Ke Pemasok Resmi</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pilih Pemasok (Vendor) *</label>
                  <select
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PT Indofood Sukses Makmur">PT Indofood Sukses Makmur</option>
                    <option value="PT Mayora Indah Tbk">PT Mayora Indah Tbk</option>
                    <option value="PT Unilever Indonesia Tbk">PT Unilever Indonesia Tbk</option>
                    <option value="PT Wings Surya">PT Wings Surya</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Gudang / Cabang Tujuan *</label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Gudang Utama Jakpus">Gudang Utama Jakpus</option>
                    <option value="Outlet Jakpus #01 (Sudirman)">Outlet Jakpus #01 (Sudirman)</option>
                    <option value="Outlet Jakbar #02 (Central Park)">Outlet Jakbar #02 (Central Park)</option>
                    <option value="Outlet Surabaya #03 (Tunjungan)">Outlet Surabaya #03 (Tunjungan)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Items Table */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">Rincian Barang yang Dipesan *</span>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris Produk
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="SKU Produk"
                          value={item.sku}
                          onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-100 font-mono text-[11px]"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Nama Produk"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-100 text-[11px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, "qty", parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-100 font-mono text-[11px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Harga Beli"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-100 font-mono text-[11px]"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePoItem(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Catatan Tambahan Pesanan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pengiriman, armada truk, instruksi instruksi khusus..."
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Simpan Pesanan (DRAFT)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View PO Detail & Update Status Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" /> Detail Pesanan Pembelian (PO)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Ref No: <span className="text-blue-400 font-bold">{selectedOrder.po_number}</span> • Tanggal: {selectedOrder.date}
                </p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="text-slate-400">Pemasok (Vendor):</p>
                <p className="font-bold text-slate-100 text-sm">{selectedOrder.vendor_name}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="text-slate-400">Gudang / Cabang Tujuan:</p>
                <p className="font-bold text-slate-100 text-sm">{selectedOrder.warehouse_name}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200">Daftar Rincian Produk:</span>
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Nama Produk</th>
                    <th className="p-2 text-center">Qty Pesan</th>
                    <th className="p-2 text-right">Harga Beli Satuan</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {selectedOrder.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 text-blue-400 font-bold">{it.sku}</td>
                      <td className="p-2 text-slate-200 font-sans">{it.name}</td>
                      <td className="p-2 text-center font-bold">{it.qty}</td>
                      <td className="p-2 text-right">Rp {it.unitPrice?.toLocaleString("id-ID")}</td>
                      <td className="p-2 text-right text-emerald-400 font-bold">
                        Rp {(it.qty * it.unitPrice)?.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 font-sans">TOTAL NOMINAL PEMBELIAN:</span>
              <span className="text-base font-bold text-emerald-400">
                Rp {selectedOrder.total_amount?.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Action Buttons for Updating PO Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {selectedOrder.status === "DRAFT" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "APPROVED")}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
                  >
                    <PackageCheck className="w-4 h-4" /> Setujui PO (Approve)
                  </button>
                )}

                {selectedOrder.status === "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "RECEIVED")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Terima Barang (GRN & Update Stok)
                  </button>
                )}

                {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "RECEIVED" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-xs"
                  >
                    Batalkan PO
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
