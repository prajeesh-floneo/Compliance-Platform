"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  FileText,
  Paperclip,
  ClipboardList,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "@/lib/types";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requirements", label: "Requirements", icon: ListChecks },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/evidence", label: "Evidence", icon: Paperclip },
  { href: "/action-plans", label: "Action Plans", icon: ClipboardList },
  { href: "/approvals", label: "Approvals", icon: CheckCircle2 },
  { href: "/ai-analysis", label: "AI Analysis", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = nav.filter((n) => !n.adminOnly || role === "Admin");
  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2">
        <div className="h-9 w-9 rounded-md bg-brand-600 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">
            Compliance Platform
          </div>
          <div className="text-[11px] text-slate-400">
            Documentation Automation
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500">
        v0.1 MVP · Mock data
      </div>
    </aside>
  );
}
