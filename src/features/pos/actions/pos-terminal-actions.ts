"use server";

import { prisma } from "@/shared/lib/prisma";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { completeAppointmentTransaction } from "@/features/appointments/model/complete-session";
import { resolveBranch } from "@/shared/lib/resolve-branch";

export async function getPosTerminalDataAction(branchId?: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Vui lòng đăng nhập tài khoản thu ngân/quản lý." };
    }

    let targetBranch = branchId;
    if (session.role === "BRANCH_MANAGER" && session.branchId) {
      targetBranch = session.branchId;
    }

    const matchedBranch = await resolveBranch(targetBranch);
    const resolvedBranchId = matchedBranch?.id;
    const branchFilter = resolvedBranchId ? { branchId: resolvedBranchId } : {};

    // Parallel fetch of all POS terminal dependencies
    const [appointments, packageServices, customers, branches, todayInvoices] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          ...branchFilter,
          status: { in: ["IN_PROGRESS", "CONFIRMED", "CHECKED_IN"] },
        },
        include: {
          customer: {
            include: {
              customerPackages: {
                where: { status: "ACTIVE" },
                include: { service: true },
              },
            },
          },
          therapist: true,
          roomBed: true,
          service: true,
          customerPackage: true,
          branch: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.service.findMany({
        where: { packagePrice: { not: null } },
        include: { category: true },
        orderBy: { singlePrice: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: {
          customerPackages: {
            where: { status: "ACTIVE" },
            include: { service: true },
          },
        },
        orderBy: { name: "asc" },
        take: 50,
      }),
      prisma.branch.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      }),
      prisma.invoice.findMany({
        where: branchFilter,
        include: {
          customer: true,
          branch: true,
          appointment: {
            include: { service: true, therapist: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    return {
      success: true,
      data: {
        appointments,
        packageServices,
        customers,
        branches,
        todayInvoices,
      },
    };
  } catch (error: any) {
    console.error("getPosTerminalDataAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function checkoutAppointmentAction(params: {
  appointmentId: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CARD" | "PACKAGE_REDEMPTION";
  discountAmount?: number;
  postSessionFeedback?: string;
  rating?: number;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Vui lòng đăng nhập thu ngân." };
    }

    const result = await completeAppointmentTransaction(params);

    safeRevalidatePath("/admin/pos");
    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/admin/inventory");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("checkoutAppointmentAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function sellPackageAction(params: {
  customerId: string;
  serviceId: string;
  branchId: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CARD";
  discountAmount?: number;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền bán gói liệu trình." };
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
    });
    if (!service || !service.packagePrice) {
      return { success: false, error: "Không tìm thấy dịch vụ hoặc gói liệu trình hợp lệ." };
    }

    const customer = await prisma.user.findUnique({
      where: { id: params.customerId },
    });
    if (!customer) {
      return { success: false, error: "Không tìm thấy thông tin thượng khách." };
    }

    const totalSessions = service.packageSessions || 16;
    const basePrice = service.packagePrice;
    const discount = Math.min(basePrice, Math.max(0, params.discountAmount || 0));
    const finalAmount = Math.max(0, basePrice - discount);

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1-year validity

    const pkgCode = `PKG-${Date.now().toString().slice(-6)}-${customer.phone.slice(-4)}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${pkgCode.slice(-4)}`;

    const matchedBranch = await resolveBranch(params.branchId);
    const resolvedBranchId = matchedBranch?.id || params.branchId;

    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Create CustomerPackage
      const createdPackage = await tx.customerPackage.create({
        data: {
          code: pkgCode,
          customerId: customer.id,
          serviceId: service.id,
          totalSessions,
          usedSessions: 0,
          remainingSessions: totalSessions,
          expiryDate,
          status: "ACTIVE",
        },
        include: { service: true, customer: true },
      });

      // 2. Create Invoice
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          branchId: resolvedBranchId,
          customerId: customer.id,
          totalAmount: basePrice,
          discountAmount: discount,
          finalAmount,
          paymentMethod: params.paymentMethod,
          status: "PAID",
        },
        include: { customer: true, branch: true },
      });

      // 3. Increment customer loyalty points (+200 pts for package purchase)
      await tx.user.update({
        where: { id: customer.id },
        data: { loyaltyPoints: { increment: 200 } },
      });

      return {
        package: createdPackage,
        invoice: createdInvoice,
      };
    });

    safeRevalidatePath("/admin/pos");
    safeRevalidatePath("/admin/customers");
    safeRevalidatePath("/admin/dashboard");

    return { success: true, data: transactionResult };
  } catch (error: any) {
    console.error("sellPackageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function getFilteredInvoicesAction(filters: {
  branchId?: string;
  paymentMethod?: string;
  date?: string;
}) {
  try {
    const where: any = {};
    if (filters.branchId && filters.branchId !== "ALL") {
      const matched = await resolveBranch(filters.branchId);
      where.branchId = matched?.id || filters.branchId;
    }
    if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00+07:00`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999+07:00`);
      where.createdAt = { gte: startOfDay, lte: endOfDay };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        branch: true,
        appointment: {
          include: { service: true, therapist: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { success: true, data: invoices };
  } catch (error: any) {
    console.error("getFilteredInvoicesAction error:", error);
    return { success: false, error: error.message };
  }
}
