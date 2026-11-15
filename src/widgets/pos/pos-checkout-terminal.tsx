"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Wallet,
  QrCode,
  Sparkles,
  CheckCircle2,
  User,
  Clock,
  Crown,
  Search,
  ArrowRight,
} from "lucide-react";
import { formatVND, formatTimeVN } from "@/shared/lib/utils";
import { checkoutAppointmentAction } from "@/features/pos/actions/pos-terminal-actions";

interface PosCheckoutTerminalProps {
  appointments: any[];
  onCheckoutSuccess: (invoice: any) => void;
  onRefresh: () => void;
}

export function PosCheckoutTerminal({
  appointments,
  onCheckoutSuccess,
  onRefresh,
}: PosCheckoutTerminalProps) {
  const [selectedAptId, setSelectedAptId] = useState<string>(appointments[0]?.id || "");
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD" | "PACKAGE_REDEMPTION">("BANK_TRANSFER");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("Dịch vụ xuất sắc, thượng khách rất hài lòng.");
  const [rating, setRating] = useState(5);

  const selectedApt = appointments.find((a) => a.id === selectedAptId);

  // VIP Discount computation
  const getTierDiscountPercent = (tier?: string) => {
    switch (tier) {
      case "ROYAL_VIP": return 0.15;
      case "GOLD": return 0.10;
      default: return 0.05;
    }
  };

  const servicePrice = selectedApt?.service?.singlePrice || 0;
  const isEligibleForPackage = selectedApt?.customer?.customerPackages?.some(
    (pkg: any) => pkg.serviceId === selectedApt?.serviceId && pkg.remainingSessions > 0
  ) || Boolean(selectedApt?.customerPackageId);

  const tierPercent = getTierDiscountPercent(selectedApt?.customer?.membershipTier);
  const autoTierDiscount = Math.round(servicePrice * tierPercent);
  const appliedDiscount = paymentMethod === "PACKAGE_REDEMPTION"
    ? servicePrice
    : Math.max(autoTierDiscount, customDiscount);
  const finalAmount = Math.max(0, servicePrice - appliedDiscount);
  const cashChange = Math.max(0, cashReceived - finalAmount);

  const handleSelectApt = (apt: any) => {
    setSelectedAptId(apt.id);
    if (apt.customerPackageId || apt.customer?.customerPackages?.length > 0) {
      setPaymentMethod("PACKAGE_REDEMPTION");
    } else {
      setPaymentMethod("BANK_TRANSFER");
    }
  };

  const handleCheckout = async () => {
    if (!selectedApt) return;
    setSubmitting(true);
    const res = await checkoutAppointmentAction({
      appointmentId: selectedApt.id,
      paymentMethod,
      discountAmount: appliedDiscount,
      postSessionFeedback: feedback,
      rating,
    });

    if (res.success && res.data) {
      onCheckoutSuccess(res.data.invoice);
      onRefresh();
    } else {
      alert(res.error || "Có lỗi xảy ra khi hoàn tất ca trị liệu.");
    }
    setSubmitting(false);
  };

  const filteredApts = appointments.filter((a) => {
    if (!search) return true;
    return (
      a.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      a.customer.phone.includes(search) ||
      a.service.name.toLowerCase().includes(search.toLowerCase()) ||
      a.bookingCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left List: Pending / Active Appointments */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E2DD] shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, mã đặt lịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
          <div className="text-xs text-stone-500 font-semibold whitespace-nowrap">
            {filteredApts.length} Ca chờ thu ngân
          </div>
        </div>

        <div className="space-y-3">
          {filteredApts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E5E2DD] text-center text-xs text-stone-500">
              Hiện không có ca trị liệu nào đang chờ thanh toán.
            </div>
          ) : (
            filteredApts.map((apt) => {
              const isSelected = apt.id === selectedAptId;
              const isRoyal = apt.customer.membershipTier === "ROYAL_VIP";

              return (
                <div
                  key={apt.id}
                  onClick={() => handleSelectApt(apt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#C5A059] shadow-md ring-1 ring-[#C5A059]"
                      : "bg-white border-[#E5E2DD] hover:border-[#C5A059]/60 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1B3B2B] text-[#FED488] font-serif font-bold text-sm flex items-center justify-center">
                        {apt.customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#032517]">{apt.customer.name}</span>
                          {isRoyal && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-mono">
                            {apt.bookingCode}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {apt.customer.phone} • {apt.branch.name.replace("Plumeria ", "")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-serif font-bold text-[#1B3B2B]">
                        {formatVND(apt.service.singlePrice)}
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {apt.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#F0EDE9] flex items-center justify-between text-xs text-stone-600">
                    <span className="font-medium text-[#032517] truncate max-w-[280px]">
                      {apt.service.name}
                    </span>
                    <span className="text-stone-400">
                      KTV: <strong>{apt.therapist.name}</strong> • Phòng {apt.roomBed.name}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Billing & Checkout Breakdown */}
      <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#E5E2DD] shadow-md sticky top-24 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
          <h2 className="font-serif font-bold text-base text-[#032517]">
            Phiếu Thu Ngân Chi Tiết
          </h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FED488]/40 text-[#775A19]">
            POS Checkout
          </span>
        </div>

        {selectedApt ? (
          <div className="space-y-4 text-xs">
            {/* Customer & Service Header */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Khách hàng:</span>
                <span className="font-bold text-[#032517]">{selectedApt.customer.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Hạng hội viên:</span>
                <span className="font-bold text-[#775A19]">{selectedApt.customer.membershipTier} (Giảm {tierPercent * 100}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Liệu trình:</span>
                <span className="font-medium text-[#032517] truncate max-w-[200px]">{selectedApt.service.name}</span>
              </div>
            </div>

            {/* Package Redemption Prompt */}
            {isEligibleForPackage && (
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                  <span className="text-[11px] font-semibold">Khách có Thẻ Liệu Trình hoạt động</span>
                </div>
                <button
                  onClick={() => setPaymentMethod("PACKAGE_REDEMPTION")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    paymentMethod === "PACKAGE_REDEMPTION"
                      ? "bg-purple-800 text-white shadow-xs"
                      : "bg-purple-200 text-purple-900 hover:bg-purple-300"
                  }`}
                >
                  Trừ Thẻ (0 ₫)
                </button>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-stone-500">Phương Thức Thanh Toán</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "BANK_TRANSFER", label: "VietQR 24/7", icon: QrCode },
                  { id: "CASH", label: "Tiền Mặt", icon: Wallet },
                  { id: "CARD", label: "Quẹt Thẻ POS", icon: CreditCard },
                  { id: "PACKAGE_REDEMPTION", label: "Trừ Thẻ Gói", icon: Sparkles },
                ].map((m) => {
                  const Icon = m.icon;
                  const isChecked = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        isChecked
                          ? "bg-[#1B3B2B] text-[#FED488] border-[#1B3B2B] shadow-xs font-bold"
                          : "bg-white text-stone-600 border-[#E5E2DD] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Calculator */}
            {paymentMethod === "CASH" && (
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E5E2DD] space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span>Tiền khách đưa:</span>
                  <input
                    type="number"
                    value={cashReceived || ""}
                    onChange={(e) => setCashReceived(Number(e.target.value))}
                    placeholder="Nhập số tiền..."
                    className="w-32 px-2 py-1 rounded-lg border border-[#E5E2DD] text-right font-bold text-xs"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-emerald-800">
                  <span>Tiền thối lại:</span>
                  <span>{formatVND(cashChange)}</span>
                </div>
              </div>
            )}

            {/* Price Calculation Summary */}
            <div className="space-y-1.5 pt-2 border-t border-[#E5E2DD] text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Giá gốc niêm yết:</span>
                <span>{formatVND(servicePrice)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Chiết khấu ({paymentMethod === "PACKAGE_REDEMPTION" ? "Thẻ liệu trình" : "VIP Special"}):</span>
                <span>-{formatVND(appliedDiscount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#032517] pt-2 border-t border-dashed border-[#E5E2DD]">
                <span>TỔNG THANH TOÁN:</span>
                <span className="font-serif text-lg text-[#1B3B2B]">
                  {paymentMethod === "PACKAGE_REDEMPTION" ? "0 ₫ (Trừ thẻ)" : formatVND(finalAmount)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{submitting ? "Đang xử lý thu ngân..." : "Xác Nhận Thanh Toán & Xuất Hóa Đơn"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-stone-400">
            Vui lòng chọn một ca trị liệu từ danh sách bên trái để tính tiền.
          </div>
        )}
      </div>
    </div>
  );
}
