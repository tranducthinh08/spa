"use client";

import React, { useState } from "react";
import { Receipt, CreditCard, Sparkles, PlusCircle } from "lucide-react";
import { formatVND, formatTimeVN } from "@/shared/lib/utils";

interface PosTransactionsProps {
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    finalAmount: number;
    paymentMethod: string;
    createdAt: Date | string;
    customer: {
      name: string;
      membershipTier: string;
    };
    appointment?: {
      service?: {
        name: string;
      };
    } | null;
  }>;
}

export function PosTransactionsStream({ invoices }: PosTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FED488]/40 text-[#775A19] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#032517]">
                Giao Dịch Thu Ngân POS Mới Nhất
              </h3>
              <p className="text-xs text-[#424843]">
                Dòng tiền thời gian thực kết nối với tài nguyên & thẻ trị liệu
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#775A19] bg-[#FED488]/30 px-2 py-0.5 rounded-full">
            {invoices.length} Giao dịch
          </span>
        </div>

        <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#424843]">
              Chưa có giao dịch POS nào trong hôm nay.
            </div>
          ) : (
            invoices.map((inv) => {
              const isPackage = inv.paymentMethod === "PACKAGE_REDEMPTION";
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD]/80 hover:bg-[#F0EDE9] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isPackage ? "bg-[#1B3B2B] text-[#FED488]" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isPackage ? <Sparkles className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C1C19] flex items-center gap-1.5">
                        {inv.customer.name}
                        {inv.customer.membershipTier === "ROYAL_VIP" && (
                          <span className="text-[9px] bg-[#FED488] text-[#775A19] px-1 py-0.2 rounded font-bold">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#424843]">
                        {inv.appointment?.service?.name || "Hóa đơn dịch vụ Hoàng Gia"} • {formatTimeVN(inv.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#032517]">
                      {isPackage ? "Trừ 1 buổi thẻ" : formatVND(inv.finalAmount)}
                    </div>
                    <div className="text-[10px] font-medium text-[#775A19]">
                      {inv.paymentMethod}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0EDE9] flex items-center justify-between text-xs">
        <span className="text-[#424843]">Hỗ trợ POS đa chi nhánh</span>
        <button
          onClick={() => alert("Chức năng POS Bán Thẻ Mới đã được kích hoạt")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#775A19] hover:bg-[#5d4201] text-white text-xs font-semibold shadow-xs transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Tạo Hóa Đơn POS Mới</span>
        </button>
      </div>
    </div>
  );
}
