"use client";

import React, { useState } from "react";
import { Sparkles, X, Crown, ArrowRight, QrCode, Wallet, CreditCard } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";
import { registerPackageAndLinkAction } from "@/features/appointments/actions/appointment-actions";

interface PackageRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
}

export function PackageRegistrationModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: PackageRegistrationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD">("BANK_TRANSFER");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  if (!isOpen || !appointment) return null;

  const service = appointment.service;
  const customer = appointment.customer;
  const packagePrice = service?.packagePrice || (service?.singlePrice ? service.singlePrice * 10 * 0.85 : 0);
  const packageSessions = service?.packageSessions || 16;
  const finalAmount = Math.max(0, packagePrice - discountAmount);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await registerPackageAndLinkAction({
      appointmentId: appointment.id,
      customerId: customer.id,
      serviceId: service.id,
      branchId: appointment.branchId,
      paymentMethod,
      discountAmount,
    });

    if (res.success) {
      alert(`Đã đăng ký thành công gói ${packageSessions} buổi cho ${customer.name} và liên kết tự động vào ca này!`);
      onSuccess();
      onClose();
    } else {
      alert(res.error || "Có lỗi xảy ra khi kích hoạt gói liệu trình.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E5E2DD] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#1B3B2B] text-[#FED488] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <span className="font-serif font-bold text-sm">Đăng Ký Gói Liệu Trình Hoàng Cung</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRegister} className="p-5 space-y-4 text-xs text-[#1C1C19]">
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] space-y-1">
            <div className="text-[11px] text-stone-500">Thượng khách thụ hưởng:</div>
            <div className="font-bold text-sm text-[#032517] flex items-center gap-1.5">
              <span>{customer?.name}</span>
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs text-[#775A19] font-normal">({customer?.phone})</span>
            </div>
            <div className="text-[11px] text-[#775A19]">
              Liệu trình: <strong>{service?.name}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-900">
                Gói {packageSessions} Buổi Chăm Sóc Toàn Diện
              </span>
              <span className="text-[10px] bg-[#FED488] text-[#775A19] font-bold px-2 py-0.5 rounded-full">
                Tiết kiệm 20%
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-stone-500 text-xs">Giá trọn gói niêm yết:</span>
              <span className="font-serif font-bold text-base text-[#1B3B2B]">
                {formatVND(packagePrice)}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 italic">
              * Khách hàng được cấp mã thẻ CRM dài hạn, hiệu lực 12 tháng và tích lũy +200 điểm thưởng Hoàng Cung.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[11px] text-stone-600 uppercase">Chiết Khấu Khuyến Mại (VND)</label>
            <input
              type="number"
              value={discountAmount || ""}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              placeholder="Nhập tiền chiết khấu nếu có..."
              className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-[11px] text-stone-600 uppercase">Hình Thức Thanh Toán Gói</label>
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
                    className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      isSelected
                        ? "bg-[#1B3B2B] text-[#FED488] border-[#1B3B2B] font-bold shadow-xs"
                        : "bg-[#FAF7F2] text-stone-600 border-[#E5E2DD]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
            <span>
              Ca trị liệu này sẽ được <strong>tự động liên kết và trừ 1 buổi</strong> ngay khi bạn xác nhận!
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E2DD] text-stone-600 hover:bg-[#FAF7F2] font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold shadow-md transition disabled:opacity-50"
            >
              <span>{submitting ? "Đang kích hoạt..." : "Kích Hoạt Gói & Gán Trừ Ca Này"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
