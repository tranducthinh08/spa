"use client";

import React from "react";
import { Crown, Heart, ShieldAlert, Award, Phone, Calendar, Sparkles } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";

interface CustomerHeaderProps {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    membershipTier: string;
    loyaltyPoints: number;
    healthNotes?: string | null;
    createdAt: Date | string;
    customerPackages?: any[];
    customerAppointments?: any[];
  };
}

export function CustomerMasterHeader({ customer }: CustomerHeaderProps) {
  const isRoyal = customer.membershipTier === "ROYAL_VIP";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-xs p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Profile Anchor */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#1B3B2B] text-[#FED488] font-serif font-bold text-2xl flex items-center justify-center border-2 border-[#C5A059] shadow-md">
              {customer.name.charAt(0)}
            </div>
            {isRoyal && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white p-1 rounded-full shadow-sm">
                <Crown className="w-4 h-4" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl text-[#032517]">
                {customer.name}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isRoyal
                    ? "bg-[#FED488] text-[#775A19] border border-[#C5A059]"
                    : "bg-stone-200 text-stone-800"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {customer.membershipTier}
              </span>
            </div>
            <div className="text-xs text-[#424843] flex flex-wrap items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#775A19]" />
                {customer.phone}
              </span>
              <span>•</span>
              <span>{customer.email}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stats Panel */}
        <div className="flex items-center gap-6 bg-[#FAF7F2] px-5 py-3 rounded-xl border border-[#E5E2DD]">
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#775A19]">
              Điểm Thưởng Ngự Y
            </div>
            <div className="text-lg font-bold text-[#032517] flex items-center gap-1">
              <Award className="w-4 h-4 text-[#C5A059]" />
              {customer.loyaltyPoints.toLocaleString()} pts
            </div>
          </div>

          <div className="h-8 w-px bg-[#E5E2DD]" />

          <div>
            <div className="text-[10px] uppercase font-semibold text-[#775A19]">
              Thẻ Liệu Trình Đang Có
            </div>
            <div className="text-lg font-bold text-[#032517]">
              {customer.customerPackages?.length || 0} Gói
            </div>
          </div>

          <div className="h-8 w-px bg-[#E5E2DD]" />

          <div>
            <div className="text-[10px] uppercase font-semibold text-[#775A19]">
              Tổng Ca Trị Liệu
            </div>
            <div className="text-lg font-bold text-emerald-800">
              {customer.customerAppointments?.length || 0} Buổi
            </div>
          </div>
        </div>
      </div>

      {/* Clinical & Health Alert Ribbon */}
      {customer.healthNotes && (
        <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-950">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-900 mr-1">Cảnh Báo Lâm Sàng & Chỉ Định Ngự Y:</span>
            <span>{customer.healthNotes}</span>
          </div>
        </div>
      )}
    </div>
  );
}
