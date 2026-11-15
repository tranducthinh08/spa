"use client";

import React, { useState } from "react";
import { Sparkles, Clock, Crown, Check, Search, CreditCard } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";

interface Step2Props {
  categories: Array<{
    id: string;
    name: string;
    code: string;
    services: Array<any>;
  }>;
  customerPackages: Array<any>;
  selectedServiceId: string;
  selectedPackageId: string | null;
  onSelectService: (serviceId: string, packageId?: string | null) => void;
  onSearchPhonePackages?: (phone: string) => void;
}

export function BookingWizardStep2Service({
  categories,
  customerPackages,
  selectedServiceId,
  selectedPackageId,
  onSelectService,
  onSearchPhonePackages,
}: Step2Props) {
  const [activeTab, setActiveTab] = useState<"NEW_SERVICE" | "REDEEM_PACKAGE">(
    customerPackages.length > 0 || selectedPackageId ? "REDEEM_PACKAGE" : "NEW_SERVICE"
  );
  const [phoneQuery, setPhoneQuery] = useState("");

  const allServices = categories.flatMap((c) => c.services);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-bold text-lg text-[#032517]">
          2. Chọn Liệu Trình Trị Liệu Hoặc Khấu Trừ Thẻ Có Sẵn
        </h3>
        <p className="text-xs text-[#424843]">
          Quý khách có thể đặt dịch vụ trải nghiệm mới hoặc sử dụng buổi điều trị trong thẻ 16 buổi đã sở hữu
        </p>
      </div>

      {/* Toggle Tabs */}
      <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E5E2DD] max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("NEW_SERVICE")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === "NEW_SERVICE"
              ? "bg-[#1B3B2B] text-[#FED488] shadow-xs"
              : "text-[#424843] hover:text-[#032517]"
          }`}
        >
          Liệu Trình Mới
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("REDEEM_PACKAGE")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeTab === "REDEEM_PACKAGE"
              ? "bg-[#1B3B2B] text-[#FED488] shadow-xs"
              : "text-[#424843] hover:text-[#032517]"
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Dùng Thẻ Có Sẵn ({customerPackages.length})</span>
        </button>
      </div>

      {/* Tab 1: New Services Matrix */}
      {activeTab === "NEW_SERVICE" && (
        <div className="space-y-3">
          {allServices.map((srv) => {
            const isSelected = selectedServiceId === srv.id && !selectedPackageId;

            return (
              <div
                key={srv.id}
                onClick={() => onSelectService(srv.id, null)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? "border-[#C5A059] bg-[#FAF7F2] shadow-md ring-1 ring-[#C5A059]"
                    : "border-[#E5E2DD] bg-white hover:border-[#C5A059]/60 hover:bg-[#FCF9F4]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#032517]">
                      {srv.name}
                    </h4>
                    {srv.requiresAiCabin && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Cabin AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#424843] line-clamp-2 max-w-lg">
                    {srv.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#775A19] font-medium pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{srv.durationMinutes} phút</span>
                    </span>
                    {srv.packagePrice && (
                      <span>• Gói {srv.packageSessions} buổi: {formatVND(srv.packagePrice)}</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EDE9]">
                  <div className="text-sm font-bold text-[#032517]">
                    {formatVND(srv.singlePrice)}
                  </div>
                  <span
                    className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-[#1B3B2B] text-[#FED488]"
                        : "bg-[#FAF7F2] text-[#775A19] border border-[#E5E2DD]"
                    }`}
                  >
                    {isSelected ? "Đã Chọn ✓" : "Chọn liệu trình"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Redeem Active Package */}
      {activeTab === "REDEEM_PACKAGE" && (
        <div className="space-y-3">
          {customerPackages.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#E5E2DD] text-center space-y-3">
              <CreditCard className="w-8 h-8 text-[#775A19] mx-auto" />
              <div className="text-xs text-[#424843] max-w-sm mx-auto">
                Chưa nhận diện thẻ liệu trình. Quý khách vui lòng nhập số điện thoại đăng ký gói để hệ thống tải danh sách thẻ:
              </div>
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Nhập SĐT (e.g. 0988776655)"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E2DD] text-xs text-[#1C1C19] w-full"
                />
                <button
                  type="button"
                  onClick={() => onSearchPhonePackages && onSearchPhonePackages(phoneQuery)}
                  className="px-3 py-1.5 rounded-xl bg-[#1B3B2B] text-[#FED488] text-xs font-semibold whitespace-nowrap"
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          ) : (
            customerPackages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => onSelectService(pkg.serviceId, pkg.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#C5A059] bg-[#1B3B2B] text-white shadow-lg ring-1 ring-[#C5A059]"
                      : "border-[#E5E2DD] bg-[#FAF7F2] hover:border-[#C5A059] text-[#1C1C19]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FED488] text-[#775A19] px-2 py-0.5 rounded-full">
                        Thẻ 16 Buổi • {pkg.code}
                      </span>
                      {pkg.service?.requiresAiCabin && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                          Cabin AI
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-sm mt-1">
                      {pkg.service?.name}
                    </h4>
                    <div className="text-xs opacity-90 mt-1">
                      Đã dùng: <strong>{pkg.usedSessions}/{pkg.totalSessions} buổi</strong> • Còn lại: <strong className="text-[#FED488]">{pkg.remainingSessions} buổi</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FED488] text-[#032517] shadow-sm">
                      {isSelected ? "Đang chọn trừ thẻ ✓" : "Dùng thẻ này (0đ)"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
