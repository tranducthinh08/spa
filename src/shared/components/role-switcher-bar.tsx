"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { quickDemoLoginAction, getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import type { SessionPayload } from "@/features/auth/lib/auth-session";

export type RoleType = "SUPER_ADMIN" | "BRANCH_MANAGER" | "RECEPTIONIST" | "THERAPIST";

export interface Persona {
  id: string;
  name: string;
  role: RoleType;
  title: string;
  branchName: string;
  avatar: string;
  branchCode?: string;
  branchId?: string;
}

export const DEMO_PERSONAS: Persona[] = [
  {
    id: "admin",
    name: "Hoàng Đức Long",
    role: "SUPER_ADMIN",
    title: "Hội Đồng Quản Trị",
    branchName: "Toàn Chuỗi Toàn Quốc",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    branchCode: "ALL",
  },
  {
    id: "manager",
    name: "Vũ Minh Châu",
    role: "BRANCH_MANAGER",
    title: "Giám Đốc Chi Nhánh",
    branchName: "Plumeria Láng Hạ (Flagship)",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    branchCode: "LANG_HA",
  },
  {
    id: "receptionist",
    name: "Lê Thuỳ Linh",
    role: "RECEPTIONIST",
    title: "Lễ Tân Trưởng & POS",
    branchName: "Plumeria Láng Hạ (Flagship)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    branchCode: "LANG_HA",
  },
  {
    id: "therapist",
    name: "Lê Hoài An",
    role: "THERAPIST",
    title: "KTV Ngự Y Cung Đình",
    branchName: "Plumeria Láng Hạ (Flagship)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    branchCode: "LANG_HA",
  },
];

export function createPersonaFromSession(sess?: SessionPayload | null): Persona {
  if (!sess) return DEMO_PERSONAS[0];
  const roleTitles: Record<string, string> = {
    SUPER_ADMIN: "Hội Đồng Quản Trị",
    BRANCH_MANAGER: "Giám Đốc Chi Nhánh",
    RECEPTIONIST: "Lễ Tân Điều Phối & POS",
    THERAPIST: "KTV Ngự Y Cung Đình",
  };
  const defaultAvatars: Record<string, string> = {
    SUPER_ADMIN: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    BRANCH_MANAGER: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    RECEPTIONIST: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    THERAPIST: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
  };
  return {
    id: sess.userId,
    name: sess.name,
    role: (sess.role === "CUSTOMER" ? "SUPER_ADMIN" : sess.role) as RoleType,
    title: roleTitles[sess.role] || sess.role,
    branchName: sess.branchName || (sess.branchCode ? `Plumeria ${sess.branchCode}` : "Hội Sở Toàn Chuỗi"),
    avatar: defaultAvatars[sess.role] || defaultAvatars.THERAPIST,
    branchCode: sess.branchCode || undefined,
    branchId: sess.branchId || undefined,
  };
}

interface RoleContextValue {
  currentPersona: Persona;
  setPersona: (p: Persona) => void;
  selectedBranch: string;
  setSelectedBranch: (b: string) => void;
}

const RoleContext = createContext<RoleContextValue>({
  currentPersona: DEMO_PERSONAS[0],
  setPersona: () => {},
  selectedBranch: "ALL",
  setSelectedBranch: () => {},
});

export const useRoleContext = () => useContext(RoleContext);

export function RoleProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: SessionPayload | null;
}) {
  const isSuperAdmin = initialSession?.role === "SUPER_ADMIN";
  const staffBranch = initialSession?.branchCode || initialSession?.branchId || "LANG_HA";

  const [currentPersona, setCurrentPersona] = useState<Persona>(() =>
    createPersonaFromSession(initialSession)
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    isSuperAdmin ? "ALL" : staffBranch
  );

  useEffect(() => {
    const applySession = (sess: SessionPayload | null) => {
      if (!sess) return;
      const persona = createPersonaFromSession(sess);
      setCurrentPersona(persona);
      if (sess.role !== "SUPER_ADMIN") {
        const targetBranch = sess.branchCode || sess.branchId || "LANG_HA";
        setSelectedBranch(targetBranch);
        localStorage.setItem("plumeria_branch", targetBranch);
      } else {
        const saved = localStorage.getItem("plumeria_branch");
        setSelectedBranch(saved || "ALL");
      }
    };

    if (initialSession) {
      applySession(initialSession);
    } else {
      getCurrentSessionAction().then((sess) => {
        if (sess) applySession(sess);
      });
    }
  }, [initialSession]);

  const handleSetPersona = async (p: Persona) => {
    setCurrentPersona(p);
    localStorage.setItem("plumeria_persona_id", p.id);
    const res = await quickDemoLoginAction(p.role);
    if (res.success && res.data) {
      if (p.role !== "SUPER_ADMIN") {
        const targetBranch = res.data.branchCode || res.data.branchId || "LANG_HA";
        setSelectedBranch(targetBranch);
        localStorage.setItem("plumeria_branch", targetBranch);
      } else {
        const savedBranch = localStorage.getItem("plumeria_branch") || "ALL";
        setSelectedBranch(savedBranch);
      }
      if (res.data.redirectTo) {
        window.location.href = res.data.redirectTo;
        return;
      }
    } else if (!res.success) {
      alert(res.error || "Không thể chuyển đổi tài khoản.");
    }
    window.location.reload();
  };

  const handleSetBranch = (b: string) => {
    if (currentPersona.role !== "SUPER_ADMIN") {
      return;
    }
    setSelectedBranch(b);
    localStorage.setItem("plumeria_branch", b);
  };

  return (
    <RoleContext.Provider
      value={{
        currentPersona,
        setPersona: handleSetPersona,
        selectedBranch,
        setSelectedBranch: handleSetBranch,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function RoleSwitcherBar() {
  return null;
}
