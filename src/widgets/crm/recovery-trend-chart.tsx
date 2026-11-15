"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Activity, Sparkles } from "lucide-react";

export function RecoveryTrendChart() {
  const data = [
    { session: "B.1", tuankhoan: 52, mucdau: 75, sleepScore: 50 },
    { session: "B.2", tuankhoan: 58, mucdau: 65, sleepScore: 58 },
    { session: "B.3", tuankhoan: 66, mucdau: 55, sleepScore: 68 },
    { session: "B.4", tuankhoan: 74, mucdau: 42, sleepScore: 75 },
    { session: "B.5", tuankhoan: 81, mucdau: 30, sleepScore: 82 },
    { session: "B.6", tuankhoan: 88, mucdau: 20, sleepScore: 90 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#032517]">
              Đồ Thị Phục Hồi Thần Kinh & Cơ Khớp (AI Biosensor)
            </h3>
            <p className="text-xs text-[#424843]">
              Theo dõi biến thiên tuần hoàn não và mức độ giảm đau cơ sau 6 buổi
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Đáp ứng tốt (+69%)
        </span>
      </div>

      <div className="h-[240px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE9" />
            <XAxis dataKey="session" tick={{ fill: "#424843", fontSize: 12 }} />
            <YAxis tick={{ fill: "#424843", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FAF7F2",
                borderColor: "#C5A059",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="tuankhoan"
              name="Tuần Hoàn Não (%)"
              stroke="#1B3B2B"
              strokeWidth={3}
              dot={{ r: 4, fill: "#FED488" }}
            />
            <Line
              type="monotone"
              dataKey="sleepScore"
              name="Chất Lượng Giấc Ngủ (%)"
              stroke="#775A19"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0EDE9] text-xs text-[#424843] flex items-center justify-between">
        <span>Chỉ số đo từ cảm biến trường sinh học Cabin AI Delta Wave</span>
        <span className="text-[#775A19] font-medium">Bác sĩ duyệt: Đạt tiến độ</span>
      </div>
    </div>
  );
}
