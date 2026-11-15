"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { resolveBranch } from "@/shared/lib/resolve-branch";
import {
  DashboardPeriod,
  getPeriodDateRanges,
  generateDailyBuckets,
} from "../lib/period-helper";

export async function getDashboardMetricsAction(
  branchId?: string,
  period: DashboardPeriod = "TODAY"
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền xem báo cáo điều hành chuỗi." };
    }

    let targetBranchParam = branchId;
    if (session.role !== "SUPER_ADMIN" && session.branchId) {
      targetBranchParam = session.branchId;
    }

    const matchedBranch = await resolveBranch(targetBranchParam);
    const resolvedBranchId = matchedBranch?.id;
    const isAllBranches = !resolvedBranchId;
    const branchFilter = resolvedBranchId ? { branchId: resolvedBranchId } : {};

    // Calculate time boundaries for period & prior benchmark
    const { start, end, priorStart, priorEnd, periodLabel, priorLabel, isAll } =
      getPeriodDateRanges(period);

    const periodDateFilter = !isAll && start && end
      ? { createdAt: { gte: start, lte: end } }
      : {};

    const priorDateFilter = !isAll && priorStart && priorEnd
      ? { createdAt: { gte: priorStart, lte: priorEnd } }
      : null;

    // Parallel fetch across database
    const [
      periodRevenueAgg,
      priorRevenueAgg,
      packageInvoicesAgg,
      commissionsAgg,
      rooms,
      activePackagesCount,
      allBranches,
      commissions,
      periodAppointments,
      lowStockInventories,
      periodInvoices,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { ...branchFilter, status: "PAID", ...periodDateFilter },
        _sum: { finalAmount: true },
      }),
      priorDateFilter
        ? prisma.invoice.aggregate({
            where: { ...branchFilter, status: "PAID", ...priorDateFilter },
            _sum: { finalAmount: true },
          })
        : Promise.resolve({ _sum: { finalAmount: 0 } }),
      prisma.invoice.aggregate({
        where: {
          ...branchFilter,
          status: "PAID",
          appointmentId: null,
          ...periodDateFilter,
        },
        _sum: { finalAmount: true },
      }),
      prisma.staffCommission.aggregate({
        where: {
          ...(isAllBranches ? {} : { appointment: { branchId: resolvedBranchId } }),
          ...(!isAll && start && end ? { createdAt: { gte: start, lte: end } } : {}),
        },
        _sum: { commissionAmount: true },
      }),
      prisma.roomBed.findMany({ where: branchFilter }),
      prisma.customerPackage.count({
        where: {
          status: "ACTIVE",
          ...(resolvedBranchId
            ? {
                OR: [
                  { customer: { branchId: resolvedBranchId } },
                  { customer: { customerAppointments: { some: { branchId: resolvedBranchId } } } },
                ],
              }
            : {}),
        },
      }),
      prisma.branch.findMany({
        include: {
          invoices: {
            where: { status: "PAID", ...periodDateFilter },
            select: { finalAmount: true, appointmentId: true },
          },
          rooms: { select: { status: true } },
          _count: { select: { appointments: true } },
        },
      }),
      prisma.staffCommission.findMany({
        where: {
          ...(isAllBranches ? {} : { appointment: { branchId: resolvedBranchId } }),
          ...(!isAll && start && end ? { createdAt: { gte: start, lte: end } } : {}),
        },
        include: { therapist: true },
      }),
      prisma.appointment.findMany({
        where: {
          ...branchFilter,
          ...(!isAll && start && end ? { startTime: { gte: start, lte: end } } : {}),
        },
        include: { customer: true, therapist: true, roomBed: true, service: true },
        orderBy: { startTime: "asc" },
        take: 30,
      }),
      prisma.branchInventory.findMany({
        where: { ...branchFilter, quantity: { lte: 200 } },
        include: { product: true, branch: true },
        orderBy: { quantity: "asc" },
        take: 6,
      }),
      prisma.invoice.findMany({
        where: { ...branchFilter, status: "PAID", ...periodDateFilter },
        select: { finalAmount: true, createdAt: true },
      }),
    ]);

    const totalRevenue = periodRevenueAgg._sum.finalAmount || 0;
    const priorRevenue = priorRevenueAgg._sum?.finalAmount || 0;
    const packageRevenue = packageInvoicesAgg._sum.finalAmount || 0;

    const packageSharePercent = totalRevenue > 0
      ? Number(((packageRevenue / totalRevenue) * 100).toFixed(1))
      : 0;

    let revenueGrowth = 0;
    if (!isAll) {
      if (priorRevenue > 0) {
        revenueGrowth = Number((((totalRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1));
      } else if (totalRevenue > 0) {
        revenueGrowth = 100.0;
      } else {
        revenueGrowth = 0.0;
      }
    }

    // Daily Trend Buckets
    const vnDateOnly = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const buckets = !isAll && start && end
      ? generateDailyBuckets(start, end)
      : generateDailyBuckets(new Date(Date.now() - 6 * 24 * 3600 * 1000), new Date());

    const dailyRevenueMap = new Map<string, { revenue: number; count: number }>();
    for (const inv of periodInvoices) {
      const dStr = vnDateOnly.format(new Date(inv.createdAt));
      const cur = dailyRevenueMap.get(dStr) || { revenue: 0, count: 0 };
      cur.revenue += inv.finalAmount;
      cur.count += 1;
      dailyRevenueMap.set(dStr, cur);
    }

    const dailyTrend = buckets.map((b) => {
      const stat = dailyRevenueMap.get(b.dateStr) || { revenue: 0, count: 0 };
      return {
        date: b.dateStr,
        label: b.label,
        revenue: stat.revenue,
        invoiceCount: stat.count,
      };
    });

    const totalCommissions = commissionsAgg._sum.commissionAmount || 0;
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Multi-branch Comparison for the period
    const branchComparison = allBranches.map((b) => {
      const rev = b.invoices.reduce((s, inv) => s + inv.finalAmount, 0);
      const pkgRev = b.invoices.filter((inv) => !inv.appointmentId).reduce((s, inv) => s + inv.finalAmount, 0);
      const singleRev = rev - pkgRev;
      const bTotalRooms = b.rooms.length;
      const bOccupiedRooms = b.rooms.filter((r) => r.status === "OCCUPIED").length;
      const bOccupancyRate = bTotalRooms > 0 ? Math.round((bOccupiedRooms / bTotalRooms) * 100) : 0;

      return {
        id: b.id,
        code: b.code,
        name: b.name.replace("Plumeria ", "").split("—")[0].trim(),
        fullName: b.name,
        city: b.city,
        phone: b.phone,
        status: b.status,
        address: b.address,
        revenue: rev,
        packageRevenue: pkgRev,
        singleRevenue: singleRev,
        totalRooms: bTotalRooms,
        occupiedRooms: bOccupiedRooms,
        occupancyRate: bOccupancyRate,
        appointmentsCount: b._count.appointments,
      };
    });

    // Therapist Leaderboard
    const therapistStatsMap = new Map<string, { therapist: any; totalSessions: number; totalCommissions: number }>();
    for (const c of commissions) {
      const existing = therapistStatsMap.get(c.therapistId) || {
        therapist: c.therapist,
        totalSessions: 0,
        totalCommissions: 0,
      };
      existing.totalSessions += 1;
      existing.totalCommissions += c.commissionAmount;
      therapistStatsMap.set(c.therapistId, existing);
    }
    const therapistLeaderboard = Array.from(therapistStatsMap.values())
      .sort((a, b) => b.totalCommissions - a.totalCommissions)
      .slice(0, 5);

    // Top Services in Period
    const totalAppointmentsCount = periodAppointments.length;
    const serviceCounts = new Map<string, number>();
    for (const apt of periodAppointments) {
      const name = apt.service?.name || "Khác";
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
    }
    const topServices = Array.from(serviceCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percent: totalAppointmentsCount > 0 ? Math.round((count / totalAppointmentsCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 2);

    return {
      success: true,
      data: {
        totalRevenue,
        priorRevenue,
        revenueGrowth,
        period,
        periodLabel,
        priorLabel,
        dailyTrend,
        packageSharePercent,
        occupancyRate,
        totalRooms,
        occupiedRooms,
        totalCommissions,
        activePackagesCount,
        branchComparison,
        therapistLeaderboard,
        topServices,
        todayAppointments: periodAppointments,
        lowStockInventories,
      },
    };
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return { success: false, error: error.message };
  }
}
