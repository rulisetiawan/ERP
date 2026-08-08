"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Settings, QrCode, Building, Upload, CheckCircle2, ShieldCheck, Store, DollarSign, Cloud, Percent, Tag, Phone, Mail, MapPin, Bot, Cpu, Sliders, Database, Sparkles } from "lucide-react";

export default function SystemParametersPage() {
  const [activeTab, setActiveTab] = useState<"identity" | "payment" | "tax_currency" | "server" | "ai">("identity");
  const [notification, setNotification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1. Store Identity State
  const [storeName, setStoreName] = useState("PT ERP POS ENTERPRISE");
  const [storeAddress, setStoreAddress] = useState("Jl. Jenderal Sudirman No. 12, Jakarta Pusat");
  const [storePhone, setStorePhone] = useState("021-555-1234");
  const [storeEmail, setStoreEmail] = useState("support@pos-erp.com");
  const [receiptFooter, setReceiptFooter] = useState("*** TERIMA KASIH ATAS KUNJUNGAN ANDA ***");

  // 2. Payment Setup State
  const [qrisImage, setQrisImage] = useState<string>("/qris_dummy.png");
  const [bankName, setBankName] = useState("Bank BCA");
  const [bankAccountNo, setBankAccountNo] = useState("8830-1928-441");
  const [bankAccountHolder, setBankAccountHolder] = useState("PT ERP POS ENTERPRISE");

  // 3. Tax & Currency State
  const [taxRate, setTaxRate] = useState("11");
  const [currencySymbol, setCurrencySymbol] = useState("IDR - Rupiah (Rp)");
  const [orderPrefix, setOrderPrefix] = useState("POS-2026-");
  const [defaultMinStock, setDefaultMinStock] = useState("5");

  // 4. Server & Storage State
  const [minioEndpoint, setMinioEndpoint] = useState("http://localhost:9000");
  const [minioBucket, setMinioBucket] = useState("erp-product-images");
  const [systemTimezone, setSystemTimezone] = useState("Asia/Jakarta (WIB)");
  const [autoBackupSchedule, setAutoBackupSchedule] = useState("Setiap Jam 00:00 WIB");

  // 5. AI Assistant & Ollama LLM State
  const [ollamaHost, setOllamaHost] = useState("http://host.docker.internal:11434");
  const [aiModel, setAiModel] = useState("llama3.2:3b");
  const [aiTemperature, setAiTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("4096");
  const [dataMartRefreshRate, setDataMartRefreshRate] = useState("5 Menit (<1ms Query)");
  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    "Anda adalah Antigravity AI Assistant ERP Enterprise. Tugas Anda memberikan analisis penjualan real-time, prediksi stok opname, dan rekomendasi laporan eksekutif."
  );

  useEffect(() => {
    // Load persisted parameters from localStorage
    const savedName = localStorage.getItem("store_name");
    const savedAddr = localStorage.getItem("store_address");
    const savedPhone = localStorage.getItem("store_phone");
    const savedEmail = localStorage.getItem("store_email");
    const savedQris = localStorage.getItem("qris_image");
    const savedBankName = localStorage.getItem("bank_name");
    const savedBankNo = localStorage.getItem("bank_account_no");
    const savedBankHolder = localStorage.getItem("bank_account_holder");
    const savedTax = localStorage.getItem("tax_rate");

    const savedOllamaHost = localStorage.getItem("ollama_host");
    const savedAiModel = localStorage.getItem("ai_model");
    const savedAiTemp = localStorage.getItem("ai_temperature");
    const savedPrompt = localStorage.getItem("ai_system_prompt");

    if (savedName) setStoreName(savedName);
    if (savedAddr) setStoreAddress(savedAddr);
    if (savedPhone) setStorePhone(savedPhone);
    if (savedEmail) setStoreEmail(savedEmail);
    if (savedQris) setQrisImage(savedQris);
    if (savedBankName) setBankName(savedBankName);
    if (savedBankNo) setBankAccountNo(savedBankNo);
    if (savedBankHolder) setBankAccountHolder(savedBankHolder);
    if (savedTax) setTaxRate(savedTax);

    if (savedOllamaHost) setOllamaHost(savedOllamaHost);
    if (savedAiModel) setAiModel(savedAiModel);
    if (savedAiTemp) setAiTemperature(savedAiTemp);
    if (savedPrompt) setAiSystemPrompt(savedPrompt);
  }, []);

  function handleQRISUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrisImage(reader.result as string);
        localStorage.setItem("qris_image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSaveAllSettings(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    localStorage.setItem("store_name", storeName);
    localStorage.setItem("store_address", storeAddress);
    localStorage.setItem("store_phone", storePhone);
    localStorage.setItem("store_email", storeEmail);
    localStorage.setItem("qris_image", qrisImage);
    localStorage.setItem("bank_name", bankName);
    localStorage.setItem("bank_account_no", bankAccountNo);
    localStorage.setItem("bank_account_holder", bankAccountHolder);
    localStorage.setItem("tax_rate", taxRate);

    localStorage.setItem("ollama_host", ollamaHost);
    localStorage.setItem("ai_model", aiModel);
    localStorage.setItem("ai_temperature", aiTemperature);
    localStorage.setItem("ai_system_prompt", aiSystemPrompt);

    setNotification("Seluruh Parameter Sistem, AI Assistant, & Pembayaran Berhasil Disimpan!");
    setTimeout(() => setNotification(""), 4000);
    setSubmitting(false);
  }

  const tabs = [
    { id: "identity", label: "Identitas Toko & Struk", icon: Store },
    { id: "payment", label: "Pembayaran QRIS & Bank", icon: QrCode },
    { id: "tax_currency", label: "Pajak, Currency & Stok", icon: DollarSign },
    { id: "server", label: "Server & MinIO Storage", icon: Cloud },
    { id: "ai", label: "AI Assistant & Ollama LLM", icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" /> Executive System Parameters Hub
          </h1>
          <p className="text-xs text-slate-400">Pusat Konfigurasi Identitas Toko, QRIS & Bank, Pajak PPN, MinIO, & AI Assistant Ollama LLM</p>
        </div>

        <button
          onClick={handleSaveAllSettings}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" /> {submitting ? "Menyimpan..." : "Simpan Semua Parameter"}
        </button>
      </div>

      {/* Category Tab Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isSel ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-6 text-xs">
        {/* Tab 1: Identitas Toko & Struk Thermal */}
        {activeTab === "identity" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" /> Profil Toko & Header / Footer Struk POS
              </h3>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                Identity Profile
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" /> Nama Perusahaan / Toko *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> No. Telepon Customer Support *
                </label>
                <input
                  type="text"
                  required
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Resmi Perusahaan *
                </label>
                <input
                  type="email"
                  required
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Alamat Lengkap Toko Cabang Utama *
                </label>
                <input
                  type="text"
                  required
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <label className="font-bold text-slate-300 block">Teks Pesan Footer Struk Thermal Kasir</label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* Tab 2: QRIS Toko & Rekening Bank Transfer */}
        {activeTab === "payment" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Card: QRIS Image Setup */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" /> Gambar Barcode QRIS Toko
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Aktif di POS
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="w-44 h-44 rounded-xl bg-white p-2 border border-slate-700 flex items-center justify-center overflow-hidden relative shadow-lg">
                  {qrisImage ? (
                    <img src={qrisImage} alt="Barcode QRIS Toko" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-24 h-24 text-slate-400" />
                  )}
                </div>

                <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md">
                  <Upload className="w-4 h-4" /> Upload Gambar QRIS Baru
                  <input type="file" accept="image/*" onChange={handleQRISUpload} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-500 text-center">Format PNG/JPG. Gambar ini akan muncul di modal POS saat pembayaran QRIS.</p>
              </div>
            </div>

            {/* Right Card: Bank Transfer Setup */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" /> Rekening Bank Transfer Pembayaran
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                  Aktif di POS
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Nama Bank Transfer *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bank BCA / Mandiri / BRI"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Nomor Rekening Bank *</label>
                  <input
                    type="text"
                    required
                    placeholder="8830-1928-441"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono font-bold text-blue-400 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Atas Nama Pemilik Rekening *</label>
                  <input
                    type="text"
                    required
                    placeholder="PT ERP POS ENTERPRISE"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pajak PPN, Mata Uang, & Threshold Stok */}
        {activeTab === "tax_currency" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" /> Tarif Pajak PPN, Currency, & Threshold Alert
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                Tax & Inventory Default
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" /> Tarif Pajak PPN Default (%) *
                </label>
                <input
                  type="number"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Mata Uang Utama Sistem *
                </label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="IDR - Rupiah (Rp)">IDR - Indonesian Rupiah (Rp)</option>
                  <option value="USD - US Dollar ($)">USD - US Dollar ($)</option>
                  <option value="SGD - Singapore Dollar (S$)">SGD - Singapore Dollar (S$)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" /> Prefix Nomor Struk Transaksi POS *
                </label>
                <input
                  type="text"
                  required
                  value={orderPrefix}
                  onChange={(e) => setOrderPrefix(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-rose-400" /> Minimum Stock Alert Default (Pcs) *
                </label>
                <input
                  type="number"
                  required
                  value={defaultMinStock}
                  onChange={(e) => setDefaultMinStock(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Server, MinIO Storage, & Timezone */}
        {activeTab === "server" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-purple-400" /> Server Connection & MinIO S3 Storage Parameters
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                Infrastructure Config
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">MinIO S3 Object Storage Endpoint *</label>
                <input
                  type="text"
                  required
                  value={minioEndpoint}
                  onChange={(e) => setMinioEndpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Default S3 Bucket Name *</label>
                <input
                  type="text"
                  required
                  value={minioBucket}
                  onChange={(e) => setMinioBucket(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Timezone Sistem ERP *</label>
                <input
                  type="text"
                  required
                  value={systemTimezone}
                  onChange={(e) => setSystemTimezone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Jadwal Auto Backup Database PostgreSQL *</label>
                <input
                  type="text"
                  required
                  value={autoBackupSchedule}
                  onChange={(e) => setAutoBackupSchedule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: AI Assistant & Ollama LLM Configuration (Duplicated / Centralized) */}
        {activeTab === "ai" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" /> Konfigurasi AI Assistant & Local Ollama LLM Engine
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> AI Parameter Sync
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" /> Endpoint Ollama LLM Host *
                </label>
                <input
                  type="text"
                  required
                  value={ollamaHost}
                  onChange={(e) => setOllamaHost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">Gunakan http://host.docker.internal:11434 untuk Mac Ollama local host.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-400" /> Pilih Model AI Ollama *
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="llama3.2:3b">llama3.2:3b (Rekomendasi Cepat & Ringan)</option>
                  <option value="mistral">mistral:7b (Analisis Eksekutif)</option>
                  <option value="gemma:2b">gemma:2b (Respons Singkat)</option>
                  <option value="deepseek-r1:7b">deepseek-r1:7b (Penalar Kompleks)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> Temperature AI (Kreativitas vs Presisi) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  required
                  value={aiTemperature}
                  onChange={(e) => setAiTemperature(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">Nilai 0.1 - 0.3 untuk jawaban presisi angka, 0.7 - 0.9 untuk saran kreatif.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Data Mart Aggregation Snapshot Refresh Rate *
                </label>
                <input
                  type="text"
                  disabled
                  value={dataMartRefreshRate}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 font-mono text-emerald-400 font-bold cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500">Data Mart pre-calculated snapshot otomatis diperbarui tiap 5 menit (kecepatan &lt;1ms query).</p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <label className="font-bold text-slate-300 block">System Prompt / Personifikasi AI Assistant</label>
              <textarea
                rows={3}
                value={aiSystemPrompt}
                onChange={(e) => setAiSystemPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-sans focus:border-blue-500 focus:outline-none text-xs"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
