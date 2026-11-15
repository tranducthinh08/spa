"use client";

import React from "react";
import { DollarSign, Wallet, QrCode, Sparkles } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";

interface PosShiftSummaryBarProps {
  invoices: any[];
}

export function PosShiftSummaryBar({ invoices }: PosShiftSummaryBarProps) {
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
  const cashAmount = invoices
    .filter((inv) => inv.paymentMethod === "CASH")
    .reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
  const transferAmount = invoices
    .filter((inv) => inv.paymentMethod === "BANK_TRANSFER" || inv.paymentMethod === "CARD")
    .reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
  const packageRedemptions = invoices.filter(
    (inv) => inv.paymentMethod === "PACKAGE_REDEMPTION"
  ).length;

  const kpis = [
    {
      title: "Tổng Thu Ca Trực",
      value: formatVND(totalRevenue),
      sub: `${invoices.length} Giao dịch ghi nhận`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      title: "Tiền Mặt Tại Két",
      value: formatVND(cashAmount),
      sub: "Cần đối soát cuối ca",
      icon: Wallet,
      color: "bg-amber-50 text-amber-900 border-amber-200",
      iconBg: "bg-amber-600 text-white",
    },
    {
      title: "Chuyển Khoản & Quẹt Thẻ",
      value: formatVND(transferAmount),
      sub: "VietQR 24/7 & Thẻ POS",
      icon: QrCode,
      color: "bg-blue-50 text-blue-900 border-blue-200",
      iconBg: "bg-blue-600 text-white",
    },
    {
      title: "Trừ Thẻ Liệu Trình",
      value: `${packageRedemptions} Buổi Trừ Thẻ`,
      sub: "Thẻ hoàng cung 16 buổi",
      icon: Sparkles,
      color: "bg-purple-50 text-purple-900 border-purple-200",
      iconBg: "bg-purple-600 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${kpi.color} bg-white shadow-xs flex items-center justify-between transition-all hover:shadow-sm`}
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {kpi.title}
              </div>
              <div className="text-xl font-serif font-bold text-[#032517] mt-0.5">
                {kpi.value}
              </div>
              <div className="text-[10px] text-stone-400 font-medium mt-0.5">
                {kpi.sub}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg} shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
