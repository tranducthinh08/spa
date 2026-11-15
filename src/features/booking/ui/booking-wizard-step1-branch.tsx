"use client";

import React from "react";
import { MapPin, Phone, Check, Building } from "lucide-react";

interface Step1Props {
  branches: Array<{
    id: string;
    code: string;
    name: string;
    address: string;
    phone: string;
    city: string;
  }>;
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
}

export function BookingWizardStep1Branch({
  branches,
  selectedBranchId,
  onSelectBranch,
}: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-[#032517]">
          1. Lựa Chọn Chi Nhánh Dưỡng Sinh Hoàng Gia
        </h3>
        <p className="text-xs text-[#424843]">
          Vui lòng chọn cơ sở gần nhất để hệ thống kiểm tra tình trạng buồng Cabin AI và Chuyên viên Ngự Y
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {branches.map((b) => {
          const isSelected = selectedBranchId === b.id;

          return (
            <div
              key={b.id}
              onClick={() => onSelectBranch(b.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "border-[#C5A059] bg-[#FAF7F2] shadow-md ring-1 ring-[#C5A059]"
                  : "border-[#E5E2DD] bg-white hover:border-[#C5A059]/60 hover:bg-[#FCF9F4]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#775A19] bg-[#FED488]/40 px-2 py-0.5 rounded-full">
                    {b.city}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#1B3B2B] text-[#FED488] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-sm text-[#032517] mt-2">
                  {b.name}
                </h4>

                <p className="text-xs text-[#424843] mt-1.5 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#775A19] shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E5E2DD]/70 flex items-center justify-between text-[11px] text-[#775A19]">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{b.phone}</span>
                </span>
                <span className="font-medium text-[#1B3B2B]">
                  {isSelected ? "Đã Chọn ✓" : "Chọn cơ sở"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
