"use client";

import React from "react";
import { Calendar, Clock, User, Sparkles, Check, Crown } from "lucide-react";

interface Step3Props {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (d: string) => void;
  selectedTimeSlot: string; // HH:mm
  onSelectTimeSlot: (t: string) => void;
  therapists: Array<{
    id: string;
    name: string;
    specialty?: string | null;
    avatar?: string | null;
  }>;
  selectedTherapistId: string;
  onSelectTherapist: (id: string) => void;
  rooms: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
}

export function BookingWizardStep3DateTime({
  selectedDate,
  onSelectDate,
  selectedTimeSlot,
  onSelectTimeSlot,
  therapists,
  selectedTherapistId,
  onSelectTherapist,
  rooms,
  selectedRoomId,
  onSelectRoom,
}: Step3Props) {
  // Generate next 6 days
  const today = new Date();
  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : `Thứ ${d.getDay() + 1 === 1 ? "CN" : d.getDay() + 1}`;
    const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr, dayName, displayDate };
  });

  const slotsMorning = ["09:00", "10:30"];
  const slotsAfternoon = ["13:30", "15:00", "16:30"];
  const slotsEvening = ["18:00", "19:00"];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif font-bold text-lg text-[#032517]">
          3. Chọn Ngày, Giờ & Chuyên Viên Ngự Y + Cabin AI
        </h3>
        <p className="text-xs text-[#424843]">
          Hệ thống kiểm tra trực tiếp xung đột thời gian thực đảm bảo trải nghiệm riêng tư tuyệt đối
        </p>
      </div>

      {/* Date Picker Horizontal Chips */}
      <div>
        <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Chọn ngày hẹn</span>
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => onSelectDate(d.dateStr)}
                className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-[#1B3B2B] text-[#FED488] border-[#C5A059] shadow-sm font-bold"
                    : "bg-white text-[#424843] border-[#E5E2DD] hover:bg-[#FAF7F2]"
                }`}
              >
                <div className="text-[10px] uppercase">{d.dayName}</div>
                <div className="text-xs font-serif mt-0.5">{d.displayDate}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Matrix */}
      <div>
        <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Khung giờ bắt đầu trị liệu</span>
        </label>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#775A19] w-12 shrink-0">Sáng:</span>
            <div className="flex gap-2">
              {slotsMorning.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectTimeSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedTimeSlot === slot
                      ? "bg-[#FED488] text-[#032517] border border-[#C5A059] shadow-xs"
                      : "bg-white border border-[#E5E2DD] text-[#424843] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#775A19] w-12 shrink-0">Chiều:</span>
            <div className="flex gap-2">
              {slotsAfternoon.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectTimeSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedTimeSlot === slot
                      ? "bg-[#FED488] text-[#032517] border border-[#C5A059] shadow-xs"
                      : "bg-white border border-[#E5E2DD] text-[#424843] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#775A19] w-12 shrink-0">Tối:</span>
            <div className="flex gap-2">
              {slotsEvening.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectTimeSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedTimeSlot === slot
                      ? "bg-[#FED488] text-[#032517] border border-[#C5A059] shadow-xs"
                      : "bg-white border border-[#E5E2DD] text-[#424843] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Resource Selection: Therapist & Room */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Preferred Therapist */}
        <div>
          <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Kỹ Thuật Viên Ngự Y</span>
          </label>
          <div className="space-y-2">
            {therapists.map((ktv) => {
              const isSelected = selectedTherapistId === ktv.id;
              return (
                <div
                  key={ktv.id}
                  onClick={() => onSelectTherapist(ktv.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    isSelected
                      ? "border-[#C5A059] bg-[#FAF7F2] font-semibold ring-1 ring-[#C5A059]"
                      : "border-[#E5E2DD] bg-white hover:bg-[#FCF9F4]"
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#032517]">{ktv.name}</div>
                    <div className="text-[10px] text-[#775A19] truncate max-w-[160px]">
                      {ktv.specialty}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#C5A059] stroke-[3]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preferred Cabin / Room */}
        <div>
          <label className="text-xs font-semibold text-[#775A19] flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cabin / Phòng Trị Liệu</span>
          </label>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const isAi = room.type === "AI_CABIN";
              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    isSelected
                      ? "border-[#C5A059] bg-[#FAF7F2] font-semibold ring-1 ring-[#C5A059]"
                      : "border-[#E5E2DD] bg-white hover:bg-[#FCF9F4]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAi ? (
                      <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                    )}
                    <span className="truncate max-w-[150px]">{room.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#C5A059] stroke-[3]" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
