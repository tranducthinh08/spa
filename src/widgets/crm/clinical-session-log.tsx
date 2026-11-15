"use client";

import React from "react";
import {
  Clock,
  Sparkles,
  Stethoscope,
  HeartPulse,
  PackageCheck,
  Star,
  CheckCircle2,
} from "lucide-react";
import { formatDateTimeVN } from "@/shared/lib/utils";

interface ClinicalLogProps {
  appointments: Array<any>;
}

export function ClinicalSessionLog({ appointments }: ClinicalLogProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#032517]">
              Nhật Ký Y Sinh & Trị Liệu
            </h3>
            <p className="text-xs text-[#424843]">
              Lịch sử các buổi trị liệu, phản hồi y sinh và tiêu hao dược liệu
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#775A19] bg-[#FED488]/40 px-2.5 py-1 rounded-full">
          {appointments.length} Hồ sơ lưu trữ
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E2DD]">
        {appointments.map((apt, idx) => {
          const sessionNum = appointments.length - idx;
          const isLatest = idx === 0;

          return (
            <div key={apt.id} className="relative group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                  isLatest
                    ? "bg-[#1B3B2B] text-[#FED488] border-[#C5A059]"
                    : "bg-[#FAF7F2] text-[#775A19] border-[#E5E2DD]"
                }`}
              >
                {sessionNum}
              </div>

              {/* Session Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5E2DD] hover:border-[#C5A059] transition space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="text-xs font-bold text-[#032517] flex items-center gap-2">
                    <span>Buổi {sessionNum}: {apt.service?.name}</span>
                    {isLatest && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                        Mới Nhất
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#775A19] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTimeVN(apt.startTime)}</span>
                  </div>
                </div>

                <div className="text-xs text-[#424843] flex items-center gap-2">
                  <span>KTV: <strong>{apt.therapist?.name}</strong></span>
                  <span>•</span>
                  <span>Phòng: {apt.roomBed?.name}</span>
                </div>

                {/* Vitals & Notes */}
                <div className="bg-white p-2.5 rounded-lg border border-[#E5E2DD] text-xs text-[#424843] space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-red-700 font-semibold">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Chỉ số lâm sàng: Huyết áp ổn định 125/82 mmHg, Mạch 74 bpm</span>
                  </div>
                  <p className="italic text-[11px]">
                    "{apt.healthNotes || apt.postSessionFeedback || "Liệu trình diễn ra thuận lợi, cơ thể đáp ứng tốt."}"
                  </p>
                </div>

                {/* 5-Star Feedback */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    ))}
                    <span className="text-[#424843] font-medium ml-1">Đánh giá 5/5</span>
                  </div>
                  <div className="text-emerald-700 font-medium flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Đã trừ kho BOM tự động</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
