"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, RefreshCw, User2 } from "lucide-react";
import type { User } from "@/lib/types";

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const signOut = async () => {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setBusy(false);
    router.replace("/login");
    router.refresh();
  };

  const switchUser = async () => {
    // Logout then route to /login so a different user can pick a role.
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-3 border-l border-slate-200 hover:bg-slate-50 rounded-r pr-2 py-1"
      >
        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
          {initials || <User2 className="h-4 w-4" />}
        </div>
        <div className="text-sm leading-tight text-left">
          <div className="font-medium text-slate-800">{user.name}</div>
          <div className="text-[11px] text-slate-500">
            {user.role} &middot; {user.department}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="text-xs text-slate-500">Signed in as</div>
            <div className="text-sm font-medium text-slate-800 truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {user.email}
            </div>
            <span className="inline-block mt-1.5 badge-blue text-[10px]">
              {user.role}
            </span>
          </div>
          <button
            onClick={switchUser}
            disabled={busy}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Switch user
          </button>
          <button
            onClick={signOut}
            disabled={busy}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 text-left border-t border-slate-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
