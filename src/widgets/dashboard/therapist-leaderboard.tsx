"use client";

import React from "react";
import { Award, Star, Flame } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";

interface TherapistLeaderboardProps {
  therapists: Array<{
    therapist: {
      id: string;
      name: string;
      specialty?: string;
      commissionRate: number;
    };
    totalSessions: number;
    totalCommissions: number;
  }>;
  topServices?: Array<{
    name: string;
    count: number;
    percent: number;
  }>;
}

export function TherapistLeaderboard({
  therapists,
  topServices = [],
}: TherapistLeaderboardProps) {
  const displayList = therapists.length > 0
    ? therapists.map((t) => ({
        name: t.therapist.name,
        specialty: t.therapist.specialty || "Trị liệu đa khoa",
        rate: `${Math.round(t.therapist.commissionRate * 100)}%`,
        commissions: t.totalCommissions,
        sessions: t.totalSessions,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      }))
    : [
        {
          name: "Lê Hoài An",
          specialty: "Trị liệu đột quỵ & Cabin AI",
          rate: "15%",
          commissions: 375000,
          sessions: 4,
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
        },
        {
          name: "Nguyễn Thị Mai",
          specialty: "Đả thông 14 kinh lạc Hoàng Gia",
          rate: "12%",
          commissions: 288000,
          sessions: 3,
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
        },
      ];

  const servicesList = topServices.length > 0
    ? topServices
    : [
        { name: "Trị liệu Phòng ngừa Đột quỵ (AI)", percent: 50 },
        { name: "Harmony Body 14 kinh lạc", percent: 35 },
      ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#032517]">
                Bảng Vàng Kỹ Thuật Viên Ngự Y
              </h3>
              <p className="text-xs text-[#424843]">
                Xếp hạng năng suất & hoa hồng tự động
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#775A19] bg-[#FED488]/30 px-2 py-0.5 rounded-full">
            Top KTV
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {displayList.slice(0, 4).map((t, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD]/80 hover:bg-[#F0EDE9] transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#C5A059]"
                  />
                  {idx === 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      <Star className="w-3 h-3 fill-amber-950" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#032517]">{t.name}</div>
                  <div className="text-[11px] text-[#775A19]">{t.specialty}</div>
                  <div className="text-[10px] text-[#424843]">
                    {t.sessions} Ca trị liệu • Mức hoa hồng: {t.rate}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-serif font-bold text-[#1B3B2B]">
                  {formatVND(t.commissions)}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">Hoa hồng duyệt</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Top Services Micro-metric */}
      <div className="mt-5 pt-3 border-t border-[#F0EDE9]">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1C1C19] mb-2">
          <span className="flex items-center gap-1 text-[#775A19]">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Dịch vụ mũi nhọn
          </span>
          <span className="text-[11px] text-[#424843]">Tỷ lệ đặt lịch</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          {servicesList.map((srv, sIdx) => (
            <div key={sIdx}>
              <div className="flex justify-between text-[#424843] mb-0.5">
                <span className="truncate max-w-[200px]">{srv.name}</span>
                <span className="font-semibold text-[#032517]">{srv.percent}%</span>
              </div>
              <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${sIdx === 0 ? "bg-[#1B3B2B]" : "bg-[#83A590]"}`}
                  style={{ width: `${Math.min(100, Math.max(5, srv.percent))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
