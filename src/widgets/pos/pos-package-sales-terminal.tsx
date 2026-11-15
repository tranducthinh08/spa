"use client";

import React, { useState } from "react";
import { Sparkles, Crown, QrCode, Wallet, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";
import { sellPackageAction } from "@/features/pos/actions/pos-terminal-actions";

interface PosPackageSalesTerminalProps {
  packageServices: any[];
  customers: any[];
  branches: any[];
  selectedBranch: string;
  onSaleSuccess: (invoice: any) => void;
  onRefresh: () => void;
}

export function PosPackageSalesTerminal({
  packageServices,
  customers,
  branches,
  selectedBranch,
  onSaleSuccess,
  onRefresh,
}: PosPackageSalesTerminalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(packageServices[0]?.id || "");
  const [targetBranchId, setTargetBranchId] = useState<string>(
    selectedBranch && selectedBranch !== "ALL" ? selectedBranch : branches[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD">("BANK_TRANSFER");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = packageServices.find((s) => s.id === selectedServiceId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const basePrice = selectedService?.packagePrice || 0;
  const finalAmount = Math.max(0, basePrice - discountAmount);

  const handleSellPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedServiceId || !targetBranchId) {
      alert("Vui lòng chọn đầy đủ thông tin Thượng khách, Gói liệu trình và Chi nhánh.");
      return;
    }

    setSubmitting(true);
    const res = await sellPackageAction({
      customerId: selectedCustomerId,
      serviceId: selectedServiceId,
      branchId: targetBranchId,
      paymentMethod,
      discountAmount,
    });

    if (res.success && res.data) {
      onSaleSuccess(res.data.invoice);
      onRefresh();
    } else {
      alert(res.error || "Có lỗi xảy ra khi phát hành thẻ liệu trình.");
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#E5E2DD] shadow-md max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DD]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B3B2B] text-[#FED488] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#032517]">
              Phát Hành Thẻ Liệu Trình Dài Hạn (10 / 16 Buổi)
            </h2>
            <p className="text-xs text-stone-500">
              Kích hoạt quyền lợi bảo dưỡng định kỳ và tặng 200 điểm thưởng Hoàng Cung
            </p>
          </div>
        </div>
        <span className="text-xs bg-[#FED488]/40 text-[#775A19] font-bold px-3 py-1 rounded-full">
          Gói Hoàng Gia
        </span>
      </div>

      <form onSubmit={handleSellPackage} className="space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Select Customer */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase text-stone-600 text-[11px]">
              Chọn Thượng Khách Đăng Ký
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone} ({c.membershipTier})
                </option>
              ))}
            </select>
          </div>

          {/* Select Branch */}
          <div className="space-y-1.5">
            <label className="font-bold uppercase text-stone-600 text-[11px]">
              Chi Nhánh Tiếp Nhận & Kích Hoạt
            </label>
            <select
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Select Package Service */}
        <div className="space-y-2">
          <label className="font-bold uppercase text-stone-600 text-[11px]">
            Chọn Gói Dịch Vụ Dài Hạn
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packageServices.map((srv) => {
              const isSelected = srv.id === selectedServiceId;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#C5A059] ring-1 ring-[#C5A059] shadow-xs"
                      : "bg-white border-[#E5E2DD] hover:border-stone-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-[#032517]">{srv.name}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Quy mô: <strong>{srv.packageSessions} Buổi</strong> ({srv.durationMinutes} Phút/buổi)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-sm text-[#1B3B2B]">
                        {formatVND(srv.packagePrice)}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Tiết kiệm {Math.round((1 - srv.packagePrice / (srv.singlePrice * srv.packageSessions)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method & Custom Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <label className="font-bold uppercase text-stone-600 text-[11px]">Hình Thức Thanh Toán</label>
            <div className="flex gap-2">
              {[
                { id: "BANK_TRANSFER", label: "VietQR 24/7", icon: QrCode },
                { id: "CASH", label: "Tiền Mặt", icon: Wallet },
                { id: "CARD", label: "Quẹt Thẻ", icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      isSelected
                        ? "bg-[#1B3B2B] text-[#FED488] border-[#1B3B2B] font-bold shadow-xs"
                        : "bg-[#FAF7F2] text-stone-600 border-[#E5E2DD] hover:bg-stone-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase text-stone-600 text-[11px]">Chiết Khấu Khuyến Mại (VND)</label>
            <input
              type="number"
              value={discountAmount || ""}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              placeholder="Nhập tiền chiết khấu..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] font-semibold text-stone-900"
            />
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500">Tổng thanh toán gói liệu trình:</div>
            <div className="font-serif font-bold text-xl text-[#032517] mt-0.5">
              {formatVND(finalAmount)}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-2xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            <span>{submitting ? "Đang phát hành..." : "Kích Hoạt Thẻ & Thu Tiền"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
