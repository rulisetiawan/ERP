"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Building2, RefreshCw, QrCode, Play, Plus, X, Upload, Image as ImageIcon, CheckCircle2, MapPin, Tag } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Form State: Item Code, Item Name, Location, Category, Cost, Useful Life, PIC
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("Outlet Jakarta Pusat - Lt. 1");
  const [category, setCategory] = useState("Peralatan Kasir & POS");
  const [purchaseDate, setPurchaseDate] = useState("2026-01-15");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [residualValue, setResidualValue] = useState("0");
  const [usefulLifeMonths, setUsefulLifeMonths] = useState("48");
  const [picPerson, setPicPerson] = useState("Manajer Store Ops");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.asset}/items`);
    if (data) setAssets(data);
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

  async function handleCreateAsset(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URLS.asset}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_code: itemCode,
          item: itemName,
          name: itemName,
          location: location,
          category: category,
          purchase_date: purchaseDate,
          purchase_cost: parseFloat(purchaseCost) || 0,
          residual_value: parseFloat(residualValue) || 0,
          useful_life_months: parseInt(usefulLifeMonths) || 48,
          pic_person: picPerson,
          image_url: imagePreviews.length > 0 ? imagePreviews[0] : "",
          warehouse_id: "00000000-0000-0000-0000-000000000001",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success !== false) {
        setIsModalOpen(false);
        resetForm();
        setNotification("Aset tetap baru berhasil dicatat!");
        setTimeout(() => setNotification(""), 4000);
        await loadAssets();
      } else {
        alert(json.message || "Gagal menyimpan data aset.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi ke server.");
    }
    setSubmitting(false);
  }

  function resetForm() {
    setItemCode("");
    setItemName("");
    setLocation("Outlet Jakarta Pusat - Lt. 1");
    setPurchaseCost("");
    setResidualValue("0");
    setImagePreviews([]);
  }

  async function handleRunDepreciation() {
    await fetch(`${API_BASE_URLS.asset}/depreciations/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: 8, year: 2026 }),
    });
    setNotification("Penyusutan Aset Bulanan Berhasil Dieksekusi!");
    setTimeout(() => setNotification(""), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" /> Master Fixed Assets & QR Code Tagging
          </h1>
          <p className="text-xs text-slate-400">Pengelolaan Fixed Asset, Lokasi Barang, & Depresiasi Aset Perusahaan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAssets} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleRunDepreciation} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20">
            <Play className="w-3.5 h-3.5" /> Hitung Penyusutan Bulanan
          </button>
          <button
            onClick={() => {
              setItemCode("AST-" + Math.floor(1000 + Math.random() * 9000));
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> + Tambah Aset Baru
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Foto</th>
                <th className="p-3">Item Code</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Location</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Harga Perolehan</th>
                <th className="p-3">Masa Manfaat</th>
                <th className="p-3">Stiker QR Code MinIO</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={9} className="p-4 text-center text-slate-500">Memuat data aset perusahaan...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={9} className="p-4 text-center text-slate-500">Belum ada data aset terdaftar. Klik '+ Tambah Aset Baru'.</td></tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
                        {a.image_url ? (
                          <img src={a.image_url} alt={a.item || a.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-blue-400">{a.item_code || a.asset_code}</td>
                    <td className="p-3 font-sans font-medium text-slate-200">{a.item || a.name}</td>
                    <td className="p-3 font-sans text-slate-300 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {a.location || "Gudang Utama"}</td>
                    <td className="p-3 font-sans text-slate-400"><span className="px-2 py-0.5 rounded bg-slate-800 text-[11px]">{a.category || "Peralatan"}</span></td>
                    <td className="p-3 font-bold text-emerald-400">Rp {a.purchase_cost?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-slate-300">{a.useful_life_months} Bulan</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 text-[10px] flex items-center gap-1"><QrCode className="w-3 h-3" /> MinIO QR Tag</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">{a.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Layout Modal for Asset CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" /> Form Pencatatan Fixed Asset Baru
                </h3>
                <p className="text-xs text-slate-400">Isi rincian informasi dan lokasi aset perusahaan</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-5 text-xs">
              {/* 1. Multi-Image Upload */}
              <div className="grid grid-cols-3 gap-4 items-start border-b border-slate-800/80 pb-4">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Galeri Foto Fisik Aset</label>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload Foto Fisik Barang, Stiker Barcode, & Nota Pembelian</p>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="flex flex-wrap gap-3 items-center">
                    {imagePreviews.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <Upload className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold">+ Foto</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Item Code & Item Name */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Item Code & Item Name *</label>
                  <p className="text-[11px] text-slate-400">Kode unik barang aset & nama lengkap barang</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Item Code</span>
                    <input
                      type="text"
                      required
                      placeholder="AST-1001"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Item Name</span>
                    <input
                      type="text"
                      required
                      placeholder="Mesin Kasir Touchscreen i5 16GB"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-sm font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Location & Category */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Location & Category *</label>
                  <p className="text-[11px] text-slate-400">Lokasi penempatan barang & jenis aset</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Location Penempatan</span>
                    <input
                      type="text"
                      required
                      placeholder="Outlet Jakarta Pusat - Kasir Utama"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Kategori Aset</span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Peralatan Kasir & POS">Peralatan Kasir & POS</option>
                      <option value="Mesin & Peralatan Dapur">Mesin & Peralatan Dapur</option>
                      <option value="Kendaraan Operasional">Kendaraan Operasional</option>
                      <option value="Komputer & IT">Komputer & IT</option>
                      <option value="Furnitur & Inventaris">Furnitur & Inventaris</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Purchase Cost, Residual Value & Useful Life */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Harga Perolehan & Depresiasi *</label>
                  <p className="text-[11px] text-slate-400">Nilai beli, nilai sisa, & umur ekonomis</p>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Harga Beli (Rp)</span>
                    <input
                      type="number"
                      required
                      placeholder="12000000"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Nilai Sisa (Rp)</span>
                    <input
                      type="number"
                      value={residualValue}
                      onChange={(e) => setResidualValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Masa Manfaat (Bulan)</span>
                    <input
                      type="number"
                      value={usefulLifeMonths}
                      onChange={(e) => setUsefulLifeMonths(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Purchase Date & PIC */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Tanggal & Penanggung Jawab</label>
                  <p className="text-[11px] text-slate-400">Tanggal beli & nama PIC pengelola</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Head of Store / Admin IT"
                    value={picPerson}
                    onChange={(e) => setPicPerson(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  {submitting ? "Menyimpan ke Database..." : "Simpan Aset Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
