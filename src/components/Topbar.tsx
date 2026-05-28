import { Bell, Search } from "lucide-react";
import { UserMenu } from "./UserMenu";
import type { User } from "@/lib/types";

export function Topbar({ user }: { user: User }) {
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
        <UserMenu user={user} />
      </div>
    </header>
  );
}
