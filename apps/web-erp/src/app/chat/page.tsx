"use client";

import { useState } from "react";
import { Search, Send, Paperclip, CheckCheck, MessageSquare, Phone, MoreVertical } from "lucide-react";

export default function LiveChatPage() {
  const [activeChat] = useState({
    name: "Budi Santoso",
    phone: "+628123456789",
    source: "WhatsApp (WAHA API)",
    messages: [
      { id: "1", sender: "customer", text: "Halo Kak! Apakah pesanan roti saya #ORD-20260807-8F3A sudah dikirim?", time: "10:15" },
      { id: "2", sender: "staff", text: "Halo Kak Budi! Pesanan sedang dalam perjalanan oleh kurir toko kami.", time: "10:16" },
      { id: "3", sender: "staff", text: "Berikut lampiran e-receipt struk belanja Anda.", time: "10:16", attachment: "Struk_ORD-8F3A.pdf" },
    ],
  });

  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex bg-slate-950 overflow-hidden">
      {/* Left Inbox Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/60">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100">Inbox Chat & WhatsApp</h2>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
              WAHA Online
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari percakapan WhatsApp..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          <div className="p-3 bg-blue-600/10 border-l-2 border-blue-500 cursor-pointer space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-100">Budi Santoso</span>
              <span className="text-[10px] text-slate-400">10:16</span>
            </div>
            <p className="text-xs text-slate-400 truncate">Berikut lampiran e-receipt struk...</p>
            <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px]">WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Right Chat View */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Active Chat Header */}
        <div className="h-16 px-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">{activeChat.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono">{activeChat.phone} • {activeChat.source}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {activeChat.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "staff" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md p-3 rounded-2xl text-xs space-y-1 ${
                  m.sender === "staff"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                <p>{m.text}</p>
                {m.attachment && (
                  <div className="p-2 rounded bg-slate-950/40 border border-white/10 flex items-center gap-2 text-[11px] font-mono">
                    <Paperclip className="w-3.5 h-3.5" /> {m.attachment}
                  </div>
                )}
                <div className="flex items-center justify-end gap-1 text-[10px] opacity-70 pt-1">
                  <span>{m.time}</span>
                  {m.sender === "staff" && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Bar */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center gap-3">
          <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Tulis pesan balasan WhatsApp via WAHA API..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors">
            <Send className="w-3.5 h-3.5" /> Kirim WA
          </button>
        </div>
      </div>
    </div>
  );
}
