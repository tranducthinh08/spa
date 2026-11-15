"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { resolveBranch } from "@/shared/lib/resolve-branch";

export async function getDashboardMetricsAction(branchId?: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền xem báo cáo điều hành chuỗi." };
    }

    let targetBranchParam = branchId;
    if (session.role === "BRANCH_MANAGER" && session.branchId) {
      targetBranchParam = session.branchId;
    }

    const matchedBranch = await resolveBranch(targetBranchParam);
    const resolvedBranchId = matchedBranch?.id;
    const isAll = !resolvedBranchId;
    const branchFilter = resolvedBranchId ? { branchId: resolvedBranchId } : {};

    // Accurate Vietnam Timezone (UTC+7) boundary computation
    const now = new Date();
    const vnDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
    const startOfToday = new Date(`${vnDateStr}T00:00:00+07:00`);
    const endOfToday = new Date(`${vnDateStr}T23:59:59.999+07:00`);

    const yesterdayDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const vnYesterdayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(yesterdayDate);
    const startOfYesterday = new Date(`${vnYesterdayStr}T00:00:00+07:00`);
    const endOfYesterday = new Date(`${vnYesterdayStr}T23:59:59.999+07:00`);

    // Unified parallel fetch across database
    const [
      revenueAgg,
      todayRevenueAgg,
      yesterdayRevenueAgg,
      packageInvoicesAgg,
      commissionsAgg,
      rooms,
      activePackagesCount,
      allBranches,
      commissions,
      todayAppointments,
      lowStockInventories,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { ...branchFilter, status: "PAID" },
        _sum: { finalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...branchFilter,
          status: "PAID",
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
        _sum: { finalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...branchFilter,
          status: "PAID",
          createdAt: { gte: startOfYesterday, lte: endOfYesterday },
        },
        _sum: { finalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          ...branchFilter,
          status: "PAID",
          appointmentId: null,
        },
        _sum: { finalAmount: true },
      }),
      prisma.staffCommission.aggregate({
        where: isAll ? {} : { appointment: { branchId: resolvedBranchId } },
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
          invoices: { where: { status: "PAID" }, select: { finalAmount: true, appointmentId: true } },
          rooms: { select: { status: true } },
          _count: { select: { appointments: true } },
        },
      }),
      prisma.staffCommission.findMany({
        where: isAll ? {} : { appointment: { branchId: resolvedBranchId } },
        include: { therapist: true },
      }),
      prisma.appointment.findMany({
        where: branchFilter,
        include: {
          customer: true,
          therapist: true,
          roomBed: true,
          service: true,
        },
        orderBy: { startTime: "asc" },
        take: 30,
      }),
      prisma.branchInventory.findMany({
        where: {
          ...branchFilter,
          quantity: { lte: 200 },
        },
        include: { product: true, branch: true },
        orderBy: { quantity: "asc" },
        take: 6,
      }),
    ]);

    const totalRevenue = revenueAgg._sum.finalAmount || 0;
    const todayRevenue = todayRevenueAgg._sum.finalAmount || 0;
    const yesterdayRevenue = yesterdayRevenueAgg._sum.finalAmount || 0;
    const packageRevenue = packageInvoicesAgg._sum.finalAmount || 0;

    const packageSharePercent = totalRevenue > 0
      ? Number(((packageRevenue / totalRevenue) * 100).toFixed(1))
      : 0;

    let revenueGrowth = 0;
    if (yesterdayRevenue > 0) {
      revenueGrowth = Number((((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1));
    } else if (todayRevenue > 0) {
      revenueGrowth = 100.0;
    } else {
      revenueGrowth = 0.0;
    }

    const totalCommissions = commissionsAgg._sum.commissionAmount || 0;

    // Room & Cabin Occupancy Calculation
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Multi-branch Comparison
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

    // Dynamic Top Services Booking Ratio
    const totalAppointmentsCount = todayAppointments.length;
    const serviceCounts = new Map<string, number>();
    for (const apt of todayAppointments) {
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
        todayRevenue,
        yesterdayRevenue,
        revenueGrowth,
        packageSharePercent,
        occupancyRate,
        totalRooms,
        occupiedRooms,
        totalCommissions,
        activePackagesCount,
        branchComparison,
        therapistLeaderboard,
        topServices,
        todayAppointments,
        lowStockInventories,
      },
    };
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return { success: false, error: error.message };
  }
}
