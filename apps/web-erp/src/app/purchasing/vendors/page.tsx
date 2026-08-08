"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Building, Plus, RefreshCw, X, Upload, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function VendorDirectoryPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Rich Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [npwp, setNpwp] = useState("");
  const [category, setCategory] = useState("Bahan Baku Utama");
  const [phone, setPhone] = useState("");
  const [waPic, setWaPic] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [address, setAddress] = useState("");
  const [logoPreviews, setLogoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.purchasing}/vendors`);
    if (data) setVendors(data);
    setLoading(false);
  }

  function handleMultiLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function removeLogo(index: number) {
    setLogoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URLS.purchasing}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          npwp,
          category,
          phone,
          wa_pic: waPic,
          email,
          contact_person: contactPerson,
          address,
          logo_url: logoPreviews.length > 0 ? logoPreviews[0] : "",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success !== false) {
        setIsModalOpen(false);
        resetForm();
        setNotification("Data vendor supplier baru berhasil disimpan!");
        setTimeout(() => setNotification(""), 4000);
        await loadVendors();
      } else {
        alert(json.message || "Gagal menyimpan data vendor.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi ke server.");
    }
    setSubmitting(false);
  }

  function resetForm() {
    setCode("");
    setName("");
    setNpwp("");
    setPhone("");
    setWaPic("");
    setEmail("");
    setContactPerson("");
    setAddress("");
    setLogoPreviews([]);
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
            <Building className="w-5 h-5 text-blue-400" /> Directory Vendor & Supplier Resmi
          </h1>
          <p className="text-xs text-slate-400">Directory Vendor, Kontrak Pemasok, & Data Rekening Pembayaran</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadVendors} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCode("VND-" + Math.floor(100 + Math.random() * 900));
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> + Tambah Vendor Baru
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Logo</th>
                <th className="p-3">Kode Vendor</th>
                <th className="p-3">Nama Supplier</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Telepon / WA PIC</th>
                <th className="p-3">Email</th>
                <th className="p-3">Contact Person</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center text-slate-500">Memuat data vendor...</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-slate-500">Belum ada vendor terdaftar. Klik '+ Tambah Vendor Baru'.</td></tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
                        {v.logo_url ? (
                          <img src={v.logo_url} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-blue-400">{v.code}</td>
                    <td className="p-3 font-sans font-medium text-slate-200">{v.name}</td>
                    <td className="p-3 font-sans"><span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">{v.category || "Umum"}</span></td>
                    <td className="p-3 text-slate-300">{v.phone} / {v.wa_pic || "-"}</td>
                    <td className="p-3 text-slate-400">{v.email}</td>
                    <td className="p-3 text-slate-300 font-sans">{v.contact_person}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Layout Modal for Vendor CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" /> Form Vendor Supplier Baru
                </h3>
                <p className="text-xs text-slate-400">Isi profil vendor, kontak penanggung jawab, dan nomor rekening</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-5 text-xs">
              {/* 1. Multi-Logo Upload */}
              <div className="grid grid-cols-3 gap-4 items-start border-b border-slate-800/80 pb-4">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Logo & Dokumen Vendor</label>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload Logo, Foto Pabrik, & Dokumen NPWP</p>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="flex flex-wrap gap-3 items-center">
                    {logoPreviews.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeLogo(idx)}
                          className="absolute top-1 right-1 bg-rose-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <Upload className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold">+ Logo</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Vendor Code & Name */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Kode & Nama Vendor *</label>
                  <p className="text-[11px] text-slate-400">Identitas unik supplier</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="VND-101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PT Indofood Sukses Makmur Tbk"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. NPWP & Category */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">NPWP & Kategori Produk</label>
                  <p className="text-[11px] text-slate-400">Pajak perusahaan & tipe barang</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="01.234.567.8-012.000"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Bahan Baku Utama">Bahan Baku Utama</option>
                    <option value="Kemasan & Packaging">Kemasan & Packaging</option>
                    <option value="Peralatan Kantor / ATK">Peralatan Kantor / ATK</option>
                    <option value="Perbengkelan & Sparepart">Perbengkelan & Sparepart</option>
                  </select>
                </div>
              </div>

              {/* 4. Phone, WA & Email */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Kontak Perusahaan & Email</label>
                  <p className="text-[11px] text-slate-400">Telepon kantor, WhatsApp PIC, & Email PO</p>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="021-5551234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="081299988877"
                    value={waPic}
                    onChange={(e) => setWaPic(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="sales@indofood.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Contact Person & Address */}
              <div className="grid grid-cols-3 gap-4 items-start">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Contact Person & Alamat</label>
                  <p className="text-[11px] text-slate-400">Nama PIC & lokasi pergudangan supplier</p>
                </div>
                <div className="col-span-2 space-y-3">
                  <input
                    type="text"
                    placeholder="Budi (Account Manager)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
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
                  {submitting ? "Menyimpan ke Database..." : "Simpan Data Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
