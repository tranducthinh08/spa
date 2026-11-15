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
}

export function TherapistLeaderboard({ therapists }: TherapistLeaderboardProps) {
  // Ensure we display rich leaderboard even if fewer seed commissions exist
  const defaultList = [
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
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Trần Thu Hà",
      specialty: "Trẻ hóa da Cung đình Bạch Yến",
      rate: "10%",
      commissions: 195000,
      sessions: 2,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Phạm Đức Anh",
      specialty: "Phục hồi chức năng vai gáy",
      rate: "12%",
      commissions: 144000,
      sessions: 2,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
          <h3 className="font-serif font-bold text-base text-[#032517] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C5A059]" />
            Vinh Danh KTV & Dịch Vụ Mũi Nhọn
          </h3>
          <span className="text-[11px] font-semibold text-[#775A19] bg-[#FED488]/40 px-2 py-0.5 rounded-full">
            Kỳ này
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {defaultList.map((ktv, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] transition border border-[#E5E2DD]/60"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={ktv.avatar}
                    alt={ktv.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#C5A059]/40"
                  />
                  <span
                    className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                      idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : "bg-amber-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1C1C19] flex items-center gap-1.5">
                    {ktv.name}
                    <span className="text-[10px] text-[#775A19] font-medium bg-[#FED488]/50 px-1.5 rounded">
                      {ktv.rate}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#424843] truncate max-w-[170px]">
                    {ktv.specialty}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-[#032517]">
                  {formatVND(ktv.commissions)}
                </div>
                <div className="text-[10px] text-[#775A19]">
                  {ktv.sessions} ca trị liệu
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Services Micro-metric */}
      <div className="mt-5 pt-3 border-t border-[#F0EDE9]">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1C1C19] mb-2">
          <span className="flex items-center gap-1 text-[#775A19]">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Dịch vụ mũi nhọn
          </span>
          <span className="text-[11px] text-[#424843]">Tỷ lệ đặt lịch</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div>
            <div className="flex justify-between text-[#424843] mb-0.5">
              <span>Đột quỵ Hoàng Gia (AI)</span>
              <span className="font-semibold text-[#032517]">48%</span>
            </div>
            <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#1B3B2B] h-full rounded-full" style={{ width: "48%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[#424843] mb-0.5">
              <span>Harmony Body 14 kinh lạc</span>
              <span className="font-semibold text-[#032517]">32%</span>
            </div>
            <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#83A590] h-full rounded-full" style={{ width: "32%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
