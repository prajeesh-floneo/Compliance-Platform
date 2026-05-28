"use client";

import { Bell, Search, User2 } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center gap-4">
      <div className="flex-1 max-w-md relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          className="input pl-9"
          placeholder="Search requirements, documents, evidence…"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
            <User2 className="h-4 w-4" />
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium text-slate-800">Elena Ramírez</div>
            <div className="text-[11px] text-slate-500">Admin · Compliance</div>
          </div>
        </div>
      </div>
    </header>
  );
}
