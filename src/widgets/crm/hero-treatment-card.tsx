"use client";

import React from "react";
import Link from "next/link";
import { Crown, Check, Sparkles, Calendar, Lock, ArrowRight } from "lucide-react";
import { formatDateVN } from "@/shared/lib/utils";

interface HeroTreatmentCardProps {
  pkg: {
    id: string;
    code: string;
    totalSessions: number;
    usedSessions: number;
    remainingSessions: number;
    expiryDate: Date | string;
    status: string;
    service: {
      id: string;
      name: string;
      description?: string | null;
      requiresAiCabin: boolean;
    };
  };
}

export function HeroTreatmentCard({ pkg }: HeroTreatmentCardProps) {
  const nodes = Array.from({ length: pkg.totalSessions }, (_, i) => i + 1);

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#032517] via-[#1B3B2B] to-[#0A1F14] text-white p-7 border-2 border-[#C5A059]/60 shadow-xl overflow-hidden">
      {/* Background Ambient Aura & Ornamentation */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FED488]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Watermark */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#C5A059]/30 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C5A059]/20 text-[#FED488] px-2.5 py-0.5 rounded-full border border-[#C5A059]/40 flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#FED488]" />
              Thẻ Liệu Trình Hoàng Gia
            </span>
            <span className="text-xs text-[#83A590] font-mono">{pkg.code}</span>
          </div>
          <h2 className="font-serif font-bold text-xl text-[#FAF7F2] mt-2">
            {pkg.service.name}
          </h2>
        </div>

        <div className="text-right">
          <div className="text-3xl font-serif font-bold text-[#FED488]">
            {pkg.usedSessions} <span className="text-sm font-sans font-normal text-[#83A590]">/ {pkg.totalSessions} Buổi</span>
          </div>
          <div className="text-[11px] text-[#83A590] mt-0.5">
            Còn lại {pkg.remainingSessions} buổi (Hạn: {formatDateVN(pkg.expiryDate)})
          </div>
        </div>
      </div>

      {/* 16-Node Interactive Visual Progress Stepper */}
      <div className="relative z-10 my-6">
        <div className="flex items-center justify-between text-xs font-semibold text-[#FED488] mb-3">
          <span>Tiến trình 16 Buổi Trị Liệu & Phục Hồi</span>
          <span className="text-[#83A590]">{Math.round((pkg.usedSessions / pkg.totalSessions) * 100)}% Hoàn Tất</span>
        </div>

        {/* 16 Nodes Grid */}
        <div className="grid grid-cols-8 gap-2 sm:gap-3">
          {nodes.map((nodeNum) => {
            const isCompleted = nodeNum <= pkg.usedSessions;
            const isCurrent = nodeNum === pkg.usedSessions + 1;
            const isUpcoming = nodeNum > pkg.usedSessions + 1;

            return (
              <div
                key={nodeNum}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-[#C5A059] text-[#032517] shadow-md border border-[#FED488]"
                      : isCurrent
                      ? "bg-[#FED488] text-[#032517] ring-4 ring-[#FED488]/30 shadow-lg animate-pulse"
                      : "bg-white/10 text-white/50 border border-white/10"
                  }`}
                  title={`Buổi ${nodeNum}: ${
                    isCompleted ? "Đã thực hiện" : isCurrent ? "Sẵn sàng thực hiện" : "Chưa mở"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <Sparkles className="w-4 h-4 text-[#032517]" />
                  ) : (
                    <span>{nodeNum}</span>
                  )}
                </div>
                <span className="text-[9px] text-[#83A590] font-medium">B.{nodeNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inclusions & Card Perks */}
      <div className="relative z-10 pt-4 border-t border-[#C5A059]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-[#83A590] text-[11px]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FED488]" />
            Đặc quyền buồng Cabin AI
          </span>
          <span>•</span>
          <span>Bác sĩ bắt mạch & theo dõi định kỳ</span>
        </div>

        <Link
          href={`/booking?packageId=${pkg.id}&serviceId=${pkg.service.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FED488] hover:bg-[#FED488]/90 text-[#032517] text-xs font-bold transition shadow-md"
        >
          <span>Đặt Lịch Buổi Tiếp Theo ({pkg.usedSessions + 1})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
