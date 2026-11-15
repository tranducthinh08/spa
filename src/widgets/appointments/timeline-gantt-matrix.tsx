"use client";

import React from "react";
import { Sparkles, Crown, User, AlertCircle } from "lucide-react";
import { formatTimeVN } from "@/shared/lib/utils";

interface TimelineGanttProps {
  rooms: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    status: string;
  }>;
  appointments: Array<any>;
  selectedAppointmentId: string | null;
  onSelectAppointment: (apt: any) => void;
}

export function TimelineGanttMatrix({
  rooms,
  appointments,
  selectedAppointmentId,
  onSelectAppointment,
}: TimelineGanttProps) {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const startHour = 9;
  const totalHours = 10; // 09:00 to 19:00

  const getPositionPercent = (date: Date | string) => {
    const d = new Date(date);
    const h = d.getHours();
    const m = d.getMinutes();
    const totalMinutes = (h - startHour) * 60 + m;
    const maxMinutes = totalHours * 60;
    return Math.max(0, Math.min(100, (totalMinutes / maxMinutes) * 100));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-xs overflow-hidden flex flex-col">
      {/* Header Axis */}
      <div className="flex border-b border-[#E5E2DD] bg-[#FAF7F2] text-[11px] font-semibold text-[#775A19]">
        <div className="w-56 shrink-0 p-3 border-r border-[#E5E2DD]">
          Phòng / Cabin Trị Liệu
        </div>
        <div className="flex-1 grid grid-cols-10 divide-x divide-[#E5E2DD]/70 text-center py-2.5">
          {hours.slice(0, 10).map((h) => (
            <div key={h}>{`${h.toString().padStart(2, "0")}:00`}</div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#E5E2DD]/70 overflow-x-auto min-w-[750px]">
        {rooms.map((room) => {
          const roomApts = appointments.filter((a) => a.roomBedId === room.id);

          return (
            <div key={room.id} className="flex min-h-[72px] hover:bg-[#FCF9F4] transition">
              {/* Room Metadata Column */}
              <div className="w-56 shrink-0 p-3 border-r border-[#E5E2DD] flex flex-col justify-center bg-[#FAF7F2]/40">
                <div className="text-xs font-bold text-[#032517] flex items-center gap-1.5">
                  {room.type === "AI_CABIN" ? (
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  ) : (
                    <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                  )}
                  <span className="truncate">{room.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full uppercase ${
                      room.status === "OCCUPIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {room.status === "OCCUPIED" ? "Đang có ca" : "Sẵn sàng"}
                  </span>
                  <span className="text-[10px] text-[#775A19]">{room.code}</span>
                </div>
              </div>

              {/* Timeline Track Grid */}
              <div className="flex-1 relative h-full min-h-[72px] grid grid-cols-10 divide-x divide-[#F0EDE9]">
                {hours.slice(0, 10).map((h) => (
                  <div key={h} className="h-full pointer-events-none" />
                ))}

                {/* Appointment Blocks */}
                {roomApts.map((apt) => {
                  const left = getPositionPercent(apt.startTime);
                  const right = getPositionPercent(apt.endTime);
                  const width = Math.max(12, right - left);
                  const isSelected = selectedAppointmentId === apt.id;
                  const isInProgress = apt.status === "IN_PROGRESS";
                  const isCompleted = apt.status === "COMPLETED";

                  return (
                    <button
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt)}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      className={`absolute top-2 bottom-2 rounded-xl px-2 py-1 text-left transition-all z-10 flex flex-col justify-between shadow-xs overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-[#C5A059] shadow-md"
                          : ""
                      } ${
                        isInProgress
                          ? "bg-[#1B3B2B] text-white border border-[#C5A059]/60"
                          : isCompleted
                          ? "bg-[#E5E2DD] text-[#424843] border border-[#C1C8C2]"
                          : "bg-[#FED488]/70 text-[#1C1C19] border border-[#C5A059]/40 hover:bg-[#FED488]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-[11px] font-bold truncate">
                          {apt.customer?.name}
                        </span>
                        {isInProgress && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] opacity-90 w-full truncate">
                        <span>{apt.therapist?.name?.split(" ").slice(-2).join(" ")}</span>
                        <span>
                          {formatTimeVN(apt.startTime)} - {formatTimeVN(apt.endTime)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend sub-footer */}
      <div className="p-3 bg-[#FAF7F2] border-t border-[#E5E2DD] flex flex-wrap items-center justify-between text-xs text-[#424843]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#1B3B2B] border border-[#C5A059]"></span>
            <span>Đang trị liệu (In-progress)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FED488] border border-[#C5A059]"></span>
            <span>Đã đặt / Chờ đón khách</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#E5E2DD]"></span>
            <span>Đã hoàn tất ca</span>
          </span>
        </div>
        <div className="text-[11px] text-[#775A19] font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Khoảng trống sẵn sàng đón khách Walk-in</span>
        </div>
      </div>
    </div>
  );
}
