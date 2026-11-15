"use client";

import React, { useEffect, useState } from "react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { getDashboardMetricsAction } from "@/features/dashboard/actions/metrics-actions";
import { getRecentInvoicesAction } from "@/features/pos/actions/pos-actions";
import { ExecutiveKpis } from "@/widgets/dashboard/executive-kpis";
import { BranchRevenueChart } from "@/widgets/dashboard/branch-revenue-chart";
import { TherapistLeaderboard } from "@/widgets/dashboard/therapist-leaderboard";
import { InventoryAlertsWidget } from "@/widgets/dashboard/inventory-alerts-widget";
import { PosTransactionsStream } from "@/widgets/dashboard/pos-transactions-stream";
import { Download, RefreshCw } from "lucide-react";

interface DashboardClientViewProps {
  initialMetrics: any;
  initialInvoices: any[];
}

export function DashboardClientView({
  initialMetrics,
  initialInvoices,
}: DashboardClientViewProps) {
  const { selectedBranch } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [firstMount, setFirstMount] = useState(true);

  const loadData = async (branch: string) => {
    setLoading(true);
    const [metricsRes, invoicesRes] = await Promise.all([
      getDashboardMetricsAction(branch),
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

  useEffect(() => {
    if (firstMount) {
      setFirstMount(false);
      // If branch changed from default "ALL", reload for that branch
      if (selectedBranch && selectedBranch !== "ALL") {
        loadData(selectedBranch);
      }
      return;
    }
    loadData(selectedBranch);
  }, [selectedBranch]);

  return (
    <div className="space-y-6">
      {/* Top Header & Executive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
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
            Dữ liệu thời gian thực hội sở và liên kết 4 chi nhánh toàn quốc
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(selectedBranch)}
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
            <span>Xuất Báo Cáo Hội Sở</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Executive KPI Cards */}
      {metrics && (
        <ExecutiveKpis
          totalRevenue={metrics.totalRevenue}
          todayRevenue={metrics.todayRevenue}
          revenueGrowth={metrics.revenueGrowth}
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
