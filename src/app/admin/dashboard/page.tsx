import React from "react";
import { getDashboardMetricsAction } from "@/features/dashboard/actions/metrics-actions";
import { getRecentInvoicesAction } from "@/features/pos/actions/pos-actions";
import { DashboardClientView } from "./dashboard-client-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metricsRes, invoicesRes] = await Promise.all([
    getDashboardMetricsAction("ALL"),
    getRecentInvoicesAction("ALL", 8),
  ]);

  const initialMetrics = metricsRes.success ? metricsRes.data : null;
  const initialInvoices = invoicesRes.success ? invoicesRes.data || [] : [];

  return (
    <DashboardClientView
      initialMetrics={initialMetrics}
      initialInvoices={initialInvoices}
    />
  );
}
