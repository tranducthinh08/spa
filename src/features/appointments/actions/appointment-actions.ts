"use server";

import { prisma } from "@/shared/lib/prisma";
import { completeAppointmentTransaction } from "../model/complete-session";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";

export async function getAppointmentsAction(filters?: {
  branchId?: string;
  date?: string; // YYYY-MM-DD
  therapistId?: string;
  roomBedId?: string;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Vui lòng đăng nhập cán bộ quản trị." };
    }

    const whereClause: any = {};

    if (filters?.branchId && filters.branchId !== "ALL") {
      whereClause.branchId = filters.branchId;
    }

    if (filters?.therapistId) {
      whereClause.therapistId = filters.therapistId;
    }

    if (filters?.roomBedId) {
      whereClause.roomBedId = filters.roomBedId;
    }

    // Accurate Vietnam Timezone (UTC+7) boundary handling
    if (filters?.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00+07:00`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999+07:00`);
      whereClause.startTime = { gte: startOfDay, lte: endOfDay };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
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
        service: {
          include: {
            consumables: { include: { product: true } },
          },
        },
        customerPackage: {
          include: { service: true },
        },
        invoice: true,
        commission: true,
      },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: appointments };
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return { success: false, error: error.message };
  }
}

export async function getAppointmentDetailAction(id: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: {
          include: { customerPackages: { include: { service: true } } },
        },
        therapist: true,
        roomBed: true,
        service: {
          include: {
            consumables: { include: { product: true } },
          },
        },
        customerPackage: true,
        invoice: true,
        commission: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Không tìm thấy lịch hẹn" };
    }

    return { success: true, data: appointment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  newStatus: string,
  extraData?: {
    healthNotes?: string;
    postSessionFeedback?: string;
    rating?: number;
    paymentMethod?: "CASH" | "BANK_TRANSFER" | "CARD" | "PACKAGE_REDEMPTION";
  }
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized: Quyền truy cập bị từ chối." };
    }

    const currentApt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!currentApt) {
      return { success: false, error: "Lịch hẹn không tồn tại" };
    }

    // Role-based ownership check: Therapist can only modify their own sessions
    if (session.role === "THERAPIST" && currentApt.therapistId !== session.userId) {
      return { success: false, error: "Bạn chỉ được cập nhật ca trị liệu do chính mình phụ trách." };
    }

    if (newStatus === "COMPLETED") {
      const result = await completeAppointmentTransaction({
        appointmentId,
        healthNotesUpdate: extraData?.healthNotes,
        postSessionFeedback: extraData?.postSessionFeedback,
        rating: extraData?.rating,
        paymentMethod: extraData?.paymentMethod,
      });

      safeRevalidatePath("/admin/appointments");
      safeRevalidatePath("/admin/dashboard");
      safeRevalidatePath("/admin/customers");
      return { success: true, data: result };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: newStatus,
        healthNotes: extraData?.healthNotes
          ? `${currentApt.healthNotes || ""}\n${extraData.healthNotes}`.trim()
          : currentApt.healthNotes,
      },
    });

    // Sync room bed status
    if (newStatus === "IN_PROGRESS") {
      await prisma.roomBed.update({
        where: { id: currentApt.roomBedId },
        data: { status: "OCCUPIED" },
      });
    } else if (newStatus === "CANCELLED" || newStatus === "CONFIRMED") {
      await prisma.roomBed.update({
        where: { id: currentApt.roomBedId },
        data: { status: "AVAILABLE" },
      });
    }

    safeRevalidatePath("/admin/appointments");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Status update error:", error);
    return { success: false, error: error.message };
  }
}

export async function linkPackageToAppointmentAction(
  appointmentId: string,
  customerPackageId: string | null
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Vui lòng đăng nhập quản trị/lễ tân." };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { customerPackageId },
      include: {
        customerPackage: { include: { service: true } },
        service: true,
      },
    });

    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/pos");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("linkPackageToAppointmentAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function registerPackageAndLinkAction(params: {
  appointmentId: string;
  customerId: string;
  serviceId: string;
  branchId: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CARD";
  discountAmount?: number;
}) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền đăng ký gói liệu trình." };
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
    });
    if (!service || !service.packagePrice) {
      return { success: false, error: "Dịch vụ này không có biểu phí gói liệu trình dài hạn." };
    }

    const customer = await prisma.user.findUnique({
      where: { id: params.customerId },
    });
    if (!customer) {
      return { success: false, error: "Không tìm thấy hồ sơ thượng khách." };
    }

    const totalSessions = service.packageSessions || 16;
    const basePrice = service.packagePrice;
    const discount = Math.min(basePrice, Math.max(0, params.discountAmount || 0));
    const finalAmount = Math.max(0, basePrice - discount);

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const pkgCode = `PKG-${Date.now().toString().slice(-6)}-${customer.phone.slice(-4)}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${pkgCode.slice(-4)}`;

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
        include: { service: true },
      });

      // 2. Link directly to the current appointment
      const updatedAppointment = await tx.appointment.update({
        where: { id: params.appointmentId },
        data: { customerPackageId: createdPackage.id },
        include: {
          customerPackage: { include: { service: true } },
          service: true,
          customer: true,
          therapist: true,
          roomBed: true,
        },
      });

      // 3. Create Package Purchase Invoice
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          branchId: params.branchId,
          customerId: customer.id,
          totalAmount: basePrice,
          discountAmount: discount,
          finalAmount,
          paymentMethod: params.paymentMethod,
          status: "PAID",
        },
      });

      // 4. Reward loyalty points
      await tx.user.update({
        where: { id: customer.id },
        data: { loyaltyPoints: { increment: 200 } },
      });

      return {
        package: createdPackage,
        appointment: updatedAppointment,
        invoice: createdInvoice,
      };
    });

    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/customers");
    safeRevalidatePath("/admin/pos");
    safeRevalidatePath("/admin/dashboard");

    return { success: true, data: transactionResult };
  } catch (error: any) {
    console.error("registerPackageAndLinkAction error:", error);
    return { success: false, error: error.message };
  }
}
