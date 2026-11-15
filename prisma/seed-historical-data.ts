import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CUSTOMER_SEEDS = [
  { name: "Trần Thị Mai", phone: "0912111001", tier: "ROYAL_VIP", notes: "Thích tinh dầu Cát Hồng, cabin số 1" },
  { name: "Nguyễn Văn Hùng", phone: "0912111002", tier: "GOLD", notes: "Đau mỏi vai gáy do ngồi văn phòng" },
  { name: "Lê Phương Thảo", phone: "0912111003", tier: "ROYAL_VIP", notes: "Khách VIP quen thuộc cơ sở Láng Hạ" },
  { name: "Phạm Thu Hằng", phone: "0912111004", tier: "SILVER", notes: "Chăm sóc da thanh xuân định kỳ" },
  { name: "Đặng Gia Huy", phone: "0912111005", tier: "GOLD", notes: "Liệu trình xung điện nhiệt AI" },
  { name: "Vũ Hải Đăng", phone: "0912111006", tier: "SILVER", notes: "Thư giãn massage body cuối tuần" },
  { name: "Bùi Tuyết Mai", phone: "0912111007", tier: "ROYAL_VIP", notes: "Sử dụng gói VIP 16 buổi Cát Hồng" },
  { name: "Hoàng Yến Nhi", phone: "0912111008", tier: "GOLD", notes: "Chăm sóc da tế bào gốc hoàng cung" },
  { name: "Dương Minh Trí", phone: "0912111009", tier: "SILVER", notes: "Trị liệu đau vai gáy định kỳ" },
  { name: "Ngô Thanh Vân", phone: "0912111010", tier: "ROYAL_VIP", notes: "Khách hàng thân thiết Ocean Park" },
  { name: "Đỗ Quốc Bảo", phone: "0912111011", tier: "GOLD", notes: "Thường xuyên đặt lịch ngoài giờ" },
  { name: "Trịnh Kim Oanh", phone: "0912111012", tier: "SILVER", notes: "Trải nghiệm liệu trình phục hồi giấc ngủ" },
];

const BRANCH_THERAPIST_MAP: Record<string, Array<{ name: string; email: string; phone: string; specialty: string }>> = {
  CAU_GIAY: [
    { name: "Trần Văn Nam", email: "ktv.nam.cg@plumeria.vn", phone: "0944001001", specialty: "Đả thông kinh lạc cổ vai gáy" },
    { name: "Lê Thị Bích", email: "ktv.bich.cg@plumeria.vn", phone: "0944001002", specialty: "Trị liệu dưỡng sinh hoàng gia" },
  ],
  SON_TAY: [
    { name: "Phạm Quỳnh Chi", email: "ktv.chi.st@plumeria.vn", phone: "0944001003", specialty: "Phòng ngừa đột quỵ & Cabin AI" },
  ],
  HAI_PHONG: [
    { name: "Đỗ Hoàng Long", email: "ktv.long.hp@plumeria.vn", phone: "0944001004", specialty: "Massage body & Thảo dược ngải" },
  ],
  BAC_NINH: [
    { name: "Nguyễn Bảo Ngọc", email: "ktv.ngoc.bn@plumeria.vn", phone: "0944001005", specialty: "Trị liệu xung điện nhiệt AI" },
  ],
  HCM_TAN_BINH: [
    { name: "Lê Minh Quân", email: "ktv.quan.tb@plumeria.vn", phone: "0944001006", specialty: "Trẻ hóa tế bào gốc & Da chuyên sâu" },
  ],
  HCM_BINH_THANH: [
    { name: "Trần Kim Ngân", email: "ktv.ngan.bt@plumeria.vn", phone: "0944001007", specialty: "Đả thông kinh lạc Hoàng Cung" },
  ],
};

