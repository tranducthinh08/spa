"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Sparkles,
  Building2,
  Bell,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { AdminSidebar } from "./admin-sidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

const BRANCH_LABELS: Record<string, string> = {
  ALL: "Hội Sở Điều Hành Toàn Chuỗi",
  LANG_HA: "Plumeria Láng Hạ",
  OCEAN_PARK: "Plumeria Ocean Park",
  CAU_GIAY: "Plumeria Cầu Giấy",
  SON_TAY: "Plumeria Sơn Tây",
  HAI_PHONG: "Plumeria Hải Phòng",
  BAC_NINH: "Plumeria Bắc Ninh",
  HCM_TAN_BINH: "Plumeria Tân Bình",
  HCM_BINH_THANH: "Plumeria Bình Thạnh",
};

const BRANCH_OPTIONS = [
  { value: "ALL", label: "Toàn Chuỗi 7 Cơ Sở" },
  { value: "LANG_HA", label: "Plumeria Láng Hạ (Flagship)" },
  { value: "OCEAN_PARK", label: "Plumeria Ocean Park Luxury" },
  { value: "CAU_GIAY", label: "Plumeria Cầu Giấy" },
  { value: "SON_TAY", label: "Plumeria Sơn Tây Luxury" },
  { value: "HAI_PHONG", label: "Plumeria Hải Phòng" },
  { value: "BAC_NINH", label: "Plumeria Bắc Ninh" },
  { value: "HCM_TAN_BINH", label: "Plumeria Tân Bình - TP.HCM" },
  { value: "HCM_BINH_THANH", label: "Plumeria Bình Thạnh - TP.HCM" },
];

export function AdminShell({ children }: AdminShellProps) {
  const { selectedBranch, setSelectedBranch } = useRoleContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FCF9F4] flex">
      {/* 1. Desktop Fixed Vertical Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 z-40">
        <AdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Container (offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <header className="h-16 bg-[#FAF7F2] border-b border-[#E5E2DD] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Left: Mobile hamburger & Breadcrumb status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#E5E2DD] bg-white text-[#112C1E] hover:bg-[#FAF7F2]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-[#424843]">
              <span className="hidden sm:inline text-stone-400">Không Gian Quản Trị</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-stone-300" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#112C1E]/5 text-[#112C1E] font-semibold border border-[#112C1E]/10">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>
                  {selectedBranch === "ALL" ? "Hội Sở Điều Hành Toàn Chuỗi" : `Cơ Sở: ${BRANCH_LABELS[selectedBranch] || selectedBranch}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Branch Selector & Shortcut to Public Services */}
          <div className="flex items-center gap-3">
            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#775A19] hidden sm:inline" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-white border border-[#E5E2DD] text-[#032517] rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C5A059] shadow-2xs"
              >
                {BRANCH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shortcut to Customer Services page */}
            <Link
              href="/dich-vu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112C1E] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FED488]" />
              <span className="hidden sm:inline">Trang Dịch Vụ</span>
              <ExternalLink className="w-3 h-3 text-[#C5A059]" />
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
