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
        customer: true,
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
