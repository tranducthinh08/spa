"use client";

import React, { useEffect, useState } from "react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { getDashboardMetricsAction } from "@/features/dashboard/actions/metrics-actions";
import { getRecentInvoicesAction } from "@/features/pos/actions/pos-actions";
import { DashboardPeriod } from "@/features/dashboard/lib/period-helper";
import { ExecutiveKpis } from "@/widgets/dashboard/executive-kpis";
import { BranchRevenueChart } from "@/widgets/dashboard/branch-revenue-chart";
import { TherapistLeaderboard } from "@/widgets/dashboard/therapist-leaderboard";
import { InventoryAlertsWidget } from "@/widgets/dashboard/inventory-alerts-widget";
import { PosTransactionsStream } from "@/widgets/dashboard/pos-transactions-stream";
import { Download, RefreshCw, CalendarRange } from "lucide-react";

interface DashboardClientViewProps {
  initialMetrics: any;
  initialInvoices: any[];
}

const BRANCH_NAMES: Record<string, string> = {
  ALL: "Toàn Chuỗi Toàn Quốc",
  LANG_HA: "Cơ Sở Láng Hạ",
  OCEAN_PARK: "Cơ Sở Ocean Park",
  CAU_GIAY: "Cơ Sở Cầu Giấy",
  SON_TAY: "Cơ Sở Sơn Tây",
  HAI_PHONG: "Cơ Sở Hải Phòng",
  BAC_NINH: "Cơ Sở Bắc Ninh",
  HCM_TAN_BINH: "Cơ Sở Tân Bình",
  HCM_BINH_THANH: "Cơ Sở Bình Thạnh",
};

export function DashboardClientView({
  initialMetrics,
  initialInvoices,
}: DashboardClientViewProps) {
  const { selectedBranch } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [firstMount, setFirstMount] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("TODAY");

  const loadData = async (branch: string, period?: DashboardPeriod) => {
    const p = period || selectedPeriod;
    setLoading(true);
    const [metricsRes, invoicesRes] = await Promise.all([
      getDashboardMetricsAction(branch, p),
      getRecentInvoicesAction(branch, 8),
    ]);

    if (metricsRes.success && metricsRes.data) {
      setMetrics(metricsRes.data);
    }
    if (invoicesRes.success && invoicesRes.data) {
      setInvoices(invoicesRes.data);
    }
    setLoading(false);
  };

  const handlePeriodChange = (p: DashboardPeriod) => {
    setSelectedPeriod(p);
    loadData(selectedBranch, p);
  };

  useEffect(() => {
    if (firstMount) {
      setFirstMount(false);
      // If branch changed from default "ALL", reload for that branch
      if (selectedBranch && selectedBranch !== "ALL") {
        loadData(selectedBranch, selectedPeriod);
      }
      return;
    }
    loadData(selectedBranch, selectedPeriod);
  }, [selectedBranch]);

  const PERIOD_OPTIONS: Array<{ id: DashboardPeriod; label: string }> = [
    { id: "TODAY", label: "Hôm Nay" },
    { id: "WEEK", label: "7 Ngày Qua" },
    { id: "MONTH", label: "30 Ngày Qua" },
    { id: "THIS_MONTH", label: "Tháng Này" },
    { id: "ALL", label: "Toàn Chuỗi" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Executive Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#032517]">
              Báo Cáo Điều Hành Chuỗi & Thu Ngân POS
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FED488]/50 text-[#775A19] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-1">
            {selectedBranch === "ALL"
              ? "Dữ liệu thời gian thực hội sở và liên kết toàn chuỗi 7 chi nhánh toàn quốc"
              : `Dữ liệu thời gian thực được lọc riêng cho ${BRANCH_NAMES[selectedBranch] || selectedBranch}`}
            {metrics?.periodLabel ? ` • Kỳ báo cáo: ${metrics.periodLabel}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Segmented Control */}
          <div className="inline-flex items-center p-1 bg-[#FAF7F2] rounded-xl border border-[#E5E2DD] text-xs font-semibold">
            {PERIOD_OPTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePeriodChange(item.id)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === item.id
                    ? "bg-[#112C1E] text-[#FED488] shadow-2xs font-bold"
                    : "text-[#424843] hover:text-[#032517]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(selectedBranch, selectedPeriod)}
            disabled={loading}
            className="p-2 rounded-xl border border-[#E5E2DD] hover:bg-[#FAF7F2] text-[#424843] transition disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => alert("Báo cáo Hội Sở đã được kết xuất thành công dạng PDF/Excel.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Executive KPI Cards */}
      {metrics && (
        <ExecutiveKpis
          branchTitle={selectedBranch === "ALL" ? "Doanh Thu Toàn Chuỗi" : `Doanh Thu ${BRANCH_NAMES[selectedBranch] || selectedBranch}`}
          totalRevenue={metrics.totalRevenue}
          todayRevenue={metrics.todayRevenue}
          revenueGrowth={metrics.revenueGrowth}
          periodLabel={metrics.periodLabel}
          priorLabel={metrics.priorLabel}
          occupancyRate={metrics.occupancyRate}
          activePackagesCount={metrics.activePackagesCount}
          totalCommissions={metrics.totalCommissions}
          totalRooms={metrics.totalRooms}
          occupiedRooms={metrics.occupiedRooms}
        />
      )}

      {/* Row 2: Charts & Leaderboard (Split 60% / 40%) */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 xl:col-span-8">
            <BranchRevenueChart
              data={metrics.branchComparison}
              packageSharePercent={metrics.packageSharePercent}
              dailyTrend={metrics.dailyTrend}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <TherapistLeaderboard
              therapists={metrics.therapistLeaderboard}
              topServices={metrics.topServices}
            />
          </div>
        </div>
      )}

      {/* Row 3: Split Operational Widgets (BOM Alerts & Live POS Transactions) */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <InventoryAlertsWidget items={metrics.lowStockInventories} />
          </div>
          <div className="lg:col-span-5">
            <PosTransactionsStream invoices={invoices} />
          </div>
        </div>
      )}
    </div>
  );
}
