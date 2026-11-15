"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Sparkles, Calendar, Clock, MapPin, User, Phone, HeartPulse } from "lucide-react";
import { createBookingAction } from "@/features/booking/actions/booking-actions";
import { formatVND } from "@/shared/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: any | null;
  branches: Array<any>;
  services: Array<any>;
  therapists: Array<any>;
  rooms: Array<any>;
}

export function PlumeriaBookingModal({
  isOpen,
  onClose,
  preSelectedService,
  branches,
  services,
  therapists,
  rooms,
}: BookingModalProps) {
  if (!isOpen) return null;

  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");
  const [selectedServiceId, setSelectedServiceId] = useState(preSelectedService?.id || services[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [selectedTherapistId, setSelectedTherapistId] = useState(therapists[0]?.id || "");
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [healthNotes, setHealthNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const currentService = services.find((s) => s.id === selectedServiceId) || preSelectedService;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const [h, m] = selectedTime.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);

    const duration = currentService?.durationMinutes || 90;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const res = await createBookingAction({
      branchId: selectedBranchId,
      serviceId: selectedServiceId,
      therapistId: selectedTherapistId,
      roomBedId: selectedRoomId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      customerName,
      customerPhone,
      healthNotes,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Không thể đặt lịch do xung đột phòng hoặc kỹ thuật viên.");
    } else {
      setBookingSuccess(res.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-xl w-full border border-[#C5A059]/40 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1B3B2B] text-white flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FED488]" />
            <h3 className="font-serif font-bold text-base text-[#FAF7F2]">
              Đặt Lịch Hẹn Trị Liệu Hoàng Gia
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#1C1C19]">
          {bookingSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#1B3B2B] text-[#FED488] flex items-center justify-center mx-auto border-2 border-[#C5A059]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-xl text-[#032517]">
                Đặt Hẹn Thành Công!
              </h4>
              <p className="text-xs text-[#424843]">
                Mã đặt chỗ của Thượng khách: <strong className="font-mono text-[#1B3B2B] text-sm">{bookingSuccess.bookingCode}</strong>
              </p>
              <div className="bg-white p-4 rounded-xl border border-[#E5E2DD] text-left space-y-1.5 max-w-sm mx-auto">
                <div>Cơ sở: <strong>{bookingSuccess.branchName}</strong></div>
                <div>Dịch vụ: <strong>{bookingSuccess.serviceName}</strong></div>
                <div>KTV: <strong>{bookingSuccess.therapistName}</strong></div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#1B3B2B] text-[#FED488] font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              {/* Branch */}
              <div>
                <label className="block font-semibold text-[#775A19] mb-1">1. Chọn Chi Nhánh / Cơ Sở *</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} - {b.address}</option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block font-semibold text-[#775A19] mb-1">2. Dịch Vụ Trị Liệu *</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs font-medium"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes}p) - {formatVND(s.singlePrice)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#775A19] mb-1">3. Ngày Hẹn *</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#775A19] mb-1">Khung Giờ *</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                  >
                    {["09:00", "10:30", "13:30", "14:00", "15:00", "16:30", "18:00"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Therapist & Cabin */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#775A19] mb-1">Chuyên Viên Ngự Y</label>
                  <select
                    value={selectedTherapistId}
                    onChange={(e) => setSelectedTherapistId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                  >
                    {therapists.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#775A19] mb-1">Phòng / Cabin</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[#775A19] mb-1">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#775A19] mb-1">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0988xxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#775A19] mb-1">Ghi Chú Thể Trạng</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về huyết áp, đau mỏi cổ vai gáy..."
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white text-xs"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <Sparkles className="w-4 h-4 text-[#FED488]" />
                <span>{loading ? "Đang xác thực & xếp lịch..." : "Xác Nhận Đặt Chỗ"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
