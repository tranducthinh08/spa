"use client";

import React from "react";
import { Sparkles, HeartHandshake, UserCheck, Clock } from "lucide-react";

interface TimelineKpiBarProps {
  cabinOccupancy: string;
  vipRoomOccupancy: string;
  activeTherapists: number;
  waitingCheckin: number;
}

export function TimelineKpiBar({
  cabinOccupancy,
  vipRoomOccupancy,
  activeTherapists,
  waitingCheckin,
}: TimelineKpiBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white p-3.5 rounded-xl border border-[#E5E2DD] shadow-2xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-950 text-[#FED488] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#775A19]">
            Cabin Từ Trường AI
          </div>
          <div className="text-sm font-bold text-[#032517]">{cabinOccupancy}</div>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-[#E5E2DD] shadow-2xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <HeartHandshake className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#775A19]">
            Phòng VIP Đông Y
          </div>
          <div className="text-sm font-bold text-[#032517]">{vipRoomOccupancy}</div>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-[#E5E2DD] shadow-2xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#775A19]">
            Kỹ Thuật Viên Trong Ca
          </div>
          <div className="text-sm font-bold text-[#032517]">{activeTherapists} KTV Ngự Y</div>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-[#E5E2DD] shadow-2xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#775A19]">
            Khách Chờ Check-in
          </div>
          <div className="text-sm font-bold text-[#032517]">{waitingCheckin} Thượng Khách</div>
        </div>
      </div>
    </div>
  );
}
