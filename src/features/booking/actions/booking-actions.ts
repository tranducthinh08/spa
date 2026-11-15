"use server";

import { prisma } from "@/shared/lib/prisma";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { resolveBranch } from "@/shared/lib/resolve-branch";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";

export interface CreateBookingInput {
  branchId: string;
  serviceId: string;
  therapistId: string;
  roomBedId: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerPackageId?: string;
  healthNotes?: string;
}

export async function createBookingAction(input: CreateBookingInput) {
  try {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { success: false, error: "Thời gian đặt lịch không hợp lệ." };
    }

    if (startTime >= endTime) {
      return { success: false, error: "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu." };
    }

    const cleanPhone = input.customerPhone?.trim();
    const cleanName = input.customerName?.trim();
    if (!cleanPhone || !cleanName) {
      return { success: false, error: "Vui lòng nhập họ tên và số điện thoại liên hệ." };
    }

    // Atomic transaction preventing race conditions (TOCTOU overbooking)
    const appointment = await prisma.$transaction(async (tx) => {
      const activeStatuses = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

      // 1. Conflict Check within transaction lock
      const therapistConflict = await tx.appointment.findFirst({
        where: {
          therapistId: input.therapistId,
          status: { in: activeStatuses },
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
        include: { therapist: { select: { name: true } } },
      });

      if (therapistConflict) {
        throw new Error(
          `Chuyên viên ${therapistConflict.therapist.name} vừa được xếp lịch trong khung giờ này. Vui lòng chọn khung giờ hoặc chuyên viên khác.`
        );
      }

      const roomConflict = await tx.appointment.findFirst({
        where: {
          roomBedId: input.roomBedId,
          status: { in: activeStatuses },
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
        include: { roomBed: { select: { name: true } } },
      });

      if (roomConflict) {
        throw new Error(`Phòng/Cabin ${roomConflict.roomBed.name} vừa được xếp chỗ. Vui lòng chọn giường khác.`);
      }

      // 2. Find or create Customer
      let customer = await tx.user.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { email: input.customerEmail?.trim() || "__none__" }],
        },
      });

      if (!customer) {
        customer = await tx.user.create({
          data: {
            name: cleanName,
            phone: cleanPhone,
            email: input.customerEmail?.trim() || `guest.${Date.now()}@plumeria.vn`,
            role: "CUSTOMER",
            membershipTier: "SILVER",
            healthNotes: input.healthNotes?.trim() || null,
          },
        });
      }

      // 3. Generate high-entropy Booking Code (6-digit random = 900,000 combinations)
      const dateStr = startTime.toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const bookingCode = `PLM-${dateStr}-${randomSuffix}`;

      // 4. Insert Appointment
      return await tx.appointment.create({
        data: {
          bookingCode,
          branchId: input.branchId,
          customerId: customer.id,
          therapistId: input.therapistId,
          roomBedId: input.roomBedId,
          serviceId: input.serviceId,
          customerPackageId: input.customerPackageId || null,
          startTime,
          endTime,
          status: "CONFIRMED",
          healthNotes: input.healthNotes?.trim() || customer.healthNotes,
        },
        include: {
          branch: true,
          service: true,
          therapist: true,
          roomBed: true,
          customer: true,
        },
      });
    });

    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/dashboard");

    return {
      success: true,
      data: {
        id: appointment.id,
        bookingCode: appointment.bookingCode,
        branchName: appointment.branch.name,
        serviceName: appointment.service.name,
        therapistName: appointment.therapist.name,
        roomName: appointment.roomBed.name,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBookingWizardDataAction(branchId?: string, customerPhone?: string) {
  try {
    const session = await getCurrentSessionAction().catch(() => null);
    let targetBranchParam = branchId;
    if (session && session.role !== "SUPER_ADMIN" && session.role !== "CUSTOMER" && session.branchId) {
      targetBranchParam = session.branchId;
    }
    const isAll = !targetBranchParam || targetBranchParam === "ALL";
    const matchedBranch = await resolveBranch(targetBranchParam);
    const resolvedBranchId = matchedBranch?.id;

    // Stage 1: Fetch branches & service categories in parallel
    const [branches, categories] = await Promise.all([
      prisma.branch.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      }),
      prisma.serviceCategory.findMany({
        include: { services: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    // Stage 2: Fetch rooms, therapists, and customer packages in parallel
    const [rooms, therapists, customerPackages] = await Promise.all([
      isAll
        ? prisma.roomBed.findMany({
            include: { branch: true },
            orderBy: [{ branchId: "asc" }, { name: "asc" }],
          })
        : resolvedBranchId
        ? prisma.roomBed.findMany({
            where: { branchId: resolvedBranchId },
            include: { branch: true },
            orderBy: { name: "asc" },
          })
        : [],
      prisma.user.findMany({
        where: {
          role: "THERAPIST",
          OR: isAll
            ? [{ role: "THERAPIST" }]
            : resolvedBranchId
            ? [{ branchId: resolvedBranchId }, { branchId: null }]
            : [{ role: "THERAPIST" }],
        },
        select: {
          id: true,
          name: true,
          specialty: true,
          avatar: true,
          branchId: true,
        },
      }),
      customerPhone
        ? prisma.user
            .findFirst({
              where: { phone: customerPhone.trim() },
              include: {
                customerPackages: {
                  where: { status: "ACTIVE", remainingSessions: { gt: 0 } },
                  include: { service: true },
                },
              },
            })
            .then((c) => c?.customerPackages || [])
        : Promise.resolve([]),
    ]);

    return {
      success: true,
      data: {
        branches,
        categories,
        rooms,
        therapists,
        customerPackages,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
