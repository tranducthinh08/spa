"use client";

import React from "react";
import { Sparkles, MapPin, ShieldCheck, Stethoscope, Crown, Check, HeartHandshake } from "lucide-react";

export function EditorialLuxuryShowcase() {
  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-20">
      {/* Header & Storytelling */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] text-[#775A19] border border-[#C5A059]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            THƯỢNG PHẨM DƯỠNG SINH HOÀNG GIA & CÔNG NGHỆ CAO
          </span>
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#032517] leading-tight">
          Trị Liệu Đông Y Hoàng Gia <br className="hidden xl:inline" />
          <span className="text-[#775A19]">& Cabin Từ Trường AI</span>
        </h1>

        <p className="text-sm text-[#424843] leading-relaxed max-w-xl">
          Khơi thông 14 đường kinh lạc hòa quyện cùng công nghệ phục hồi tế bào vi mạch Cabin Từ Trường AI độc bản, trao gửi thượng khách nguồn năng lượng trường thọ và an định tuyệt đối.
        </p>
      </div>

      {/* Trust Badges Matrix */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E2DD] shadow-2xs text-[#1C1C19]">
          <MapPin className="w-3.5 h-3.5 text-[#775A19]" />
          <span>4 Chi nhánh (Hà Nội, Hải Phòng)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E2DD] shadow-2xs text-[#1C1C19]">
          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
          <span>Cabin Từ Trường AI Độc Bản</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E2DD] shadow-2xs text-[#1C1C19]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Tinh Dầu Cát Hồng Độc Quyền</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E2DD] shadow-2xs text-[#1C1C19]">
          <Stethoscope className="w-3.5 h-3.5 text-[#775A19]" />
          <span>100% Khử Khuẩn Ozone Y Tế</span>
        </div>
      </div>

      {/* Elevated Luxury Card: Thẻ Liệu Trình Phòng Ngừa Đột Quỵ */}
      <div className="rounded-2xl bg-gradient-to-br from-[#032517] via-[#1B3B2B] to-[#0D2418] text-white p-6 border-2 border-[#C5A059]/60 shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FED488] animate-pulse" />
            <span className="text-[10px] font-bold text-[#FED488] uppercase tracking-wider">
              Gói Liệu Trình Đột Phá Được Quan Tâm Nhất
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#83A590]">16 Buổi Chuyên Sâu</span>
        </div>

        <div>
          <h3 className="font-serif font-bold text-lg text-[#FAF7F2]">
            Thẻ Liệu Trình Phòng Ngừa Đột Quỵ Hoàng Gia
          </h3>
          <p className="text-xs text-[#83A590] mt-1">
            Ứng dụng sóng não Delta Wave và điện trường xoay chiều giải phóng huyết khối, đả thông 14 đường kinh lạc.
          </p>
        </div>

        {/* 16 mini dots stepper preview */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#FED488]">
            <span>Tiến trình 16 buổi phục hồi toàn diện</span>
            <span className="text-xs font-bold">16 Buổi</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
              <div
                key={n}
                className={`h-2 rounded-full ${
                  n <= 6 ? "bg-[#FED488]" : n === 7 ? "bg-[#C5A059] animate-pulse" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-[#83A590] border-t border-[#C5A059]/20">
          <span className="flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-[#FED488]" />
            Dành riêng cho Hội viên Royal VIP
          </span>
          <span className="text-[#FED488] font-bold text-sm">32.000.000đ</span>
        </div>
      </div>

      {/* Editorial Quote & Royal Seal */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD] flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#775A19]/10 text-[#775A19] flex items-center justify-center font-serif font-bold text-lg shrink-0 border border-[#C5A059]/30">
          印
        </div>
        <div>
          <p className="text-xs italic text-[#424843] leading-relaxed">
            "Chữa bệnh khi chưa phát tác, dưỡng thân khi tâm chưa mỏi — Tinh hoa Ngự y triều đình phụng sự đời sống hiện đại."
          </p>
          <div className="text-[10px] font-semibold text-[#775A19] uppercase tracking-wider mt-1">
            — Lời răn Ngự Y Viện Triều Nguyễn
          </div>
        </div>
      </div>
    </div>
  );
}
