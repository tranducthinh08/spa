"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";

export async function getDashboardMetricsAction(branchId?: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền xem báo cáo điều hành chuỗi." };
    }

    // Branch Managers are strictly scoped to their own branch
    let targetBranchId = branchId;
    if (session.role === "BRANCH_MANAGER" && session.branchId) {
      targetBranchId = session.branchId;
    }

    const isAll = !targetBranchId || targetBranchId === "ALL";
    const branchFilter = isAll ? {} : { branchId: targetBranchId };

    // 1. Optimized Revenue Aggregation directly in DB
    const [revenueAgg, commissionsAgg, rooms, activePackagesCount, allBranches] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          ...branchFilter,
          status: "PAID",
        },
        _sum: { finalAmount: true },
      }),
      prisma.staffCommission.aggregate({
        where: isAll ? {} : { appointment: { branchId: targetBranchId } },
        _sum: { commissionAmount: true },
      }),
      prisma.roomBed.findMany({
        where: branchFilter,
      }),
      prisma.customerPackage.count({
        where: { status: "ACTIVE" },
      }),
      prisma.branch.findMany({
        include: {
          invoices: { where: { status: "PAID" }, select: { finalAmount: true } },
          rooms: { select: { status: true } },
          _count: { select: { appointments: true } },
        },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.finalAmount || 0;
    const totalCommissions = commissionsAgg._sum.commissionAmount || 0;

    // 2. Room & Cabin Occupancy Calculation
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 3. Multi-branch Comparison
    const branchComparison = allBranches.map((b) => {
      const rev = b.invoices.reduce((s, inv) => s + inv.finalAmount, 0);
      const bTotalRooms = b.rooms.length;
      const bOccupiedRooms = b.rooms.filter((r) => r.status === "OCCUPIED").length;
      const bOccupancyRate = bTotalRooms > 0 ? Math.round((bOccupiedRooms / bTotalRooms) * 100) : 0;

      return {
        id: b.id,
        code: b.code,
        name: b.name.replace("Plumeria ", "").split("—")[0].trim(),
        fullName: b.name,
        revenue: rev,
        totalRooms: bTotalRooms,
        occupiedRooms: bOccupiedRooms,
        occupancyRate: bOccupancyRate,
        appointmentsCount: b._count.appointments,
      };
    });

    // 4. Therapist Leaderboard (top 5 by commissions)
    const commissions = await prisma.staffCommission.findMany({
      where: isAll ? {} : { appointment: { branchId: targetBranchId } },
      include: { therapist: true },
    });

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

    // 5. Today's Appointments by Status
    const todayAppointments = await prisma.appointment.findMany({
      where: branchFilter,
      include: {
        customer: true,
        therapist: true,
        roomBed: true,
        service: true,
      },
      orderBy: { startTime: "asc" },
      take: 20,
    });

    // 6. Low Stock BOM Alerts
    const lowStockInventories = await prisma.branchInventory.findMany({
      where: {
        ...branchFilter,
        quantity: { lte: 200 },
      },
      include: { product: true, branch: true },
      orderBy: { quantity: "asc" },
      take: 6,
    });

    return {
      success: true,
      data: {
        totalRevenue,
        occupancyRate,
        totalRooms,
        occupiedRooms,
        totalCommissions,
        activePackagesCount,
        branchComparison,
        therapistLeaderboard,
        todayAppointments,
        lowStockInventories,
      },
    };
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return { success: false, error: error.message };
  }
}