async function seedHistoricalData() {
  console.log("🌱 Starting historical data seeding for past 60 days...");

  // 1. Fetch branches and their rooms
  const branches = await prisma.branch.findMany({ include: { rooms: true, users: { where: { role: "THERAPIST" } } } });
  if (branches.length === 0) throw new Error("No branches found. Run base seed first.");

  // 2. Ensure each branch has therapists
  for (const b of branches) {
    const needed = BRANCH_THERAPIST_MAP[b.code];
    if (needed && b.users.length === 0) {
      for (const t of needed) {
        const createdT = await prisma.user.upsert({
          where: { email: t.email },
          update: { branchId: b.id },
          create: {
            name: t.name,
            email: t.email,
            phone: t.phone,
            password: "admin",
            role: "THERAPIST",
            branchId: b.id,
            specialty: t.specialty,
            commissionRate: 0.12,
          },
        });
        b.users.push(createdT as any);
      }
    }
  }

  // 3. Ensure customers
  const customers: any[] = [];
  for (const c of CUSTOMER_SEEDS) {
    const cust = await prisma.user.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        name: c.name,
        email: `cust.${c.phone}@plumeria.vn`,
        phone: c.phone,
        password: "admin",
        role: "CUSTOMER",
        membershipTier: c.tier,
        healthNotes: c.notes,
      },
    });
    customers.push(cust);
  }

  // 4. Fetch services
  const services = await prisma.service.findMany();
  if (services.length === 0) throw new Error("No services found.");

  // 5. Generate past 60 days (from day -60 to day -1 before 2026-11-15)
  const baseDate = new Date(2026, 10, 15); // Nov 15, 2026
  let totalInvoicesCreated = 0;
  let totalRevenueSeeded = 0;

  for (let daysAgo = 60; daysAgo >= 1; daysAgo--) {
    const targetDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Daily volume: 7 to 12 transactions on weekdays, 12 to 18 on weekends
    const txCount = isWeekend
      ? Math.floor(Math.random() * 7) + 12
      : Math.floor(Math.random() * 6) + 7;

    const dateStr = targetDate.toISOString().slice(0, 10).replace(/-/g, "");

    for (let i = 0; i < txCount; i++) {
      // Pick random branch (give extra weight to LANG_HA and OCEAN_PARK)
      const bIndex = Math.random() < 0.35
        ? branches.findIndex((b) => b.code === "LANG_HA")
        : Math.random() < 0.5
        ? branches.findIndex((b) => b.code === "OCEAN_PARK")
        : Math.floor(Math.random() * branches.length);
      const branch = branches[Math.max(0, bIndex)];

      const room = branch.rooms[Math.floor(Math.random() * branch.rooms.length)] || branch.rooms[0];
      const therapist = branch.users[Math.floor(Math.random() * branch.users.length)] || branch.users[0];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const service = services[Math.floor(Math.random() * services.length)];

      // Timestamp between 09:00 and 20:30 Vietnam Time
      const hour = 9 + Math.floor(Math.random() * 11);
      const minute = Math.random() < 0.5 ? 0 : 30;
      const txTime = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        hour,
        minute,
        Math.floor(Math.random() * 59)
      );

      // 25% package sale, 75% single treatment session
      const isPackage = Math.random() < 0.25 && service.packagePrice;
      const amount = isPackage ? (service.packagePrice || 10800000) : service.singlePrice;
      const paymentMethods = ["BANK_TRANSFER", "BANK_TRANSFER", "CARD", "CASH"];
      const pMethod = isPackage ? "BANK_TRANSFER" : paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const invNumber = `INV-H-${dateStr}-${branch.code.slice(0, 3)}-${(totalInvoicesCreated + 1).toString().padStart(4, "0")}`;
      const bookCode = `PLM-H-${dateStr}-${(totalInvoicesCreated + 1).toString().padStart(4, "0")}`;

      // Create appointment if single session, or package session with room & therapist
      if (room && therapist) {
        const endTime = new Date(txTime.getTime() + (service.durationMinutes || 60) * 60 * 1000);
        const appt = await prisma.appointment.create({
          data: {
            bookingCode: bookCode,
            branchId: branch.id,
            customerId: customer.id,
            therapistId: therapist.id,
            roomBedId: room.id,
            serviceId: service.id,
            startTime: txTime,
            endTime,
            status: "COMPLETED",
            healthNotes: `Huyết áp ổn định. Trị liệu chuyên sâu tại ${branch.name}.`,
            createdAt: txTime,
            updatedAt: txTime,
          },
        });

        // Commission
        const commRate = therapist.commissionRate || 0.12;
        await prisma.staffCommission.create({
          data: {
            therapistId: therapist.id,
            appointmentId: appt.id,
            serviceAmount: service.singlePrice,
            rate: commRate,
            commissionAmount: Math.round(service.singlePrice * commRate),
            status: "APPROVED",
            createdAt: txTime,
            updatedAt: txTime,
          },
        });

        // Invoice
        await prisma.invoice.create({
          data: {
            invoiceNumber: invNumber,
            branchId: branch.id,
            customerId: customer.id,
            appointmentId: appt.id,
            totalAmount: amount,
            discountAmount: 0,
            finalAmount: amount,
            paymentMethod: pMethod,
            status: "PAID",
            createdAt: txTime,
            updatedAt: txTime,
          },
        });
      } else {
        // Direct package invoice without room constraint
        await prisma.invoice.create({
          data: {
            invoiceNumber: invNumber,
            branchId: branch.id,
            customerId: customer.id,
            totalAmount: amount,
            discountAmount: 0,
            finalAmount: amount,
            paymentMethod: pMethod,
            status: "PAID",
            createdAt: txTime,
            updatedAt: txTime,
          },
        });
      }

      totalInvoicesCreated++;
      totalRevenueSeeded += amount;
    }
  }

  console.log(`✅ Historical Seeding Completed!`);
  console.log(`📊 Invoices Created: ${totalInvoicesCreated}`);
  console.log(`💰 Total Revenue Seeded: ${totalRevenueSeeded.toLocaleString("vi-VN")} ₫`);
}

seedHistoricalData()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
