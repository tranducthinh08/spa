"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Building2,
  Table as TableIcon,
  BarChart3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from "lucide-react";
import { formatCompactVND, formatVND } from "@/shared/lib/utils";
import { useRoleContext } from "@/shared/components/role-switcher-bar";

export interface BranchPerformanceItem {
  id?: string;
  code: string;
  name: string;
  fullName: string;
  city?: string;
  phone?: string;
  address?: string;
  status?: string;
  revenue: number;
  packageRevenue?: number;
  singleRevenue?: number;
  occupancyRate: number;
  appointmentsCount: number;
}

interface BranchRevenueChartProps {
  data: BranchPerformanceItem[];
  packageSharePercent?: number;
  dailyTrend?: Array<{ date: string; label: string; revenue: number; invoiceCount: number }>;
}

export function BranchRevenueChart({
  data,
  packageSharePercent = 0,
  dailyTrend,
}: BranchRevenueChartProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart" | "trend">("table");
  const { selectedBranch, setSelectedBranch } = useRoleContext();

  const totalChainRevenue = data.reduce((s, b) => s + b.revenue, 0);
  const totalChainPackages = data.reduce((s, b) => s + (b.packageRevenue || 0), 0);
  const totalChainSingle = data.reduce((s, b) => s + (b.singleRevenue || 0), 0);
  const totalChainAppointments = data.reduce((s, b) => s + b.appointmentsCount, 0);

  const chartData = data.map((b) => ({
    name: b.name,
    "Dịch Vụ Lẻ": b.singleRevenue !== undefined ? b.singleRevenue : Math.round(b.revenue * 0.45),
    "Bán Thẻ Liệu Trình": b.packageRevenue !== undefined ? b.packageRevenue : Math.round(b.revenue * 0.55),
    total: b.revenue,
    occupancy: `${b.occupancyRate}%`,
  }));

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E2DD] shadow-xs">
      {/* Header with Title, Mode Switcher & Shortcut to Management */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E2DD] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-lg text-[#032517] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#775A19]" />
              Báo Cáo Hoạt Động & Nguồn Thu Các Chi Nhánh
            </h3>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FED488]/30 text-[#775A19]">
              {data.length} Cơ sở
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-0.5">
            Chi tiết doanh thu thẻ liệu trình 16 buổi, dịch vụ trải nghiệm lẻ và công suất buồng phòng từng cơ sở
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center p-1 bg-[#FAF7F2] rounded-xl border border-[#E5E2DD] text-xs font-semibold">
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-[#112C1E] text-[#FED488] shadow-2xs"
                  : "text-[#424843] hover:text-[#032517]"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Dạng Bảng</span>
            </button>
            <button
              onClick={() => setViewMode("trend")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "trend"
                  ? "bg-[#112C1E] text-[#FED488] shadow-2xs"
                  : "text-[#424843] hover:text-[#032517]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Xu Hướng Ngày</span>
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "chart"
                  ? "bg-[#112C1E] text-[#FED488] shadow-2xs"
                  : "text-[#424843] hover:text-[#032517]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cơ Cấu Thu</span>
            </button>
          </div>

          {/* Quick link to Branch Management */}
          <Link
            href="/admin/branches"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#E5E2DD] text-xs font-semibold text-[#112C1E] transition"
            title="Quản lý thông tin chi nhánh chuỗi"
          >
            <span>Quản Lý Cơ Sở</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#775A19]" />
          </Link>
        </div>
      </div>

      {/* Content Area: Table View (Default) or Bar Chart View */}
      {viewMode === "table" ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DD] bg-[#FAF7F2]/80 text-[#775A19] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Cơ Sở Chi Nhánh</th>
                <th className="py-3 px-3 text-right">Tổng Doanh Thu</th>
                <th className="py-3 px-3 text-right">Thẻ Gói Hoàng Gia</th>
                <th className="py-3 px-3 text-right">Dịch Vụ Lẻ</th>
                <th className="py-3 px-3 text-center">Ca Đặt Lịch</th>
                <th className="py-3 px-3 text-center">Lấp Đầy Buồng</th>
                <th className="py-3 px-3 text-center">Điều Hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {data.map((b) => {
                const sharePercent =
                  totalChainRevenue > 0
                    ? ((b.revenue / totalChainRevenue) * 100).toFixed(1)
                    : "0.0";
                const isCurrent = selectedBranch === b.code;

                return (
                  <tr
                    key={b.id || b.code}
                    className={`transition hover:bg-[#FAF7F2]/60 ${
                      isCurrent ? "bg-[#FED488]/15 font-medium" : ""
                    }`}
                  >
                    {/* Branch Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#112C1E]/5 text-[#112C1E] flex items-center justify-center shrink-0 mt-0.5 font-serif font-bold text-xs border border-[#112C1E]/10">
                          {b.name.match(/\d+/)?.[0] || b.code.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
                            <span>{b.fullName}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                Đang xem
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                              {b.code}
                            </span>
                            {b.city && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-[#775A19]" />
                                {b.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-serif font-bold text-stone-900 text-[13px]">
                        {formatVND(b.revenue)}
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        {sharePercent}% toàn chuỗi
                      </div>
                    </td>

                    {/* Package Revenue */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-semibold text-emerald-900">
                        {formatVND(b.packageRevenue || 0)}
                      </div>
                      <div className="text-[10px] text-stone-400">Gói 16 buổi</div>
                    </td>

                    {/* Single Revenue */}
                    <td className="py-3.5 px-3 text-right text-stone-700 font-medium">
                      {formatVND(b.singleRevenue || 0)}
                    </td>

                    {/* Appointments Count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
                        {b.appointmentsCount} ca
                      </span>
                    </td>

                    {/* Room Occupancy */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-stone-900 text-xs">
                          {b.occupancyRate}%
                        </span>
                        <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, b.occupancyRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Switch Filter Button */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedBranch(b.code)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${isCurrent ? "bg-stone-200 text-stone-600 cursor-default" : "bg-[#112C1E] hover:bg-[#032517] text-[#FED488] shadow-2xs"}`}
                      >
                        <span>{isCurrent ? "Đang chọn" : "Xem cơ sở"}</span>
                        {!isCurrent && <ChevronRight className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Chain Summary Row */}
            <tfoot>
              <tr className="border-t-2 border-[#112C1E]/20 bg-[#FAF7F2] font-semibold text-stone-900">
                <td className="py-3.5 px-3 font-serif">
                  <div className="flex items-center gap-1.5 text-xs text-[#032517]">
                    <Sparkles className="w-3.5 h-3.5 text-[#775A19]" />
                    <span>TỔNG TOÀN CHUỖI ({data.length} Cơ Sở)</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-right font-serif font-bold text-sm text-[#032517]">{formatVND(totalChainRevenue)}</td>
                <td className="py-3.5 px-3 text-right font-bold text-emerald-800">{formatVND(totalChainPackages)}</td>
                <td className="py-3.5 px-3 text-right font-bold text-stone-800">{formatVND(totalChainSingle)}</td>
                <td className="py-3.5 px-3 text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#112C1E] text-[#FED488] text-xs">{totalChainAppointments} ca</span>
                </td>
                <td className="py-3.5 px-3 text-center text-xs text-stone-600">
                  {data.length > 0 ? `${Math.round(data.reduce((s, b) => s + b.occupancyRate, 0) / data.length)}% TB` : "0%"}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <button onClick={() => setSelectedBranch("ALL")} className="text-[11px] font-semibold text-[#775A19] hover:underline">
                    Xem toàn chuỗi
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : viewMode === "trend" ? (
        /* Daily Revenue Trend Bar Chart */
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend || []} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DD" />
              <XAxis dataKey="label" tick={{ fill: "#424843", fontSize: 11 }} axisLine={{ stroke: "#E5E2DD" }} />
              <YAxis tickFormatter={(v) => formatCompactVND(v)} tick={{ fill: "#424843", fontSize: 11 }} axisLine={{ stroke: "#E5E2DD" }} />
              <Tooltip
                formatter={(val: any) => [formatVND(Number(val) || 0), "Doanh Thu"]}
                contentStyle={{ backgroundColor: "#FAF7F2", borderColor: "#C5A059", borderRadius: "12px", fontSize: "12px" }}
              />
              <Bar dataKey="revenue" name="Doanh Thu Ngày" fill="#1B3B2B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Bar Chart View: Package vs Single */
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DD" />
              <XAxis dataKey="name" tick={{ fill: "#424843", fontSize: 11 }} axisLine={{ stroke: "#E5E2DD" }} />
              <YAxis tickFormatter={(v) => formatCompactVND(v)} tick={{ fill: "#424843", fontSize: 11 }} axisLine={{ stroke: "#E5E2DD" }} />
              <Tooltip
                formatter={(val: any, n: any) => [formatVND(Number(val) || 0), n]}
                contentStyle={{ backgroundColor: "#FAF7F2", borderColor: "#C5A059", borderRadius: "12px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar dataKey="Dịch Vụ Lẻ" stackId="a" fill="#83A590" />
              <Bar dataKey="Bán Thẻ Liệu Trình" stackId="a" fill="#1B3B2B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#F0EDE9] flex flex-wrap items-center justify-between text-xs text-[#424843]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B3B2B]"></span>
          <span>
            Thẻ liệu trình dài hạn chiếm{" "}
            <strong>{packageSharePercent}%</strong> tổng doanh thu chuỗi
          </span>
        </div>
        <span className="text-[#775A19] font-medium flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          Báo cáo tính toán tự động theo thời gian thực
        </span>
      </div>
    </div>
  );
}
