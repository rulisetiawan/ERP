"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Store, Sparkles, Settings, X, CheckCircle2, Cpu } from "lucide-react";
import { API_BASE_URLS, fetchFromBackend } from "@/lib/api";

export function Header() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // AI Config State
  const [provider, setProvider] = useState("ollama");
  const [baseUrl, setBaseUrl] = useState("http://host.docker.internal:11434");
  const [defaultModel, setDefaultModel] = useState("llama3");
  const [apiKey, setApiKey] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [saving, setSaving] = useState(false);
  const [aiStatusText, setAiStatusText] = useState("Local Ollama AI Connected");

  useEffect(() => {
    loadAIConfig();
  }, []);

  async function loadAIConfig() {
    const data = await fetchFromBackend<any>(`${API_BASE_URLS.ai}/config`);
    if (data) {
      setProvider(data.provider || "ollama");
      setBaseUrl(data.base_url || "http://host.docker.internal:11434");
      setDefaultModel(data.default_model || "llama3");
      setApiKey(data.api_key || "");
      setTemperature(data.temperature ? String(data.temperature) : "0.7");
      setAiStatusText(`${data.provider === "ollama" ? "Local Ollama AI" : data.provider.toUpperCase()} (${data.default_model})`);
    }
  }

  async function handleSaveAIConfig(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URLS.ai}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          base_url: baseUrl,
          default_model: defaultModel,
          api_key: apiKey,
          temperature: parseFloat(temperature) || 0.7,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success !== false) {
        setIsConfigModalOpen(false);
        setAiStatusText(`${provider === "ollama" ? "Local Ollama AI" : provider.toUpperCase()} (${defaultModel})`);
        setNotification("Konfigurasi AI berhasil disimpan & terhubung!");
        setTimeout(() => setNotification(""), 4000);
      } else {
        alert(json.message || "Gagal menyimpan konfigurasi AI.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke AI Assistant Service.");
    }
    setSaving(false);
  }

  return (
    <>
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 fixed top-0 right-0 left-64 z-30 px-6 flex items-center justify-between">
        {/* Global Search Bar */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, SKU, karyawan (Ctrl+K)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Toast Notification */}
          {notification && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {notification}
            </div>
          )}

          {/* Clickable AI Status Badge */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs text-blue-400 font-semibold cursor-pointer transition-all shadow-sm group"
            title="Klik untuk mengubah Pengaturan Engine AI (Ollama / Gemini / OpenAI)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse group-hover:scale-110 transition-transform" />
            <span>{aiStatusText}</span>
            <Settings className="w-3 h-3 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity ml-1" />
          </button>

          {/* Outlet Scope Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Outlet Jakarta Pusat</span>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white">
              SA
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-slate-200">Super Administrator</p>
              <p className="text-[10px] text-emerald-400 font-mono">super_admin@erp.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive AI Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" /> Pengaturan Koneksi AI Engine & Local LLM
                </h3>
                <p className="text-xs text-slate-400">Konfigurasi langsung dari Frontend tanpa mengedit file .env backend</p>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAIConfig} className="space-y-4 text-xs">
              {/* 1. AI Provider */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">AI Provider Engine *</label>
                  <p className="text-[11px] text-slate-400">Pilih penyedia layanan AI</p>
                </div>
                <div className="col-span-2">
                  <select
                    value={provider}
                    onChange={(e) => {
                      setProvider(e.target.value);
                      if (e.target.value === "ollama") setBaseUrl("http://host.docker.internal:11434");
                      if (e.target.value === "gemini") setBaseUrl("https://generativelanguage.googleapis.com");
                      if (e.target.value === "openai") setBaseUrl("https://api.openai.com/v1");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ollama">Local Ollama AI (Self-Hosted / Off-Grid)</option>
                    <option value="gemini">Google Gemini API (Cloud LLM)</option>
                    <option value="openai">OpenAI GPT-4o (Cloud LLM)</option>
                  </select>
                </div>
              </div>

              {/* 2. Base URL */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">AI Host Base URL *</label>
                  <p className="text-[11px] text-slate-400">Endpoint API AI Engine</p>
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="http://host.docker.internal:11434"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Default Model */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Model Name *</label>
                  <p className="text-[11px] text-slate-400">Nama model AI yang dipakai</p>
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="llama3 / mistral / gemini-1.5-flash"
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. API Key (Optional for Ollama) */}
              <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800/80 pb-3">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">API Secret Key</label>
                  <p className="text-[11px] text-slate-400">Opsional untuk Gemini/OpenAI</p>
                </div>
                <div className="col-span-2">
                  <input
                    type="password"
                    placeholder="AIzaSy... (Kosongkan jika Local Ollama)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Temperature */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                  <label className="text-slate-200 font-bold block">Temperature Kreativitas</label>
                  <p className="text-[11px] text-slate-400">Rentang 0.0 (Presisi) s/d 1.0</p>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  {saving ? "Menyimpan..." : "Simpan Konfigurasi AI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
