"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, X, Package, ShieldCheck, ArrowRightLeft, Filter } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/DataTable";

function StockMovementsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"stock_in" | "stock_out">("stock_in");
  const [notification, setNotification] = useState("");

  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [sourceDestination, setSourceDestination] = useState("PT Indofood Sukses Makmur");
  const [reasonCategory, setReasonCategory] = useState("Pembelian Baru (PO Supplier)");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const prodData = await fetchFromBackend<any[]>(`${API_BASE_URLS.inventory}/products`);
    if (prodData && prodData.length > 0) {
      setProducts(prodData);
      setSelectedProductId(prodData[0].id);
    }

    // Sample movements data with variant info
    setMovements([
      {
        id: "1",
        type: "stock_in",
        product_name: "Sepatu Olahraga Nike Air Max",
        variant_info: "Hitam Red • Size 42",
        sku: "SKU-SHOE-NK-42",
        source_destination: "PT Nike Distribution Indonesia",
        reason_category: "Pembelian Baru (PO Supplier)",
        quantity: 50,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        type: "stock_out",
        product_name: "Susu UHT Full Cream 1L",
        variant_info: "Kotak 1000ml",
        sku: "SKU-MILK-01",
        source_destination: "Outlet Jakarta Pusat - Kasir 01",
        reason_category: "Penjualan POS Kasir",
        quantity: 12,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        type: "stock_in",
        product_name: "Kopi Gula Aren 250ml",
        variant_info: "Botol 250ml",
        sku: "SKU-COFFEE-03",
        source_destination: "Gudang Utama Jakpus",
        reason_category: "Transfer Masuk Inter-Gudang",
        quantity: 100,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "4",
        type: "stock_out",
        product_name: "Roti Tawar Premium 500g",
        variant_info: "Gandum Lembut",
        sku: "SKU-BREAD-02",
        source_destination: "Customer Direct POS",
        reason_category: "Penjualan POS Kasir",
        quantity: 5,
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ]);
    setLoading(false);
  }

  async function handleCreateMovement(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const targetProduct = products.find((p) => p.id === selectedProductId) || {
      name: "Sepatu Olahraga Nike Air Max",
      sku: "SKU-SHOE-NK-42",
      brand: "Nike",
      variant_name: "Hitam Red",
      sub_variant: "Size 42",
    };

    const newMov = {
      id: String(Date.now()),
      type: movementType,
      product_name: targetProduct.name,
      variant_info: `${targetProduct.variant_name || "Std"} • ${targetProduct.sub_variant || "All Size"}`,
      sku: targetProduct.sku,
      source_destination: sourceDestination,
      reason_category: reasonCategory,
      quantity: parseInt(quantity) || 1,
      created_at: new Date().toISOString(),
    };

    setMovements((prev) => [newMov, ...prev]);
    setNotification(`Pencatatan ${movementType === "stock_in" ? "Barang Masuk (+)" : "Barang Keluar (-)"} Berhasil Diproses!`);
    setIsModalOpen(false);
    setSubmitting(false);
    setTimeout(() => setNotification(""), 4000);
  }

  // Filter movements if redirect from Dashboard leaderboard
  const displayedMovements = movements.filter((m) => {
    if (initialSearch) {
      const q = initialSearch.toLowerCase();
      return m.product_name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const columns: ColumnDef<any>[] = [
    {
      header: "Jenis Transaksi",
      accessorKey: "type",
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit ${
            row.type === "stock_in"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
          }`}
        >
          {row.type === "stock_in" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
          {row.type === "stock_in" ? "Barang Masuk (+)" : "Barang Keluar (-)"}
        </span>
      ),
    },
    {
      header: "Produk & Variasi Spesifik",
      accessorKey: "product_name",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-100">{row.product_name}</p>
          <p className="text-[10px] text-blue-400 font-mono">{row.variant_info}</p>
        </div>
      ),
    },
    {
      header: "SKU Kode",
      accessorKey: "sku",
      cell: (row) => <span className="font-mono text-xs text-slate-300 font-bold">{row.sku}</span>,
    },
    {
      header: "Asal / Tujuan Mutasi",
      accessorKey: "source_destination",
      cell: (row) => <span className="text-slate-300 font-sans text-xs">{row.source_destination}</span>,
    },
    {
      header: "Kategori Alasan",
      accessorKey: "reason_category",
      cell: (row) => <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-xs">{row.reason_category}</span>,
    },
    {
      header: "Jumlah Qty",
      accessorKey: "quantity",
      cell: (row) => (
        <span className={`font-mono font-bold text-xs ${row.type === "stock_in" ? "text-emerald-400" : "text-rose-400"}`}>
          {row.type === "stock_in" ? "+" : "-"}{row.quantity} Pcs
        </span>
      ),
    },
    {
      header: "Waktu Transaksi",
      accessorKey: "created_at",
      cell: (row) => <span className="font-mono text-[11px] text-slate-400">{new Date(row.created_at).toLocaleString("id-ID")}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Redirect Banner Alert */}
      {initialSearch && (
        <div className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>
              Menampilkan filter mutasi produk dari Leaderboard Dashboard: <strong>'{initialSearch}'</strong>
            </span>
          </div>
          <a href="/inventory/movements" className="text-slate-400 hover:text-white underline text-[11px]">
            Bersihkan Filter
          </a>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" /> Log Transaksi Barang Masuk & Barang Keluar
          </h1>
          <p className="text-xs text-slate-400">Pencatatan Penerimaan Supplier, Mutasi Antar Gudang, & Pengeluaran Stok POS</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setMovementType("stock_in");
              setSourceDestination("PT Indofood Sukses Makmur");
              setReasonCategory("Pembelian Baru (PO Supplier)");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Barang Masuk (+)
          </button>

          <button
            onClick={() => {
              setMovementType("stock_out");
              setSourceDestination("Outlet Jakarta Pusat - Kasir 01");
              setReasonCategory("Penjualan POS Kasir");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Barang Keluar (-)
          </button>
        </div>
      </div>

      {/* Reusable DataTable Component */}
      <DataTable
        data={displayedMovements}
        columns={columns}
        searchPlaceholder="Cari transaksi berdasarkan Nama Produk, SKU, Supplier, Alasan..."
        filterOptions={[
          {
            key: "type",
            label: "Jenis Transaksi",
            options: [
              { label: "Barang Masuk (+)", value: "stock_in" },
              { label: "Barang Keluar (-)", value: "stock_out" },
            ],
          },
          {
            key: "reason_category",
            label: "Kategori Alasan",
            options: [
              { label: "Pembelian Baru (PO Supplier)", value: "Pembelian Baru (PO Supplier)" },
              { label: "Penjualan POS Kasir", value: "Penjualan POS Kasir" },
              { label: "Transfer Masuk Inter-Gudang", value: "Transfer Masuk Inter-Gudang" },
              { label: "Retur Barang Rusak", value: "Retur Barang Rusak" },
            ],
          },
        ]}
      />

      {/* Modal Form Barang Masuk / Keluar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  {movementType === "stock_in" ? <ArrowDownLeft className="w-5 h-5 text-emerald-400" /> : <ArrowUpRight className="w-5 h-5 text-rose-400" />}
                  Form Pencatatan {movementType === "stock_in" ? "Barang Masuk (+)" : "Barang Keluar (-)"}
                </h3>
                <p className="text-xs text-slate-400">Pilih barang, asal/tujuan, dan alasan penerimaan atau pengeluaran stok</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Pilih Produk & Variasi *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.sku}] - {p.brand} ({p.variant_name} {p.sub_variant})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Jumlah Qty Barang *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Kategori Alasan *</label>
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {movementType === "stock_in" ? (
                      <>
                        <option value="Pembelian Baru (PO Supplier)">Pembelian Baru (PO Supplier)</option>
                        <option value="Transfer Masuk Inter-Gudang">Transfer Masuk Inter-Gudang</option>
                        <option value="Retur Dari Pelanggan">Retur Dari Pelanggan</option>
                        <option value="Koreksi Stock Opname (+)">Koreksi Stock Opname (+)</option>
                      </>
                    ) : (
                      <>
                        <option value="Penjualan POS Kasir">Penjualan POS Kasir</option>
                        <option value="Transfer Keluar Ke Cabang">Transfer Keluar Ke Cabang</option>
                        <option value="Barang Rusak / Kadaluarsa">Barang Rusak / Kadaluarsa</option>
                        <option value="Koreksi Stock Opname (-)">Koreksi Stock Opname (-)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">{movementType === "stock_in" ? "Nama Pemasok / Gudang Asal" : "Outlet Tujuan / Alokasi"} *</label>
                <input
                  type="text"
                  required
                  value={sourceDestination}
                  onChange={(e) => setSourceDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Catatan / No. Surat Jalan / Invoice</label>
                <textarea
                  rows={2}
                  placeholder="Masukkan nomor referensi surat jalan atau keterangan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg ${
                    movementType === "stock_in" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30" : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                  }`}
                >
                  {submitting ? "Memproses..." : `Proses ${movementType === "stock_in" ? "Barang Masuk" : "Barang Keluar"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockMovementsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 text-xs font-mono">Memuat Log Transaksi Mutasi Stok...</div>}>
      <StockMovementsContent />
    </Suspense>
  );
}
