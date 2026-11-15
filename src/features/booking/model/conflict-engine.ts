import { prisma } from "@/shared/lib/prisma";

export interface ConflictCheckParams {
  branchId: string;
  therapistId: string;
  roomBedId: string;
  startTime: Date;
  endTime: Date;
  excludeAppointmentId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictType?: "THERAPIST" | "ROOM" | "BOTH";
  conflictingAppointment?: {
    id: string;
    bookingCode: string;
    startTime: Date;
    endTime: Date;
    therapistName?: string;
    roomName?: string;
  };
}

/**
 * Checks for overlapping appointments for the same therapist or room/bed.
 * Overlap condition: startTime < existing.endTime AND endTime > existing.startTime
 * Active statuses: CONFIRMED, CHECKED_IN, IN_PROGRESS
 */
export async function checkBookingConflict(
  params: ConflictCheckParams
): Promise<ConflictCheckResult> {
  const { branchId, therapistId, roomBedId, startTime, endTime, excludeAppointmentId } = params;

  if (startTime >= endTime) {
    return {
      hasConflict: true,
      reason: "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.",
    };
  }

  const activeStatuses = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

  // 1. Check therapist overlap
  const therapistConflict = await prisma.appointment.findFirst({
    where: {
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      therapistId,
      status: { in: activeStatuses },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
    include: {
      therapist: { select: { name: true } },
      roomBed: { select: { name: true } },
    },
  });

  // 2. Check room overlap
  const roomConflict = await prisma.appointment.findFirst({
    where: {
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      roomBedId,
      status: { in: activeStatuses },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
    include: {
      therapist: { select: { name: true } },
      roomBed: { select: { name: true } },
    },
  });

  if (therapistConflict && roomConflict) {
    return {
      hasConflict: true,
      conflictType: "BOTH",
      reason: `Trùng cả Chuyên viên ${therapistConflict.therapist.name} và Phòng/Cabin ${roomConflict.roomBed.name} trong khung giờ này.`,
      conflictingAppointment: {
        id: therapistConflict.id,
        bookingCode: therapistConflict.bookingCode,
        startTime: therapistConflict.startTime,
        endTime: therapistConflict.endTime,
        therapistName: therapistConflict.therapist.name,
        roomName: roomConflict.roomBed.name,
      },
    };
  }

  if (therapistConflict) {
    return {
      hasConflict: true,
      conflictType: "THERAPIST",
      reason: `Chuyên viên Ngự Y ${therapistConflict.therapist.name} đã có ca trị liệu khác từ ${therapistConflict.startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} đến ${therapistConflict.endTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`,
      conflictingAppointment: {
        id: therapistConflict.id,
        bookingCode: therapistConflict.bookingCode,
        startTime: therapistConflict.startTime,
        endTime: therapistConflict.endTime,
        therapistName: therapistConflict.therapist.name,
      },
    };
  }

  if (roomConflict) {
    return {
      hasConflict: true,
      conflictType: "ROOM",
      reason: `Phòng / Cabin ${roomConflict.roomBed.name} đã được xếp ca trị liệu khác trong khung giờ này.`,
      conflictingAppointment: {
        id: roomConflict.id,
        bookingCode: roomConflict.bookingCode,
        startTime: roomConflict.startTime,
        endTime: roomConflict.endTime,
        roomName: roomConflict.roomBed.name,
      },
    };
  }

  return { hasConflict: false };
}
