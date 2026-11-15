"use client";

import React, { useState } from "react";
import { Receipt, Search, Printer, Eye, Sparkles, CreditCard, Wallet, QrCode } from "lucide-react";
import { formatVND, formatTimeVN, formatDateVN } from "@/shared/lib/utils";

interface PosInvoiceHistoryProps {
  invoices: any[];
  onSelectInvoice: (invoice: any) => void;
}

export function PosInvoiceHistory({ invoices, onSelectInvoice }: PosInvoiceHistoryProps) {
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("ALL");

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.phone.includes(search);
    const matchMethod = filterMethod === "ALL" || inv.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "PACKAGE_REDEMPTION":
        return { label: "Trừ Thẻ Gói", cls: "bg-purple-100 text-purple-900 border-purple-200" };
      case "BANK_TRANSFER":
        return { label: "VietQR", cls: "bg-blue-100 text-blue-900 border-blue-200" };
      case "CARD":
        return { label: "Quẹt Thẻ POS", cls: "bg-emerald-100 text-emerald-900 border-emerald-200" };
      default:
        return { label: "Tiền Mặt", cls: "bg-amber-100 text-amber-900 border-amber-200" };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E2DD] shadow-sm overflow-hidden space-y-4 p-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E2DD]">
        <div>
          <h2 className="font-serif font-bold text-base text-[#032517]">
            Sổ Quỹ Thu Ngân & Lịch Sử Hóa Đơn Điện Tử
          </h2>
          <p className="text-xs text-stone-500">
            Tra cứu, kiểm toán và in lại chứng từ thanh toán mọi ca trị liệu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo số HĐ, tên khách, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs focus:outline-none"
          >
            <option value="ALL">Tất cả hình thức</option>
            <option value="BANK_TRANSFER">Chuyển khoản VietQR</option>
            <option value="CASH">Tiền mặt</option>
            <option value="CARD">Quẹt thẻ POS</option>
            <option value="PACKAGE_REDEMPTION">Trừ thẻ liệu trình</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] border-b border-[#E5E2DD] text-[#775A19] font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Số Hóa Đơn</th>
              <th className="py-3 px-4">Thượng Khách</th>
              <th className="py-3 px-4">Nội Dung Thanh Toán</th>
              <th className="py-3 px-4">Hình Thức</th>
              <th className="py-3 px-4 text-right">Thực Thu</th>
              <th className="py-3 px-4 text-right">Thời Gian</th>
              <th className="py-3 px-4 text-center">In Bill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E2DD]">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-stone-400">
                  Không tìm thấy hóa đơn nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const badge = getMethodBadge(inv.paymentMethod);
                const isPackage = inv.paymentMethod === "PACKAGE_REDEMPTION";

                return (
                  <tr key={inv.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#032517]">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#032517]">{inv.customer?.name}</div>
                      <div className="text-[10px] text-stone-400">{inv.customer?.phone}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-stone-700">
                      {inv.appointment?.service?.name || "Gói Liệu Trình Dài Hạn"}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-serif font-bold text-sm text-[#1B3B2B] text-right whitespace-nowrap">
                      {isPackage ? "0 ₫ (Trừ thẻ)" : formatVND(inv.finalAmount)}
                    </td>

                    <td className="py-3 px-4 text-stone-500 text-right whitespace-nowrap text-[11px]">
                      <div>{formatTimeVN(inv.createdAt)}</div>
                      <div className="text-[10px] text-stone-400">{formatDateVN(inv.createdAt)}</div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E2DD] bg-white hover:bg-[#FAF7F2] text-[#032517] font-semibold text-[11px] transition shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>In Lại</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
