"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, CreditCard, Sparkles, DollarSign } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";

interface ExecutiveKpiProps {
  totalRevenue: number;
  todayRevenue?: number;
  revenueGrowth?: number;
  occupancyRate: number;
  activePackagesCount: number;
  totalCommissions: number;
  totalRooms: number;
  occupiedRooms: number;
}

export function ExecutiveKpis({
  totalRevenue,
  todayRevenue = 0,
  revenueGrowth = 0,
  occupancyRate,
  activePackagesCount,
  totalCommissions,
  totalRooms,
  occupiedRooms,
}: ExecutiveKpiProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Doanh Thu Toàn Chuỗi */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E2DD] shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#775A19] uppercase tracking-wider">
            Doanh Thu Toàn Chuỗi
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FED488]/40 text-[#775A19] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-serif text-[#032517]">
          {formatVND(totalRevenue)}
        </div>

        {/* Dynamic Mathematical Comparison */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {revenueGrowth > 0 ? (
            <div className="inline-flex items-center gap-1 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>+{revenueGrowth}% so với hôm qua</span>
            </div>
          ) : revenueGrowth < 0 ? (
            <div className="inline-flex items-center gap-1 text-red-700">
              <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              <span>{revenueGrowth}% so với hôm qua</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-stone-500">
              <Minus className="w-3.5 h-3.5 text-stone-400" />
              <span>0.0% so với hôm qua</span>
            </div>
          )}

          {todayRevenue > 0 && (
            <span className="text-[10px] text-stone-400 font-normal">
              ({formatVND(todayRevenue)} hôm nay)
            </span>
          )}
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-[#FED488]/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Card 2: Bán Thẻ Mới */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E2DD] shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#775A19] uppercase tracking-wider">
            Thẻ Liệu Trình Kích Hoạt
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#1B3B2B]/10 text-[#1B3B2B] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-serif text-[#032517]">
          {activePackagesCount} Thẻ Hoàng Gia
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#775A19] font-medium">
          <span>Gói 10 & 16 buổi phòng ngừa đột quỵ</span>
        </div>
      </div>

      {/* Card 3: Tỷ Lệ Lấp Đầy */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E2DD] shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#775A19] uppercase tracking-wider">
            Lấp Đầy Cabin & Giường
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-serif text-[#032517]">
          {occupancyRate}%
        </div>
        <div className="mt-2 text-xs text-[#424843]">
          <span className="font-semibold text-[#032517]">{occupiedRooms}</span> / {totalRooms} Cabin & Giường đang có khách
        </div>
      </div>

      {/* Card 4: Hoa Hồng KTV */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E2DD] shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#775A19] uppercase tracking-wider">
            Hoa Hồng KTV Tự Động
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-serif text-[#032517]">
          {formatVND(totalCommissions)}
        </div>
        <div className="mt-2 text-xs text-[#424843]">
          Khấu trừ tự động 10% - 15% theo định mức
        </div>
      </div>
    </div>
  );
}
