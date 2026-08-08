"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Users, Plus, RefreshCw, X, Upload, Image as ImageIcon, CheckCircle2, UserCheck } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Rich Form State
  const [empCode, setEmpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [nikKtp, setNikKtp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Operational");
  const [position, setPosition] = useState("Kasir / Staff Store");
  const [status, setStatus] = useState("Tetap");
  const [salary, setSalary] = useState("5000000");
  const [bankName, setBankName] = useState("BCA");
  const [bankNo, setBankNo] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.hr}/employees`);
    if (data) setEmployees(data);
    setLoading(false);
  }

  function handleMultiPhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function removePhoto(index: number) {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateEmployee(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URLS.hr}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "00000000-0000-0000-0000-000000000001",
          employee_code: empCode,
          full_name: fullName,
          nik_ktp: nikKtp,
          phone,
          email,
          department,
          position,
          employment_status: status,
          base_salary: parseFloat(salary) || 0,
          bank_name: bankName,
          bank_account_number: bankNo,
          photo_url: photoPreviews.length > 0 ? photoPreviews[0] : "",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success !== false) {
        setIsModalOpen(false);
        resetForm();
        setNotification("Data karyawan baru berhasil disimpan!");
        setTimeout(() => setNotification(""), 4000);
        await loadEmployees();
      } else {
        alert(json.message || "Gagal menyimpan data karyawan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi ke server.");
    }
    setSubmitting(false);
  }

  function resetForm() {
    setEmpCode("");
    setFullName("");
    setNikKtp("");
    setPhone("");
    setEmail("");
    setBankNo("");
    setPhotoPreviews([]);
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
            <Users className="w-5 h-5 text-blue-400" /> Directory Karyawan & Payroll Profiling
          </h1>
          <p className="text-xs text-slate-400">Pengelolaan Database Karyawan, Departemen, & Status Kerja</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadEmployees} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEmpCode("EMP-" + Math.floor(1000 + Math.random() * 9000));
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> + Tambah Karyawan Baru
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Foto</th>
                <th className="p-3">Kode Karyawan</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Kontak / WA</th>
                <th className="p-3">Departemen</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Gaji Pokok</th>
                <th className="p-3">Rekening Bank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={8} className="p-4 text-center text-slate-500">Memuat data karyawan...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-slate-500">Belum ada data karyawan. Klik '+ Tambah Karyawan Baru'.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
                        {emp.photo_url ? (
                          <img src={emp.photo_url} alt={emp.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-blue-400">{emp.employee_code}</td>
                    <td className="p-3 font-sans font-medium text-slate-200">{emp.full_name}</td>
                    <td className="p-3 text-slate-400">{emp.phone || "-"}</td>
                    <td className="p-3 text-slate-300"><span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-sans">{emp.department}</span></td>
                    <td className="p-3 text-slate-300 font-sans">{emp.position}</td>
                    <td className="p-3 font-bold text-emerald-400">Rp {emp.base_salary?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-slate-400">{emp.bank_name} - {emp.bank_account_number}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Layout Modal for Employee CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" /> Form Profil Karyawan Baru
                </h3>
                <p className="text-xs text-slate-400">Isi data pribadi, jabatan, dan foto profil karyawan</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-5 text-xs">
              {/* 1. Multi-Photo Upload */}
              <div className="grid grid-cols-3 gap-4 items-start border-b border-slate-800/80 pb-4">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Dokumen Foto Karyawan</label>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload Pasfoto, Foto KTP, & Dokumen Pendukung</p>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="flex flex-wrap gap-3 items-center">
                    {photoPreviews.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-rose-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <Upload className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold">+ Foto</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiPhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Employee Code & NIK KTP */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">NIK Karyawan & NIK KTP *</label>
                  <p className="text-[11px] text-slate-400">Kode identitas internal & 16-digit KTP</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="EMP-1001"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="3171000000000001"
                    value={nikKtp}
                    onChange={(e) => setNikKtp(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Full Name */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Nama Lengkap Sesuai KTP *</label>
                  <p className="text-[11px] text-slate-400">Nama resmi karyawan</p>
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Phone & Email */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">No. WhatsApp & Email</label>
                  <p className="text-[11px] text-slate-400">Kontak komunikasi & slip gaji WAHA</p>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="budi@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Department, Position & Status */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Jabatan & Penempatan</label>
                  <p className="text-[11px] text-slate-400">Departemen, Posisi, & Status Kepegawaian</p>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Operational">Operational Store</option>
                    <option value="Sales & POS">Sales & Kasir</option>
                    <option value="Warehouse">Warehouse & Logistik</option>
                    <option value="Finance & Accounting">Finance & Keuangan</option>
                    <option value="Human Resources">HR & Personalia</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Supervisor Store"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Tetap">Karyawan Tetap</option>
                    <option value="Kontrak">Kontrak (PKWT)</option>
                    <option value="Probation">Probation (3 Bulan)</option>
                  </select>
                </div>
              </div>

              {/* 6. Salary & Bank Details */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Gaji Pokok & Rekening Bank *</label>
                  <p className="text-[11px] text-slate-400">Nominal THP Payroll & Pengiriman Gaji</p>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    required
                    placeholder="5000000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="BCA">Bank BCA</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="CIMB">Bank CIMB Niaga</option>
                  </select>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={bankNo}
                    onChange={(e) => setBankNo(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
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
                  {submitting ? "Menyimpan ke Database..." : "Simpan Profil Karyawan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
