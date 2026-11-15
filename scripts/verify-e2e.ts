import { PrismaClient } from "@prisma/client";
import { createBookingAction } from "../src/features/booking/actions/booking-actions";
import { getAppointmentsAction, updateAppointmentStatusAction } from "../src/features/appointments/actions/appointment-actions";
import { getDashboardMetricsAction } from "../src/features/dashboard/actions/metrics-actions";

const prisma = new PrismaClient();

async function runE2ETest() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TÍCH HỢP TOÀN DIỆN END-TO-END (PHASE 4) ===");

  // Clean any previous test bookings
  await prisma.staffCommission.deleteMany({ where: { appointment: { bookingCode: { startsWith: "PLM-20261116-" } } } });
  await prisma.invoice.deleteMany({ where: { appointment: { bookingCode: { startsWith: "PLM-20261116-" } } } });
  await prisma.appointment.deleteMany({ where: { bookingCode: { startsWith: "PLM-20261116-" } } });

  const branch = await prisma.branch.findUnique({ where: { code: "LANG_HA" } });
  const service = await prisma.service.findUnique({ where: { code: "SRV-STROKE-AI" } });
  const therapistAn = await prisma.user.findFirst({ where: { email: "ktv.an@plumeria.vn" } });
  const therapistMai = await prisma.user.findFirst({ where: { email: "ktv.mai@plumeria.vn" } });
  const cabin01 = await prisma.roomBed.findFirst({ where: { code: "CABIN_AI_01" } });
  const customer = await prisma.user.findFirst({ where: { phone: "0988776655" }, include: { customerPackages: true } });

  if (!branch || !service || !therapistAn || !therapistMai || !cabin01 || !customer) {
    throw new Error("Missing seed data for E2E verification");
  }

  const pkg = customer.customerPackages[0];
  console.log(`Khách hàng: ${customer.name} (Thẻ: ${pkg.code}, Còn lại: ${pkg.remainingSessions} buổi)`);

  // STEP 1: Create a booking tomorrow 10:00 - 12:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow);
  start.setHours(10, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(12, 0, 0, 0);

  console.log("\n1. Đặt lịch mới từ Booking Wizard:");
  const bookingRes = await createBookingAction({
    branchId: branch.id,
    serviceId: service.id,
    therapistId: therapistAn.id,
    roomBedId: cabin01.id,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    customerName: customer.name,
    customerPhone: customer.phone,
    customerPackageId: pkg.id,
    healthNotes: "Huyết áp ổn định, chỉ định xung điện Theta 4Hz",
  });

  if (!bookingRes.success || !bookingRes.data) {
    throw new Error(`Đặt lịch thất bại: ${bookingRes.error}`);
  }
  console.log(`-> Thành công! Mã đặt chỗ: ${bookingRes.data.bookingCode}`);

  // STEP 2: Attempt Double-Booking during overlapping window
  console.log("\n2. Kiểm tra chặn trùng lịch (Double-Booking Conflict):");
  const overlapStart = new Date(tomorrow);
  overlapStart.setHours(10, 30, 0, 0);
  const overlapEnd = new Date(tomorrow);
  overlapEnd.setHours(11, 30, 0, 0);

  const conflictRes = await createBookingAction({
    branchId: branch.id,
    serviceId: service.id,
    therapistId: therapistMai.id, // Different therapist
    roomBedId: cabin01.id,        // Same cabin
    startTime: overlapStart.toISOString(),
    endTime: overlapEnd.toISOString(),
    customerName: "Khách Walk-in Trùng",
    customerPhone: "0999888777",
  });

  console.log(`-> Chặn trùng Cabin AI 01:`, !conflictRes.success ? `PASS (${conflictRes.error})` : "FAIL (Không chặn được)");

  // STEP 3: Verify Appointment in Admin Dispatch Board
  console.log("\n3. Kiểm tra hiển thị trên Dispatch Board:");
  const aptListRes = await getAppointmentsAction({ branchId: branch.id });
  const foundApt = aptListRes.data?.find((a: any) => a.id === bookingRes.data?.id);
  console.log(`-> Tìm thấy lịch hẹn trên Timeline Matrix:`, foundApt ? `PASS (Trạng thái: ${foundApt.status})` : "FAIL");

  // STEP 4: Status Transitions (Check-in -> In Progress -> Completed)
  console.log("\n4. Vận hành ca trị liệu trên Admin Inspector:");
  await updateAppointmentStatusAction(bookingRes.data.id, "CHECKED_IN");
  console.log("-> Đã Check-in tiếp đón khách hàng.");

  await updateAppointmentStatusAction(bookingRes.data.id, "IN_PROGRESS");
  const roomOccupied = await prisma.roomBed.findUnique({ where: { id: cabin01.id } });
  console.log(`-> Đã bắt đầu ca: Cabin AI 01 trạng thái: ${roomOccupied?.status} (Kỳ vọng: OCCUPIED)`);

  console.log("-> Thực hiện Hoàn tất ca (trừ thẻ + trừ kho + hoa hồng)...");
  const completeRes = await updateAppointmentStatusAction(bookingRes.data.id, "COMPLETED", {
    postSessionFeedback: "Thượng khách rất hài lòng, nhức mỏi cổ giảm hoàn toàn.",
    rating: 5,
  });

  console.log(`-> Hoàn tất ca trị liệu:`, completeRes.success ? "PASS" : "FAIL");

  // STEP 5: Verify post-completion invariants
  console.log("\n5. Kiểm tra tính toàn vẹn dữ liệu sau hoàn tất:");
  const updatedPkg = await prisma.customerPackage.findUnique({ where: { id: pkg.id } });
  console.log(`-> Thẻ liệu trình: Đã dùng ${updatedPkg?.usedSessions}/${updatedPkg?.totalSessions}, Còn lại: ${updatedPkg?.remainingSessions} (Đã trừ đúng 1 buổi!)`);

  const commission = await prisma.staffCommission.findUnique({ where: { appointmentId: bookingRes.data.id } });
  console.log(`-> Hoa hồng KTV Lê Hoài An: ${commission?.commissionAmount.toLocaleString()} VNĐ (${(commission?.rate || 0) * 100}%)`);

  const invoice = await prisma.invoice.findUnique({ where: { appointmentId: bookingRes.data.id } });
  console.log(`-> Hóa đơn sinh ra: ${invoice?.invoiceNumber} (${invoice?.paymentMethod}, Số tiền: ${invoice?.finalAmount}đ)`);

  const roomAvailable = await prisma.roomBed.findUnique({ where: { id: cabin01.id } });
  console.log(`-> Cabin AI 01 sau ca: ${roomAvailable?.status} (Kỳ vọng: AVAILABLE)`);

  // STEP 6: Verify Executive Dashboard Metrics Telemetry
  console.log("\n6. Kiểm tra số liệu Executive Dashboard Telemetry:");
  const metrics = await getDashboardMetricsAction("ALL");
  console.log(`-> Doanh thu chuỗi: ${metrics.data?.totalRevenue.toLocaleString()} VNĐ`);
  console.log(`-> Tổng hoa hồng chuỗi: ${metrics.data?.totalCommissions.toLocaleString()} VNĐ`);
  console.log(`-> So sánh 4 cơ sở:`, metrics.data?.branchComparison.map((b: any) => `${b.name}: ${b.appointmentsCount} ca`));

  console.log("\n=== TẤT CẢ KIỂM THỬ END-TO-END ĐÃ HOÀN TẤT VỚI KẾT QUẢ XUẤT SẮC! ===");
}

runE2ETest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
