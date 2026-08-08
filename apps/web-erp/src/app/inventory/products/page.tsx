"use client";

import { useEffect, useState, ChangeEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Plus, RefreshCw, X, Upload, CheckCircle2, Lock, ShieldCheck, Tag, Filter } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/DataTable";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialFilter = searchParams.get("filter") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [userRole, setUserRole] = useState<"Owner" | "Staff / Kasir">("Owner");

  // Multi-Level Variant Form State
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sepatu & Fashion");
  const [brand, setBrand] = useState("Nike Air Max"); // Model / Brand Tipe
  const [variantName, setVariantName] = useState("Hitam Red (Leather)"); // Variasi Warna / Bahan
  const [subVariant, setSubVariant] = useState("Size 42"); // Sub-Variasi Ukuran / Size
  const [unit, setUnit] = useState("Pasang");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [minStockAlert, setMinStockAlert] = useState("5");
  const [description, setDescription] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.inventory}/products`);
    if (data && data.length > 0) {
      setProducts(data);
    } else {
      // Mock Fallback Data with Multi-Level Variants
      setProducts([
        { id: "1", sku: "SKU-SHOE-NK-42", barcode: "8991001001", name: "Sepatu Olahraga Nike Air Max", category: "Sepatu & Fashion", brand: "Nike Air Max", variant_name: "Hitam Red (Leather)", sub_variant: "Size 42", buy_price: 450000, selling_price: 750000, stock: 4, min_stock: 10, unit: "Pasang" },
        { id: "2", sku: "SKU-MILK-01", barcode: "8991001002", name: "Susu UHT Full Cream 1L", category: "Minuman & Coffee", brand: "Ultra Milk", variant_name: "Full Cream (UHT)", sub_variant: "1000 ml", buy_price: 14000, selling_price: 19500, stock: 2, min_stock: 10, unit: "Kotak" },
        { id: "3", sku: "SKU-BREAD-02", barcode: "8991001003", name: "Roti Tawar Premium 500g", category: "Makanan & Resto", brand: "Sari Roti", variant_name: "Gandum Lembut", sub_variant: "500 Gram", buy_price: 10000, selling_price: 15000, stock: 12, min_stock: 5, unit: "Bungkus" },
        { id: "4", sku: "SKU-COFFEE-03", barcode: "8991001004", name: "Kopi Gula Aren 250ml", category: "Minuman & Coffee", brand: "Kopi Kenangan", variant_name: "Gula Aren High Blend", sub_variant: "250 ml", buy_price: 7000, selling_price: 12000, stock: 80, min_stock: 15, unit: "Botol" },
        { id: "5", sku: "SKU-SNACK-05", barcode: "8991001005", name: "Snack Keripik Kentang", category: "Makanan & Resto", brand: "Chitato", variant_name: "Original Salt", sub_variant: "150 Gram", buy_price: 9000, selling_price: 13500, stock: 35, min_stock: 10, unit: "Bungkus" },
      ]);
    }
    setLoading(false);
  }

  function handleMultiImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function removeImage(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      sku: sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
      barcode,
      name,
      category,
      brand,
      variant_name: variantName,
      sub_variant: subVariant,
      unit,
      buy_price: parseFloat(buyPrice) || 0,
      selling_price: parseFloat(sellPrice) || 0,
      min_stock: parseInt(minStockAlert) || 5,
      description,
      images: imagePreviews,
    };

    try {
      await fetch(`${API_BASE_URLS.inventory}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(err);
    }

    setNotification(`Produk ${name} (${brand} - ${variantName} ${subVariant}) Berhasil Ditambahkan!`);
    setIsModalOpen(false);
    resetForm();
    loadProducts();
    setTimeout(() => setNotification(""), 4000);
    setSubmitting(false);
  }

  function resetForm() {
    setSku("");
    setBarcode("");
    setName("");
    setCategory("Sepatu & Fashion");
    setBrand("");
    setVariantName("");
    setSubVariant("");
    setUnit("Pasang");
    setBuyPrice("");
    setSellPrice("");
    setMinStockAlert("5");
    setDescription("");
    setImagePreviews([]);
  }

  // Filter products based on URL parameters from Dashboard redirect
  const displayedProducts = products.filter((p) => {
    if (initialCategory && p.category !== initialCategory) return false;
    if (initialFilter === "low_stock" && (p.stock || 0) > (p.min_stock || 10)) return false;
    return true;
  });

  // Table Columns Definition (Owner-Only Price Protection)
  const columns: ColumnDef<any>[] = [
    {
      header: "Produk & Hierarki Variasi",
      accessorKey: "name",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-100">{row.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
              {row.brand || row.category}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
              {row.variant_name || "Std"}
            </span>
            {row.sub_variant && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                {row.sub_variant}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "SKU / Barcode",
      accessorKey: "sku",
      cell: (row) => (
        <div className="font-mono text-xs">
          <p className="text-slate-200 font-bold">{row.sku}</p>
          <p className="text-[10px] text-slate-500">{row.barcode || "-"}</p>
        </div>
      ),
    },
    {
      header: "Kategori",
      accessorKey: "category",
      cell: (row) => <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-xs">{row.category}</span>,
    },
    {
      header: "Harga Beli (Modal)",
      accessorKey: "buy_price",
      isOwnerOnly: true,
      cell: (row) => (
        <span className="font-mono text-slate-400 font-bold">
          Rp {(row.buy_price || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      header: "Harga Jual POS",
      accessorKey: "selling_price",
      cell: (row) => (
        <span className="font-mono text-emerald-400 font-bold">
          Rp {(row.selling_price || row.sell_price || row.price || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      header: "Stok Gudang",
      accessorKey: "stock",
      cell: (row) => {
        const stock = row.stock || row.quantity || 0;
        const minStock = row.min_stock || 5;
        const isCritical = stock <= minStock;
        return (
          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${isCritical ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
            {stock} {row.unit || "Pcs"} {isCritical ? "(Kritis!)" : ""}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Redirect Banner Alert */}
      {(initialCategory || initialFilter) && (
        <div className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>
              Menampilkan filter dari Dashboard:{" "}
              {initialCategory && <strong>Kategori '{initialCategory}'</strong>}
              {initialFilter === "low_stock" && <strong>Produk Stok Kritis (Restock Needed)</strong>}
            </span>
          </div>
          <a href="/inventory/products" className="text-slate-400 hover:text-white underline text-[11px]">
            Bersihkan Filter
          </a>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" /> Master Katalog Produk Multi-Variasi
          </h1>
          <p className="text-xs text-slate-400">Pengelolaan Produk, Hierarki Variasi (Model, Warna, Size), & Hak Akses Harga Beli</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Owner Role Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
            <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" /> Mode Akses:
            </span>
            <button
              onClick={() => setUserRole("Owner")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${userRole === "Owner" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              Owner
            </button>
            <button
              onClick={() => setUserRole("Staff / Kasir")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${userRole === "Staff / Kasir" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              Kasir
            </button>
          </div>

          <button onClick={loadProducts} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* Owner-Only Information Alert */}
      {userRole === "Staff / Kasir" && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Anda sedang login sebagai <strong>Staff / Kasir</strong>. Kolom <strong>Harga Beli (Modal)</strong> disembunyikan secara otomatis sesuai proteksi privasi owner.</span>
        </div>
      )}

      {/* Reusable DataTable Component */}
      <DataTable
        data={displayedProducts}
        columns={columns}
        userRole={userRole}
        searchPlaceholder="Cari berdasarkan SKU, Nama Produk, Brand/Model, Variasi..."
        filterOptions={[
          {
            key: "category",
            label: "Kategori Produk",
            options: Array.from(new Set(products.map((p) => p.category || "Umum"))).map((cat) => ({
              label: cat,
              value: cat,
            })),
          },
        ]}
      />

      {/* Modal Add Product Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" /> Form Input Produk & Hierarki Variasi
                </h3>
                <p className="text-xs text-slate-400">Isi rincian produk, variasi warna/bahan, dan spesifikasi ukuran</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Nama Produk Utama *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sepatu Olahraga Nike Air Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Kategori Utama *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Sepatu & Fashion">Sepatu & Fashion</option>
                    <option value="Makanan & Resto">Makanan & Resto</option>
                    <option value="Minuman & Coffee">Minuman & Coffee</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="ATK & Elektronik">ATK & Elektronik</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Model / Brand Tipe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nike Air Max 270"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Variasi Utama (Warna / Bahan) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hitam Red (Leather)"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Sub-Variasi Spesifik (Ukuran / Size / Volume) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Size 42 / 500ml"
                    value={subVariant}
                    onChange={(e) => setSubVariant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Satuan UOM *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Pasang">Pasang</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Kotak">Kotak</option>
                    <option value="Botol">Botol</option>
                    <option value="Bungkus">Bungkus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SKU Kode Produk (Auto/Custom)</label>
                  <input
                    type="text"
                    placeholder="SKU-SHOE-NK-42"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Barcode Scanner (EAN-13)</label>
                  <input
                    type="text"
                    placeholder="8991001001"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Harga Beli (Khusus Owner) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Rp 450.000"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 font-mono text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-400">Harga Jual POS Kasir *</label>
                  <input
                    type="number"
                    required
                    placeholder="Rp 750.000"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2.5 font-mono text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-Image Upload */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Upload Gambar & Foto Produk (Multi-Upload)</label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-400 font-semibold">+ Foto</span>
                    <input type="file" multiple accept="image/*" onChange={handleMultiImageUpload} className="hidden" />
                  </label>
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  {submitting ? "Menyimpan..." : "Simpan Produk Multi-Variasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 text-xs font-mono">Memuat Katalog Produk...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
