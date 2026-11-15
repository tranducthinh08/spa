"use client";

import React, { useState } from "react";
import {
  Crown,
  HeartPulse,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  Play,
  XCircle,
  FileText,
  User,
} from "lucide-react";
import { formatVND, formatTimeVN } from "@/shared/lib/utils";
import { updateAppointmentStatusAction } from "@/features/appointments/actions/appointment-actions";

interface InspectorProps {
  appointment: any | null;
  onRefresh: () => void;
}

export function AppointmentInspector({ appointment, onRefresh }: InspectorProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!appointment) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E2DD] p-8 text-center text-[#424843] flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] flex items-center justify-center text-[#775A19] mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="font-serif font-bold text-base text-[#032517]">
          Chưa Chọn Ca Trị Liệu
        </h4>
        <p className="text-xs text-[#775A19] mt-1 max-w-[220px]">
          Nhấp vào bất kỳ ca hẹn nào trên biểu đồ Timeline Matrix để xem hồ sơ y sinh và điều phối
        </p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    await updateAppointmentStatusAction(appointment.id, newStatus, {
      postSessionFeedback: feedback || undefined,
      rating: 5,
    });
    setLoading(false);
    onRefresh();
  };

  const isCompleted = appointment.status === "COMPLETED";
  const isInProgress = appointment.status === "IN_PROGRESS";
  const isConfirmed = appointment.status === "CONFIRMED";
  const isCheckedIn = appointment.status === "CHECKED_IN";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-sm p-5 space-y-4 relative overflow-hidden">
      {/* Customer VIP Profile Card */}
      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5E2DD] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1B3B2B] text-[#FED488] flex items-center justify-center text-lg font-bold font-serif shrink-0 border border-[#C5A059]/40">
            {appointment.customer?.name?.charAt(0) || "K"}
          </div>
          <div>
            <div className="text-sm font-bold text-[#032517] flex items-center gap-1.5">
              {appointment.customer?.name}
              <Crown className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xs text-[#775A19] font-medium">
              {appointment.customer?.phone} • {appointment.customer?.membershipTier || "ROYAL_VIP"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isInProgress
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : isCompleted
                ? "bg-stone-200 text-stone-700"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}
          >
            {appointment.status}
          </span>
          <div className="text-[10px] text-[#424843] mt-1 font-mono">
            {appointment.bookingCode}
          </div>
        </div>
      </div>

      {/* Service & Time Overview */}
      <div className="p-3 bg-[#FCF9F4] rounded-xl border border-[#E5E2DD] text-xs space-y-1.5">
        <div className="font-semibold text-[#032517] flex items-center justify-between">
          <span>{appointment.service?.name}</span>
          <span className="text-[#775A19] font-bold">
            {formatVND(appointment.service?.singlePrice || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#424843] text-[11px]">
          <span>Thời gian: {formatTimeVN(appointment.startTime)} - {formatTimeVN(appointment.endTime)}</span>
          <span>Phòng: {appointment.roomBed?.name}</span>
        </div>
      </div>

      {/* Medical & Pulse Notes Box */}
      <div className="border border-[#E5E2DD] rounded-xl p-3 bg-white space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#775A19]">
          <HeartPulse className="w-4 h-4 text-red-500" />
          <span>Hồ Sơ Y Sinh & Chẩn Đoán Kinh Lạc</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-[#FAF7F2] p-2 rounded-lg">
          <div>
            <div className="text-[#424843]">Huyết áp</div>
            <div className="font-bold text-[#032517] text-xs">125/82</div>
          </div>
          <div>
            <div className="text-[#424843]">Mạch tim</div>
            <div className="font-bold text-[#032517] text-xs">74 bpm</div>
          </div>
          <div>
            <div className="text-[#424843]">Đau vai gáy</div>
            <div className="font-bold text-red-600 text-xs">Độ 3/10</div>
          </div>
        </div>
        <p className="text-[11px] text-[#424843] italic bg-[#FCF9F4] p-2 rounded border border-[#F0EDE9]">
          "{appointment.healthNotes || "Không có tiền sử bệnh lý đặc biệt."}"
        </p>
      </div>

      {/* Package Deduction & Stock Consumables Box */}
      <div className="border border-[#E5E2DD] rounded-xl p-3 bg-white space-y-2 text-xs">
        <div className="flex items-center justify-between text-[#775A19] font-bold">
          <span className="flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-700" />
            Khấu Trừ Thẻ & Dược Liệu BOM
          </span>
        </div>
        <div className="text-[11px] text-[#424843] bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-200">
          {appointment.customerPackageId ? (
            <span>
              Sử dụng <strong>Thẻ 16 Buổi Hoàng Gia</strong> (Tự động trừ 1 buổi khi bấm Hoàn tất)
            </span>
          ) : (
            <span>Dịch vụ trải nghiệm đơn buổi (Thanh toán tại quầy POS)</span>
          )}
        </div>
        <div className="text-[10px] text-[#424843] flex items-center justify-between pt-1">
          <span>KTV Ngự Y: <strong>{appointment.therapist?.name}</strong></span>
          <span className="text-emerald-700 font-semibold">Hoa hồng: {((appointment.therapist?.commissionRate || 0.1) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Action Control Buttons */}
      <div className="pt-2 space-y-2">
        {isConfirmed && (
          <button
            onClick={() => handleStatusChange("CHECKED_IN")}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <User className="w-4 h-4" />
            <span>Tiếp Đón & Check-in Khách Hàng</span>
          </button>
        )}

        {(isCheckedIn || isConfirmed) && (
          <button
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>Bắt Đầu Ca Trị Liệu (Chiếm Cabin/Giường)</span>
          </button>
        )}

        {isInProgress && (
          <button
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn Tất Ca (Trừ Thẻ + Trừ Kho BOM + Tính Hoa Hồng)</span>
          </button>
        )}

        {!isCompleted && appointment.status !== "CANCELLED" && (
          <button
            onClick={() => handleStatusChange("CANCELLED")}
            disabled={loading}
            className="w-full py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium transition"
          >
            Hủy Ca Hẹn Này
          </button>
        )}

        {isCompleted && (
          <div className="p-3 bg-stone-100 text-stone-700 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ca trị liệu này đã được hoàn tất thành công</span>
          </div>
        )}
      </div>
    </div>
  );
}
