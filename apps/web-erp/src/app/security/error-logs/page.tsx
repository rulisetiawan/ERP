"use client";

import { useState } from "react";
import { AlertOctagon, Terminal, RefreshCw, X, ShieldAlert, CheckCircle2, Copy } from "lucide-react";

interface ErrorLog {
  id: string;
  service: string;
  traceId: string;
  errorCode: string;
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  time: string;
  stackTrace: string;
  status: "OPEN" | "RESOLVED";
}

export default function ErrorLogsPage() {
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [notification, setNotification] = useState("");

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    {
      id: "err-101",
      service: "inventory-service",
      traceId: "trace-8f3a-4122-991a",
      errorCode: "ERR_STOCK_DELTA_MISMATCH",
      message: "Opname physical count exceeds total warehouse threshold delta limit (-16 Pcs)",
      severity: "WARNING",
      time: new Date().toLocaleString("id-ID"),
      status: "OPEN",
      stackTrace: `goroutine 42 [running]:
main.AdjustStockOpname(0xc00010e000, 0x10)
  /app/services/inventory-service/service/service.go:142 +0x2b4
main.handleStockAdjustment(0x12a8000, 0xc0000a2000)
  /app/services/inventory-service/main.go:88 +0x90
net/http.HandlerFunc.ServeHTTP(0x1254000, 0x12a8000, 0xc0000a2000)
  /usr/local/go/src/net/http/server.go:2136 +0x44`,
    },
    {
      id: "err-102",
      service: "pos-service",
      traceId: "trace-991a-7721-001c",
      errorCode: "ERR_PAYMENT_PROOF_TIMEOUT",
      message: "MinIO bucket upload socket connection timeout during QRIS payment proof verification",
      severity: "CRITICAL",
      time: new Date(Date.now() - 3600000).toLocaleString("id-ID"),
      status: "OPEN",
      stackTrace: `goroutine 18 [running]:
main.UploadProofImage(0xc000210000, 0x40)
  /app/services/pos-service/service/service.go:210 +0x3a0
main.processCheckoutOrder(0x12a8000, 0xc0001bc000)
  /app/services/pos-service/main.go:112 +0x140`,
    },
    {
      id: "err-103",
      service: "finance-service",
      traceId: "trace-771c-4401-2290",
      errorCode: "ERR_JOURNAL_UNBALANCED",
      message: "Automatic journal debit/credit mismatch: Debit Rp 14.500.000 vs Credit Rp 14.000.000",
      severity: "WARNING",
      time: new Date(Date.now() - 7200000).toLocaleString("id-ID"),
      status: "RESOLVED",
      stackTrace: `goroutine 12 [running]:
main.PostJournalEntry(0xc000188000)
  /app/services/finance-service/service/service.go:95 +0x120`,
    },
  ]);

  function handleMarkResolved(id: string) {
    setErrorLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "RESOLVED" } : l))
    );
    setNotification("Log Error Berhasil Ditandai Sebagai Resolved!");
    setSelectedLog(null);
    setTimeout(() => setNotification(""), 4000);
  }

  function copyStackTrace(text: string) {
    navigator.clipboard.writeText(text);
    setNotification("Stack Trace Berhasil Menyalin Ke Clipboard!");
    setTimeout(() => setNotification(""), 3000);
  }

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
            <AlertOctagon className="w-5 h-5 text-rose-500" /> Real-time Error Logs & Observability Inspector
          </h1>
          <p className="text-xs text-slate-400">Pemantauan Exception, Crash Recovery, & Stack Trace Korelasi Microservices</p>
        </div>

        <button
          onClick={() => setErrorLogs([...errorLogs])}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 shadow-md"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Error Log
        </button>
      </div>

      {/* Error Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Waktu Log</th>
                <th className="p-3">Microservice</th>
                <th className="p-3">Trace ID</th>
                <th className="p-3">Error Code</th>
                <th className="p-3">Pesan Deskripsi Error</th>
                <th className="p-3">Severity</th>
                <th className="p-3 text-center">Stack Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {errorLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/60">
                  <td className="p-3 text-slate-400 text-[11px]">{log.time}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                      {log.service}
                    </span>
                  </td>
                  <td className="p-3 text-blue-400 font-bold">{log.traceId}</td>
                  <td className="p-3 text-amber-400 font-bold">{log.errorCode}</td>
                  <td className="p-3 font-sans text-slate-300 max-w-xs truncate">{log.message}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-sans text-rose-400 hover:text-white flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" /> Stack Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Stack Trace Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-rose-400" /> Go Microservices Stack Trace Inspector
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Trace ID: <span className="text-blue-400 font-bold">{selectedLog.traceId}</span> • Service:{" "}
                  <span className="text-amber-400 font-bold">{selectedLog.service}</span>
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-sans font-medium">
                <strong>Pesan Error:</strong> {selectedLog.message}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1">
                  <span>Stack Trace Output (Golang Runtime Stack):</span>
                  <button
                    onClick={() => copyStackTrace(selectedLog.stackTrace)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Salin Stack Trace
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-[11px] overflow-x-auto h-48">
                  {selectedLog.stackTrace}
                </pre>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              {selectedLog.status === "OPEN" ? (
                <button
                  onClick={() => handleMarkResolved(selectedLog.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Tandai Sebagai Resolved
                </button>
              ) : (
                <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                  ✓ Error Teratasi (Resolved)
                </span>
              )}

              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Tutup Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
