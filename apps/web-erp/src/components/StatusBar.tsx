"use client";

export function StatusBar() {
  return (
    <footer className="h-8 bg-slate-950 border-t border-slate-800 fixed bottom-0 right-0 left-64 z-30 px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          10 Go Microservices Online
        </span>
        <span>•</span>
        <span>PostgreSQL 10 DBs Active</span>
        <span>•</span>
        <span>Kafka Event Stream Ready</span>
        <span>•</span>
        <span>MinIO S3 Connected</span>
        <span>•</span>
        <span>WAHA WhatsApp API Online</span>
      </div>
      <div>
        <span>ERP POS Enterprise © 2026</span>
      </div>
    </footer>
  );
}
