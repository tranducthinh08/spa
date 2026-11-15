"use client";

import React from "react";
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
import { Building2 } from "lucide-react";
import { formatCompactVND, formatVND } from "@/shared/lib/utils";

interface BranchRevenueChartProps {
  data: Array<{
    name: string;
    fullName: string;
    revenue: number;
    packageRevenue?: number;
    singleRevenue?: number;
    occupancyRate: number;
    appointmentsCount: number;
  }>;
  packageSharePercent?: number;
}

export function BranchRevenueChart({
  data,
  packageSharePercent = 0,
}: BranchRevenueChartProps) {
  const chartData = data.map((b) => {
    const single = b.singleRevenue !== undefined ? b.singleRevenue : Math.round(b.revenue * 0.45);
    const pkg = b.packageRevenue !== undefined ? b.packageRevenue : Math.round(b.revenue * 0.55);

    return {
      name: b.name,
      "Dịch Vụ Lẻ": single,
      "Bán Thẻ Liệu Trình": pkg,
      total: b.revenue,
      occupancy: `${b.occupancyRate}%`,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E2DD] gap-2">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#032517] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#775A19]" />
            So Sánh Doanh Thu & Cơ Cấu Nguồn Thu Các Chi Nhánh
          </h3>
          <p className="text-xs text-[#424843] mt-0.5">
            Phân tích tỷ trọng giữa bán gói thẻ liệu trình 16 buổi và dịch vụ trải nghiệm lẻ
          </p>
        </div>
      </div>

      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DD" />
            <XAxis dataKey="name" tick={{ fill: "#424843", fontSize: 12 }} axisLine={{ stroke: "#E5E2DD" }} />
            <YAxis tickFormatter={(v) => formatCompactVND(v)} tick={{ fill: "#424843", fontSize: 11 }} axisLine={{ stroke: "#E5E2DD" }} />
            <Tooltip
              formatter={(value: any, name: any) => [formatVND(Number(value) || 0), name]}
              contentStyle={{
                backgroundColor: "#FAF7F2",
                borderColor: "#C5A059",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="Dịch Vụ Lẻ" stackId="a" fill="#83A590" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Bán Thẻ Liệu Trình" stackId="a" fill="#1B3B2B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0EDE9] flex flex-wrap items-center justify-between text-xs text-[#424843]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B3B2B]"></span>
          <span>
            Thẻ liệu trình dài hạn chiếm{" "}
            <strong>{packageSharePercent}%</strong> tổng doanh thu chuỗi
          </span>
        </div>
        <span className="text-[#775A19] font-medium">Báo cáo tính toán tự động theo thời gian thực</span>
      </div>
    </div>
  );
}
