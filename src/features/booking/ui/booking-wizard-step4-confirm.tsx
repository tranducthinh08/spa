"use client";

import React from "react";
import { User, Phone, HeartPulse, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";

interface Step4Props {
  summary: {
    branchName?: string;
    serviceName?: string;
    durationMinutes?: number;
    price?: number;
    isPackageRedeem?: boolean;
    date?: string;
    timeSlot?: string;
    therapistName?: string;
    roomName?: string;
  };
  customerName: string;
  onChangeName: (v: string) => void;
  customerPhone: string;
  onChangePhone: (v: string) => void;
  healthNotes: string;
  onChangeHealthNotes: (v: string) => void;
  errorMessage?: string | null;
}

export function BookingWizardStep4Confirm({
  summary,
  customerName,
  onChangeName,
  customerPhone,
  onChangePhone,
  healthNotes,
  onChangeHealthNotes,
  errorMessage,
}: Step4Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-[#032517]">
          4. Thông Tin Thượng Khách & Xác Nhận Đặt Hẹn
        </h3>
        <p className="text-xs text-[#424843]">
          Vui lòng cung cấp thông tin liên hệ và ghi chú thể trạng để chuyên gia Ngự Y chuẩn bị thảo dược phù hợp
        </p>
      </div>

      {/* Summary Recap Card */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] space-y-2 text-xs">
        <div className="font-serif font-bold text-sm text-[#032517] pb-1 border-b border-[#E5E2DD]/70 flex items-center justify-between">
          <span>{summary.serviceName}</span>
          <span className="text-[#775A19]">
            {summary.isPackageRedeem ? "Khấu trừ Thẻ (0đ)" : formatVND(summary.price || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[#424843]">
          <div>Cơ sở: <strong>{summary.branchName}</strong></div>
          <div>Thời gian: <strong>{summary.timeSlot} ({summary.date})</strong></div>
          <div>KTV Ngự Y: <strong>{summary.therapistName}</strong></div>
          <div>Phòng/Cabin: <strong>{summary.roomName}</strong></div>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-3 pt-1">
        <div>
          <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-1">
            <User className="w-3.5 h-3.5" />
            <span>Họ và Tên Thượng Khách *</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Bà Nguyễn Thị Minh Khai"
            value={customerName}
            onChange={(e) => onChangeName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-1">
            <Phone className="w-3.5 h-3.5" />
            <span>Số Điện Thoại Liên Hệ *</span>
          </label>
          <input
            type="tel"
            required
            placeholder="Ví dụ: 0988776655"
            value={customerPhone}
            onChange={(e) => onChangePhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-1">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Tiền Sử Y Sinh & Ghi Chú Sức Khỏe (Huyết áp, Vùng đau mỏi)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: Huyết áp hơi cao, nhức mỏi cổ vai gáy bên phải, yêu cầu phòng ấm..."
            value={healthNotes}
            onChange={(e) => onChangeHealthNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />
        </div>
      </div>

      {/* Error alert if conflict detected */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-[#83A590] pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>Bảo mật thông tin thượng khách tuyệt đối theo tiêu chuẩn quản trị y tế hoàng cung.</span>
      </div>
    </div>
  );
}
