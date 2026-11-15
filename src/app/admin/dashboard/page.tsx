import React from "react";
import { getDashboardMetricsAction } from "@/features/dashboard/actions/metrics-actions";
import { getRecentInvoicesAction } from "@/features/pos/actions/pos-actions";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { DashboardClientView } from "./dashboard-client-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getCurrentSessionAction();
  const branchFilter =
    session && session.role !== "SUPER_ADMIN" && session.branchId
      ? session.branchId
      : "ALL";

  const [metricsRes, invoicesRes] = await Promise.all([
    getDashboardMetricsAction(branchFilter),
    getRecentInvoicesAction(branchFilter, 8),
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
