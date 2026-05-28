"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/types";
import { can, canAny, type Permission } from "@/lib/permissions";

interface Ctx {
  user: User | null;
}

const UserContext = createContext<Ctx>({ user: null });

export function UserProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): User | null {
  return useContext(UserContext).user;
}

export function useCan(perm: Permission): boolean {
  const u = useCurrentUser();
  return can(u?.role, perm);
}

export function useCanAny(perms: Permission[]): boolean {
  const u = useCurrentUser();
  return canAny(u?.role, perms);
}
