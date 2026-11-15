"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomersAction } from "@/features/crm/actions/customer-actions";
import { Search, Crown, Sparkles, User, ArrowRight, PlusCircle, Phone } from "lucide-react";

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("ALL");

  const loadCustomers = async () => {
    setLoading(true);
    const res = await getCustomersAction({ search, tier });
    if (res.success && res.data) {
      setCustomers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, [tier]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#032517]">
              Hồ Sơ Thượng Khách & Thẻ Liệu Trình 16 Buổi
            </h1>
            <span className="text-xs bg-[#FED488]/40 text-[#775A19] font-bold px-2.5 py-0.5 rounded-full">
              CRM 360
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-0.5">
            Quản trị hồ sơ y sinh, theo dõi thẻ liệu trình dài hạn và tích lũy điểm thưởng hoàng cung
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
            <Search className="w-3.5 h-3.5 text-[#775A19] absolute left-2.5 top-2.5" />
          </form>

          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs text-[#1C1C19] focus:outline-none"
          >
            <option value="ALL">Tất cả thứ hạng</option>
            <option value="ROYAL_VIP">Royal VIP</option>
            <option value="GOLD">Gold</option>
            <option value="SILVER">Silver</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map((cust) => {
          const isRoyal = cust.membershipTier === "ROYAL_VIP";
          const activePkg = cust.customerPackages?.[0];

          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-[#E5E2DD] hover:border-[#C5A059] transition-all p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1B3B2B] text-[#FED488] font-serif font-bold text-base flex items-center justify-center border border-[#C5A059]/40 shadow-xs">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#032517] flex items-center gap-1.5">
                        {cust.name}
                        {isRoyal && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                      </h3>
                      <div className="text-[11px] text-[#775A19] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{cust.phone}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isRoyal
                        ? "bg-[#FED488] text-[#775A19] border border-[#C5A059]/50"
                        : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {cust.membershipTier}
                  </span>
                </div>

                {/* Treatment Package Mini Preview */}
                <div className="mt-3.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD] text-xs space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#775A19] flex items-center justify-between">
                    <span>Thẻ Liệu Trình Đang Có:</span>
                    <span>{cust.customerPackages?.length || 0} Gói</span>
                  </div>

                  {activePkg ? (
                    <div>
                      <div className="font-bold text-[#032517] truncate">
                        {activePkg.service?.name}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#424843] mt-1">
                        <span>Đã dùng: <strong>{activePkg.usedSessions}/{activePkg.totalSessions}</strong></span>
                        <span className="text-emerald-700 font-semibold">Còn {activePkg.remainingSessions} buổi</span>
                      </div>
                      {/* Mini Progress bar */}
                      <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-[#1B3B2B] h-full rounded-full"
                          style={{
                            width: `${Math.round((activePkg.usedSessions / activePkg.totalSessions) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[#424843] italic text-[11px]">
                      Chưa kích hoạt thẻ dài hạn.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-4 pt-3 border-t border-[#F0EDE9] flex items-center justify-between">
                <span className="text-xs text-[#775A19] font-medium">
                  {cust.loyaltyPoints?.toLocaleString()} pts
                </span>
                <Link
                  href={`/admin/customers/${cust.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1B3B2B] hover:text-[#032517] bg-[#FED488]/40 hover:bg-[#FED488]/80 px-3 py-1.5 rounded-lg transition"
                >
                  <span>Xem Hồ Sơ 360</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
