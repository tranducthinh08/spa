"use server";

import { prisma } from "@/shared/lib/prisma";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { resolveBranch } from "@/shared/lib/resolve-branch";

export async function getInventoryStockAction(branchId?: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền truy cập kho tinh dầu." };
    }

    const whereClause: any = {};
    if (session.role === "BRANCH_MANAGER" && session.branchId) {
      whereClause.branchId = session.branchId;
    } else if (branchId && branchId !== "ALL") {
      const matched = await resolveBranch(branchId);
      whereClause.branchId = matched ? matched.id : branchId;
    }

    const inventory = await prisma.branchInventory.findMany({
      where: whereClause,
      include: {
        branch: true,
        product: true,
      },
      orderBy: { quantity: "asc" },
    });

    const lowStockAlerts = inventory.filter((item) => item.quantity <= item.reorderLevel);

    return {
      success: true,
      data: {
        inventory,
        lowStockAlerts,
        totalItems: inventory.length,
        criticalCount: lowStockAlerts.length,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateInventoryStockAction(data: {
  branchId: string;
  productId: string;
  deltaQuantity: number;
  reason?: string;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized: Chỉ Hội Đồng Quản Trị hoặc Giám Đốc Chi Nhánh mới được cập nhật kho." };
    }

    const matchedBranch = await resolveBranch(data.branchId);
    const resolvedBranchId = matchedBranch?.id || data.branchId;

    if (session.role === "BRANCH_MANAGER" && session.branchId && session.branchId !== resolvedBranchId) {
      return { success: false, error: "Bạn chỉ có quyền điều chỉnh kho của chi nhánh mình phụ trách." };
    }

    const current = await prisma.branchInventory.findUnique({
      where: {
        branchId_productId: {
          branchId: resolvedBranchId,
          productId: data.productId,
        },
      },
    });

    const currentQty = current ? current.quantity : 0;
    const newQty = currentQty + data.deltaQuantity;

    if (newQty < 0) {
      return {
        success: false,
        error: `Số lượng tồn kho không thể âm. Hiện tại còn ${currentQty}, không thể giảm ${Math.abs(data.deltaQuantity)}.`,
      };
    }

    const updated = await prisma.branchInventory.upsert({
      where: {
        branchId_productId: {
          branchId: resolvedBranchId,
          productId: data.productId,
        },
      },
      create: {
        branchId: resolvedBranchId,
        productId: data.productId,
        quantity: newQty,
        reorderLevel: 10,
      },
      update: {
        quantity: newQty,
      },
      include: { product: true, branch: true },
    });

    safeRevalidatePath("/admin/inventory");
    safeRevalidatePath("/admin/dashboard");

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRecentInvoicesAction(branchId?: string, limit = 10) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền truy cập dữ liệu thu ngân." };
    }

    const where: any = {};
    if (session.role === "BRANCH_MANAGER" && session.branchId) {
      where.branchId = session.branchId;
    } else if (branchId && branchId !== "ALL") {
      const matched = await resolveBranch(branchId);
      where.branchId = matched ? matched.id : branchId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        branch: true,
        appointment: {
          include: { service: true, therapist: true },
        },
      },
    });

    return { success: true, data: invoices };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
