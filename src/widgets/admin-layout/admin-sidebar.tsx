"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Contact,
  Receipt,
  Sparkles,
  FlaskConical,
  Users,
  Settings,
  LogOut,
  ArrowLeftRight,
  X,
  Check,
} from "lucide-react";
import { useRoleContext, DEMO_PERSONAS, RoleType } from "@/shared/components/role-switcher-bar";
import { logoutAction } from "@/features/auth/actions/auth-actions";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentPersona, setPersona, selectedBranch } = useRoleContext();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getBranchBadge = (b: string) => {
    switch (b) {
      case "LANG_HA": return "PLM - HN01";
      case "SON_TAY": return "PLM - HN02";
      case "OCEAN_PARK": return "PLM - HN03";
      case "HAI_PHONG": return "PLM - HP01";
      default: return currentPersona.role === "SUPER_ADMIN" ? "PLM - HQ" : "PLM - HN01";
    }
  };

  const getRoleBadgeLabel = (role: RoleType) => {
    switch (role) {
      case "SUPER_ADMIN": return "Hội Sở Điều Hành";
      case "BRANCH_MANAGER": return "Quản lý Chi nhánh";
      case "RECEPTIONIST": return "Lễ Tân Điều Phối";
      case "THERAPIST": return "KTV Ngự Y Cung Đình";
      default: return "Cán Bộ Quản Trị";
    }
  };

  // RBAC Permission Map for Sidebar Menu
  const allNavItems = [
    {
      href: "/admin/dashboard",
      label: "Tổng quan Chuỗi",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] as RoleType[],
    },
    {
      href: "/admin/appointments",
      label: "Điều phối Lịch hẹn",
      icon: CalendarDays,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"] as RoleType[],
    },
    {
      href: "/admin/customers",
      label: "Hồ sơ Khách & Thẻ Liệu Trình",
      icon: Contact,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"] as RoleType[],
    },
    {
      href: "/admin/dashboard?view=pos",
      label: "Thu ngân POS",
      icon: Receipt,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"] as RoleType[],
    },
    {
      href: "/admin/services",
      label: "Danh Mục Dịch Vụ",
      icon: Sparkles,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"] as RoleType[],
    },
    {
      href: "/admin/inventory",
      label: "Kho Tinh dầu & Định mức",
      icon: FlaskConical,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] as RoleType[],
    },
    {
      href: "/admin/users",
      label: "Nhân sự & Hoa hồng",
      icon: Users,
      roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] as RoleType[],
    },
  ];

  // Filter items based strictly on logged-in role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(currentPersona.role)
  );

  return (
    <aside className="w-64 h-full bg-[#112C1E] border-r border-[#C5A059]/20 flex flex-col justify-between select-none text-[#FAF7F2] relative">
      {/* Top Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-5 pb-4 flex items-center justify-between border-b border-[#FAF7F2]/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            {/* Golden Logo Emblem */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FED488] to-[#C5A059] text-[#112C1E] flex items-center justify-center shadow-md shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 stroke-[#112C1E]"
              >
                <path d="M12 3c-1.5 3-4.5 5.5-8 6 3 2 4.5 5 4 8.5 2.5-2 5.5-2 8 0-.5-3.5 1-6.5 4-8.5-3.5-.5-6.5-3-8-6z" />
                <circle cx="12" cy="13" r="2" />
              </svg>
            </div>
            <div>
              <div className="font-serif font-bold text-base text-[#FAF7F2] tracking-wide leading-tight group-hover:text-[#FED488] transition">
                Plumeria Spa
              </div>
              <div className="text-[10px] tracking-widest text-[#C5A059] font-bold uppercase mt-0.5">
                BY ROYAL ERP
              </div>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#83A590] hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Branch / Role Status Pill */}
        <div className="px-5 py-3.5">
          <div className="bg-[#0A1F14] border border-[#C5A059]/25 rounded-xl px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-[#83A590] font-medium">
                {getRoleBadgeLabel(currentPersona.role)}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#1B3B2B] text-[#FED488] border border-[#C5A059]/30">
              {getBranchBadge(selectedBranch)}
            </span>
          </div>
        </div>

        {/* Navigation List (Filtered by Role) */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href.includes("?view=pos")
                ? pathname === "/admin/dashboard" && typeof window !== "undefined" && window.location.search.includes("pos")
                : pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#FAF7F2]/10 text-[#FED488] border-r-2 border-[#C5A059] shadow-xs font-bold"
                    : "text-[#83A590] hover:text-[#FAF7F2] hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#FED488]" : "text-[#83A590]"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher Popover Menu */}
      {showRoleMenu && (
        <div className="absolute bottom-20 left-3 right-3 bg-[#0A1F14] border border-[#C5A059]/40 rounded-2xl p-2.5 shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 mb-1">
            <span className="text-[10px] font-bold text-[#FED488] uppercase tracking-wider">
              Chuyển đổi Tài khoản
            </span>
            <button
              onClick={() => setShowRoleMenu(false)}
              className="text-[#83A590] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {DEMO_PERSONAS.map((p) => {
            const isCurrent = currentPersona.role === p.role;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPersona(p);
                  setShowRoleMenu(false);
                }}
                className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition ${
                  isCurrent
                    ? "bg-[#1B3B2B] text-[#FED488] border border-[#C5A059]/30"
                    : "hover:bg-white/10 text-[#FAF7F2]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#C5A059]/30">
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-tight">{p.name}</p>
                    <p className="text-[10px] text-[#83A590] truncate">{p.title}</p>
                  </div>
                </div>
                {isCurrent && <Check className="w-3.5 h-3.5 text-[#FED488] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Profile Card */}
      <div className="p-3 border-t border-[#FAF7F2]/10 bg-[#0A1F14]/70">
        <div className="p-2.5 rounded-2xl bg-[#112C1E] border border-[#C5A059]/20 flex items-center justify-between">
          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Nhấn để đổi vai trò nhanh"
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FED488] to-[#C5A059] text-[#112C1E] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden border border-[#C5A059]/40 group-hover:ring-1 group-hover:ring-[#FED488]">
              {currentPersona.avatar ? (
                <img src={currentPersona.avatar} alt={currentPersona.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentPersona.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#FAF7F2] truncate leading-tight group-hover:text-[#FED488] transition">
                {currentPersona.name}
              </div>
              <div className="text-[10px] text-[#83A590] truncate mt-0.5">
                {currentPersona.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 pl-1">
            {/* Role switch toggle button */}
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              title="Chuyển tài khoản nhân sự"
              className={`p-1.5 rounded-lg text-[#83A590] hover:text-[#FED488] hover:bg-white/10 transition ${
                showRoleMenu ? "bg-white/10 text-[#FED488]" : ""
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Settings button - Only for SUPER_ADMIN and BRANCH_MANAGER */}
            {(currentPersona.role === "SUPER_ADMIN" || currentPersona.role === "BRANCH_MANAGER") && (
              <Link
                href="/admin/users"
                title="Cài đặt nhân sự"
                className="p-1.5 rounded-lg text-[#83A590] hover:text-[#FED488] hover:bg-white/10 transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Logout button */}
            <button
              onClick={() => logoutAction()}
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-[#83A590] hover:text-red-400 hover:bg-red-950/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
