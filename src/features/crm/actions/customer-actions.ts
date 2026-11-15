"use server";

import { prisma } from "@/shared/lib/prisma";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";

export async function getCustomersAction(filters?: {
  search?: string;
  tier?: string;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Vui lòng đăng nhập cán bộ quản trị." };
    }

    const where: any = { role: "CUSTOMER" };

    if (filters?.tier && filters.tier !== "ALL") {
      where.membershipTier = filters.tier;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      include: {
        customerPackages: {
          include: { service: true },
        },
        customerAppointments: {
          take: 3,
          orderBy: { startTime: "desc" },
          include: { service: true, therapist: true },
        },
        _count: {
          select: {
            customerAppointments: true,
            customerPackages: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: customers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerDetailAction(id: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        customerPackages: {
          include: { service: true },
          orderBy: { createdAt: "desc" },
        },
        customerAppointments: {
          include: {
            service: true,
            therapist: true,
            roomBed: true,
            invoice: true,
          },
          orderBy: { startTime: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return { success: false, error: "Không tìm thấy thượng khách" };
    }

    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerHealthNotesAction(
  customerId: string,
  healthNotes: string
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized: Quyền truy cập bị từ chối." };
    }

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { healthNotes },
    });
    safeRevalidatePath(`/admin/customers`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function buyNewCustomerPackageAction(data: {
  customerId: string;
  serviceId: string;
  totalSessions: number;
  paymentMethod: string;
  branchId: string;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized: Chỉ Lễ Tân hoặc Quản lý mới được tạo thẻ liệu trình." };
    }

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) throw new Error("Dịch vụ không tồn tại");

    const packagePrice = service.packagePrice || service.singlePrice * data.totalSessions * 0.85;
    const pkgCode = `PKG-${Date.now().toString().slice(-6)}-${data.totalSessions}`;

    const createdPackage = await prisma.$transaction(async (tx) => {
      // 1. Create Package
      const pkg = await tx.customerPackage.create({
        data: {
          code: pkgCode,
          customerId: data.customerId,
          serviceId: data.serviceId,
          totalSessions: data.totalSessions,
          usedSessions: 0,
          remainingSessions: data.totalSessions,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          status: "ACTIVE",
        },
      });

      // 2. Create Invoice
      const invoiceNumber = `INV-PKG-${Date.now().toString().slice(-6)}`;
      await tx.invoice.create({
        data: {
          invoiceNumber,
          branchId: data.branchId,
          customerId: data.customerId,
          totalAmount: packagePrice,
          discountAmount: 0,
          finalAmount: packagePrice,
          paymentMethod: data.paymentMethod,
          status: "PAID",
        },
      });

      // 3. Loyalty bonus points (+500 pts for buying package)
      await tx.user.update({
        where: { id: data.customerId },
        data: { loyaltyPoints: { increment: 500 } },
      });

      return pkg;
    });

    safeRevalidatePath("/admin/customers");
    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/admin/pos");

    return { success: true, data: createdPackage };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
