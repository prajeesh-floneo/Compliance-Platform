"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";
import type { User } from "@/lib/types";

export function LoginForm({
  users,
  next,
}: {
  users: User[];
  next?: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, password }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(j.error ?? "Sign-in failed");
      return;
    }
    const dest = next && next.startsWith("/") ? next : "/";
    router.replace(dest);
    router.refresh();
  };

  const selected = users.find((u) => u.id === userId);

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label className="label">User</label>
        <select
          className="input"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} &mdash; {u.role}
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-[11px] text-slate-500 mt-1">
            {selected.email} &middot; {selected.department}
          </p>
        )}
      </div>
      <div>
        <label className="label">Password</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {error}
        </div>
      )}
      <button
        type="submit"
        className="btn-primary w-full justify-center"
        disabled={busy || !userId || !password}
      >
        <LogIn className="h-4 w-4" />
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
