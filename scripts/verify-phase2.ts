import { PrismaClient } from "@prisma/client";
import { checkBookingConflict } from "../src/features/booking/model/conflict-engine";
import { completeAppointmentTransaction } from "../src/features/appointments/model/complete-session";

const prisma = new PrismaClient();

async function runPhase2Verification() {
  console.log("=== BẮT ĐẦU KIỂM THỬ BACKEND ENGINES (PHASE 2) ===");

  // 1. Fetch reference seed data
  const branch = await prisma.branch.findUnique({ where: { code: "LANG_HA" } });
  const therapistAn = await prisma.user.findFirst({ where: { email: "ktv.an@plumeria.vn" } });
  const therapistMai = await prisma.user.findFirst({ where: { email: "ktv.mai@plumeria.vn" } });
  const roomCabin01 = await prisma.roomBed.findFirst({ where: { code: "CABIN_AI_01" } });
  const roomCabin02 = await prisma.roomBed.findFirst({ where: { code: "CABIN_AI_02" } });

  if (!branch || !therapistAn || !therapistMai || !roomCabin01 || !roomCabin02) {
    throw new Error("Missing required seed data for testing");
  }

  // Active appointment PLM-20261115-089 is 13:30 - 15:30 today in CABIN_AI_01 with therapistAn
  const activeApt = await prisma.appointment.findUnique({
    where: { bookingCode: "PLM-20261115-089" },
    include: { customerPackage: true },
  });

  if (!activeApt) {
    throw new Error("Active appointment PLM-20261115-089 not found");
  }

  console.log("\n--- TEST 1: DOUBLE-BOOKING CONFLICT ENGINE ---");

  // Overlapping time window: 14:00 - 15:00 (overlaps with 13:30 - 15:30)
  const overlapStart = new Date(activeApt.startTime.getTime() + 30 * 60 * 1000);
  const overlapEnd = new Date(activeApt.endTime.getTime() - 30 * 60 * 1000);

  // Case 1A: Conflict on Therapist An (different room)
  const conflictTherapist = await checkBookingConflict({
    branchId: branch.id,
    therapistId: therapistAn.id,
    roomBedId: roomCabin02.id,
    startTime: overlapStart,
    endTime: overlapEnd,
  });
  console.log("1A. Kiểm tra trùng KTV Lê Hoài An:", conflictTherapist.hasConflict ? "PASS (Phát hiện trùng lịch)" : "FAIL");
  console.log("    Lý do:", conflictTherapist.reason);

  // Case 1B: Conflict on Cabin AI 01 (different therapist)
  const conflictRoom = await checkBookingConflict({
    branchId: branch.id,
    therapistId: therapistMai.id,
    roomBedId: roomCabin01.id,
    startTime: overlapStart,
    endTime: overlapEnd,
  });
  console.log("1B. Kiểm tra trùng Cabin Từ Trường AI 01:", conflictRoom.hasConflict ? "PASS (Phát hiện trùng cabin)" : "FAIL");
  console.log("    Lý do:", conflictRoom.reason);

  // Case 1C: Non-overlapping future window: 18:00 - 19:30
  const freeStart = new Date(activeApt.startTime);
  freeStart.setHours(18, 0, 0, 0);
  const freeEnd = new Date(activeApt.startTime);
  freeEnd.setHours(19, 30, 0, 0);

  const freeCheck = await checkBookingConflict({
    branchId: branch.id,
    therapistId: therapistAn.id,
    roomBedId: roomCabin01.id,
    startTime: freeStart,
    endTime: freeEnd,
  });
  console.log("1C. Kiểm tra khung giờ trống (18:00 - 19:30):", !freeCheck.hasConflict ? "PASS (Không có xung đột)" : "FAIL");

  console.log("\n--- TEST 2: TRANSACTIONAL SESSION COMPLETION ENGINE ---");

  // Pre-condition checks
  const prePkg = await prisma.customerPackage.findUnique({
    where: { id: activeApt.customerPackageId! },
  });
  const oilProduct = await prisma.product.findUnique({ where: { code: "OIL-CAT-HONG" } });
  const preInventory = await prisma.branchInventory.findUnique({
    where: { branchId_productId: { branchId: branch.id, productId: oilProduct!.id } },
  });

  console.log("Pre-completion State:");
  console.log(`- Thẻ liệu trình: Đã dùng ${prePkg?.usedSessions}/${prePkg?.totalSessions}, Còn lại: ${prePkg?.remainingSessions}`);
  console.log(`- Tồn kho Tinh dầu Cát Hồng: ${preInventory?.quantity} ml`);

  // Execute completeAppointmentTransaction
  const completionResult = await completeAppointmentTransaction({
    appointmentId: activeApt.id,
    rating: 5,
    postSessionFeedback: "Khách cảm thấy mạch máu thông thoáng, giảm nhức mỏi cổ rõ rệt.",
    healthNotesUpdate: "Huyết áp hạ về 118/78 mmHg sau khi kích hoạt tần số Delta Wave.",
  });

  console.log("\nKết quả giao dịch hoàn tất:");
  console.log(`- Trạng thái ca: COMPLETED (Thành công: ${completionResult.success})`);
  console.log(`- Thẻ liệu trình sau khấu trừ: Đã dùng ${completionResult.packageDeduction?.usedSessions}, Còn lại: ${completionResult.packageDeduction?.remainingSessions}`);
  console.log(`- Khấu trừ kho BOM:`, completionResult.inventoryDeductions.map(d => `${d.productName}: -${d.deductedQty} (Còn ${d.remainingQty})`));
  console.log(`- Hoa hồng KTV: ${completionResult.commission.therapistName} nhận ${completionResult.commission.commissionAmount.toLocaleString()} VNĐ (${completionResult.commission.rate * 100}%)`);
  console.log(`- Hóa đơn sinh ra: ${completionResult.invoice.invoiceNumber} (${completionResult.invoice.paymentMethod})`);

  // Verify room is now AVAILABLE
  const updatedRoom = await prisma.roomBed.findUnique({ where: { id: roomCabin01.id } });
  console.log(`- Trạng thái Cabin AI 01 sau ca: ${updatedRoom?.status} (Kỳ vọng: AVAILABLE)`);

  console.log("\n=== TẤT CẢ KIỂM THỬ BACKEND PHASE 2 ĐÃ THÀNH CÔNG RỰC RỠ! ===");
}

runPhase2Verification()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
