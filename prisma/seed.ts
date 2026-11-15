import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Plumeria Spa real data from plumeriaspa.com.vn...");

  // 1. Clean existing records in dependency order
  await prisma.staffCommission.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.customerPackage.deleteMany();
  await prisma.serviceConsumable.deleteMany();
  await prisma.branchInventory.deleteMany();
  await prisma.roomBed.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // 2. Real Branches from plumeriaspa.com.vn
  const branchData = [
    { code: "LANG_HA", name: "Cơ sở 1: Plumeria Láng Hạ (Flagship)", address: "Tầng 3, 93 Láng Hạ, Q. Đống Đa, Hà Nội", phone: "024.3838.6868", city: "Hà Nội" },
    { code: "CAU_GIAY", name: "Cơ sở 2: Plumeria Cầu Giấy", address: "Số 7, ngõ 93 Trần Thái Tông, Q. Cầu Giấy, Hà Nội", phone: "024.3999.6868", city: "Hà Nội" },
    { code: "HAI_PHONG", name: "Cơ sở 3: Plumeria Hải Phòng", address: "BH0330 Vinhomes Thượng Lý, Q. Hồng Bàng, Hải Phòng", phone: "022.5888.6666", city: "Hải Phòng" },
    { code: "SON_TAY", name: "Cơ sở 4: Plumeria Sơn Tây Luxury", address: "Căn 01 Lô LKV-08, Khu Đô Thị Hud-Sơn Tây, TP Hà Nội", phone: "024.3999.8888", city: "Hà Nội" },
    { code: "BAC_NINH", name: "Cơ sở 5: Plumeria Bắc Ninh", address: "151-152 Bình Than, P. Võ Cường, Bắc Ninh", phone: "022.2888.9999", city: "Bắc Ninh" },
    { code: "HCM_TAN_BINH", name: "Cơ sở 6: Plumeria Tân Bình - TP.HCM", address: "652/7 Đường Cộng Hòa, P. Tân Bình, TP Hồ Chí Minh", phone: "028.3888.6688", city: "TP Hồ Chí Minh" },
    { code: "HCM_BINH_THANH", name: "Cơ sở 7: Plumeria Bình Thạnh - TP.HCM", address: "Tòa nhà 22-24 Ung Văn Khiêm, P. Thạnh Mỹ Tây, TP.HCM", phone: "028.3777.8899", city: "TP Hồ Chí Minh" },
  ];

  const branches: Record<string, any> = {};
  for (const b of branchData) {
    branches[b.code] = await prisma.branch.create({ data: b });
  }

  // 3. RoomBeds (Cabins & VIP Single Suites)
  const roomList = [
    { branchId: branches["LANG_HA"].id, code: "CABIN_AI_01", name: "Cabin Từ Trường AI 01", type: "AI_CABIN", status: "OCCUPIED" },
    { branchId: branches["LANG_HA"].id, code: "CABIN_AI_02", name: "Cabin Từ Trường AI 02", type: "AI_CABIN", status: "AVAILABLE" },
    { branchId: branches["LANG_HA"].id, code: "VIP_01", name: "Phòng VIP Đông Y 01 (Ngải Diệp)", type: "VIP_SINGLE", status: "AVAILABLE" },
    { branchId: branches["LANG_HA"].id, code: "VIP_02", name: "Phòng VIP Đông Y 02 (Trầm Hương)", type: "VIP_SINGLE", status: "AVAILABLE" },
    { branchId: branches["CAU_GIAY"].id, code: "CABIN_AI_03", name: "Cabin Từ Trường AI 03", type: "AI_CABIN", status: "AVAILABLE" },
    { branchId: branches["CAU_GIAY"].id, code: "VIP_03", name: "Phòng VIP Đông Y 03 (Bạch Yến)", type: "VIP_SINGLE", status: "AVAILABLE" },
    { branchId: branches["SON_TAY"].id, code: "CABIN_AI_04", name: "Cabin Từ Trường AI 04", type: "AI_CABIN", status: "AVAILABLE" },
    { branchId: branches["SON_TAY"].id, code: "VIP_04", name: "Phòng VIP Đông Y 04 (Hoàng Cung)", type: "VIP_SINGLE", status: "AVAILABLE" },
    { branchId: branches["HAI_PHONG"].id, code: "CABIN_AI_05", name: "Cabin Từ Trường AI 05", type: "AI_CABIN", status: "AVAILABLE" },
    { branchId: branches["HAI_PHONG"].id, code: "VIP_05", name: "Phòng VIP Đông Y 05 (Cát Tường)", type: "VIP_SINGLE", status: "AVAILABLE" },
  ];

  const rooms: Record<string, any> = {};
  for (const r of roomList) {
    rooms[r.code] = await prisma.roomBed.create({ data: r });
  }

  // 4. Real Categories from plumeriaspa.com.vn
  const catDongY = await prisma.serviceCategory.create({
    data: { code: "MASSAGE_TRI_LIEU", name: "Massage Trị Liệu Dưỡng Sinh", sortOrder: 1 },
  });
  const catStroke = await prisma.serviceCategory.create({
    data: { code: "TRI_LIEU_DOT_QUY", name: 'Trị Liệu "Phòng Ngừa Nguy Cơ Đột Quỵ"', sortOrder: 2 },
  });
  const catSkin = await prisma.serviceCategory.create({
    data: { code: "CHAM_SOC_DA_CONG_NGHE_CAO", name: "Làm Đẹp & Chăm Sóc Da Công Nghệ Cao", sortOrder: 3 },
  });
  const catLaser = await prisma.serviceCategory.create({
    data: { code: "TRIET_LONG_LASER", name: "Triệt Lông DIODE LASER", sortOrder: 4 },
  });

  // 5. Real Services from plumeriaspa.com.vn
  const sStroke = await prisma.service.create({
    data: {
      categoryId: catStroke.id,
      code: "SRV-STROKE-CAT-HONG",
      name: 'Trị Liệu "Phòng Ngừa Nguy Cơ Đột Quỵ" - Thông Bài Dưỡng Khí Cát Hồng Trung Hoa',
      description: "Ứng dụng phương pháp Thông bài dưỡng khí Cát Hồng kết hợp quét vi tuần hoàn và Cabin Từ Trường AI tái tạo sóng não Delta/Theta.",
      durationMinutes: 120,
      singlePrice: 2500000,
      packageSessions: 16,
      packagePrice: 32000000,
      requiresAiCabin: true,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/trung-hoa-1.jpg",
    },
  });

  const sHarmonyBody = await prisma.service.create({
    data: {
      categoryId: catDongY.id,
      code: "SRV-HARMONY-BODY",
      name: "Plumeria Harmony Body Toàn Diện",
      description: "Giúp hoạt huyết hoá ứ, bài trừ độc tố, lưu thông 14 đường kinh lạc và phục hồi chức năng tạng phủ, cơ xương khớp.",
      durationMinutes: 90,
      singlePrice: 1200000,
      packageSessions: 10,
      packagePrice: 10800000,
      requiresAiCabin: false,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg",
    },
  });

  const sHarmonyVai = await prisma.service.create({
    data: {
      categoryId: catDongY.id,
      code: "SRV-HARMONY-VAI",
      name: "Plumeria Harmony Body Vùng Cổ Vai Gáy",
      description: "Đả thông huyệt đạo Phong trì, Kiên tỉnh, Thiên trụ giải tỏa đau mỏi vai gáy mạn tính và tê bì cánh tay.",
      durationMinutes: 60,
      singlePrice: 850000,
      packageSessions: 10,
      packagePrice: 7600000,
      requiresAiCabin: false,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg",
    },
  });

  const sRelaxVip = await prisma.service.create({
    data: {
      categoryId: catDongY.id,
      code: "SRV-RELAX-VIP",
      name: "Relax VIP Dưỡng Sinh Toàn Thân Thượng Hạng",
      description: "Liệu trình thư giãn hoàng cung kết hợp đá nóng Himalaya, tinh chất ngải cứu và ngâm chân thảo mộc ngũ vị.",
      durationMinutes: 110,
      singlePrice: 1650000,
      packageSessions: 10,
      packagePrice: 14800000,
      requiresAiCabin: false,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg",
    },
  });

  const sXungDien = await prisma.service.create({
    data: {
      categoryId: catDongY.id,
      code: "SRV-XUNG-DIEN-AI",
      name: "Dịch Vụ CSSK Máy Massage Xung Điện Nhiệt AI Royal",
      description: "Thiết bị xung điện nhiệt AI điều biến tần số sinh học sâu giải phóng co thắt cơ tầng sâu.",
      durationMinutes: 60,
      singlePrice: 1100000,
      packageSessions: 5,
      packagePrice: 4950000,
      requiresAiCabin: true,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg",
    },
  });

  const sSkinThanhXuan = await prisma.service.create({
    data: {
      categoryId: catSkin.id,
      code: "SRV-SKIN-THANH-XUAN",
      name: "Chăm Sóc Da Plumeria Harmony - Đánh Thức Thanh Xuân",
      description: "Thanh tẩy tế bào chết nano ngọc trai, điện di tinh chất collagen hoàng gia tái sinh làn da căng bóng mịn màng.",
      durationMinutes: 60,
      singlePrice: 1450000,
      packageSessions: 10,
      packagePrice: 12800000,
      requiresAiCabin: false,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/da-scaled.jpg",
    },
  });

  const sStemCell = await prisma.service.create({
    data: {
      categoryId: catSkin.id,
      code: "SRV-STEM-CELL",
      name: "Liệu Pháp Tế Bào Gốc Hoàng Cung Tái Sinh Da Chuyên Sâu",
      description: "Kỹ thuật vi điểm đưa phức hợp tế bào gốc tự thân tái tạo cấu trúc hạ bì, xóa mờ nếp nhăn và trẻ hóa tầng sâu.",
      durationMinutes: 65,
      singlePrice: 2800000,
      packageSessions: 10,
      packagePrice: 25000000,
      requiresAiCabin: false,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/da-scaled.jpg",
    },
  });

  const sLaserNach = await prisma.service.create({
    data: {
      categoryId: catLaser.id,
      code: "SRV-LASER-NACH",
      name: "Triệt Lông Nách DIODE LASER Công Nghệ Băng Băng",
      description: "Bước sóng laser bán dẫn 808nm triệt tiêu nang lông tận gốc, se khít lỗ chân lông và làm sáng mịn da.",
      durationMinutes: 15,
      singlePrice: 120000,
      packageSessions: 10,
      packagePrice: 800000,
      requiresAiCabin: false,
      imageUrl: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/da-scaled.jpg",
    },
  });

  // 6. Users with real passwords & roles
  const uAdmin = await prisma.user.create({
    data: {
      name: "Hoàng Đức Long",
      email: "admin@plumeria.vn",
      phone: "0903456789",
      password: "admin",
      role: "SUPER_ADMIN",
      membershipTier: "ROYAL_VIP",
    },
  });

  const uManager = await prisma.user.create({
    data: {
      name: "Vũ Minh Châu",
      email: "manager.langha@plumeria.vn",
      phone: "0912345678",
      password: "admin",
      role: "BRANCH_MANAGER",
      branchId: branches["LANG_HA"].id,
    },
  });

  const uReceptionist = await prisma.user.create({
    data: {
      name: "Lê Thuỳ Linh",
      email: "letan.langha@plumeria.vn",
      phone: "0922334455",
      password: "admin",
      role: "RECEPTIONIST",
      branchId: branches["LANG_HA"].id,
    },
  });

  const uTherapistAn = await prisma.user.create({
    data: {
      name: "Lê Hoài An",
      email: "ktv.an@plumeria.vn",
      phone: "0933445577",
      password: "admin",
      role: "THERAPIST",
      branchId: branches["LANG_HA"].id,
      specialty: "Trị liệu phòng ngừa đột quỵ & AI",
      commissionRate: 0.15,
    },
  });

  const uTherapistMai = await prisma.user.create({
    data: {
      name: "Nguyễn Thị Mai",
      email: "ktv.mai@plumeria.vn",
      phone: "0933445566",
      password: "admin",
      role: "THERAPIST",
      branchId: branches["LANG_HA"].id,
      specialty: "Đả thông kinh lạc Hoàng Gia",
      commissionRate: 0.12,
    },
  });

  const uCustomerKhai = await prisma.user.create({
    data: {
      name: "Bà Nguyễn Thị Minh Khai",
      email: "khach.minhkhai@gmail.com",
      phone: "0988776655",
      password: "admin",
      role: "CUSTOMER",
      membershipTier: "ROYAL_VIP",
      loyaltyPoints: 3450,
      healthNotes: "Huyết áp cao 135/85 mmHg, hội chứng cổ vai gáy mạn tính. Chỉ định Thông bài dưỡng khí Cát Hồng.",
    },
  });

  // 7. Products (BOM)
  const pOilCatHong = await prisma.product.create({
    data: { code: "OIL-CAT-HONG", name: "Tinh dầu Cát Hồng độc quyền Hoàng Gia", unit: "ml", costPrice: 500, sellingPrice: 1200 },
  });
  const pNgaiCuu = await prisma.product.create({
    data: { code: "HERB-NGAI-CUU", name: "Thảo dược Ngải Diệp thượng hạng", unit: "g", costPrice: 800, sellingPrice: 2000 },
  });
  const pLinenNano = await prisma.product.create({
    data: { code: "LINEN-NANO", name: "Khăn ga trị liệu kháng khuẩn Nano Bạc", unit: "bộ", costPrice: 25000, sellingPrice: 50000 },
  });

  // 8. Branch Inventory
  await prisma.branchInventory.createMany({
    data: [
      { branchId: branches["LANG_HA"].id, productId: pOilCatHong.id, quantity: 120, reorderLevel: 200 }, // LOW STOCK
      { branchId: branches["LANG_HA"].id, productId: pNgaiCuu.id, quantity: 450, reorderLevel: 300 },
      { branchId: branches["LANG_HA"].id, productId: pLinenNano.id, quantity: 45, reorderLevel: 30 },
      { branchId: branches["CAU_GIAY"].id, productId: pOilCatHong.id, quantity: 380, reorderLevel: 200 },
    ],
  });

  // 9. Service Consumables (BOM)
  await prisma.serviceConsumable.createMany({
    data: [
      { serviceId: sStroke.id, productId: pOilCatHong.id, quantity: 30 },
      { serviceId: sStroke.id, productId: pNgaiCuu.id, quantity: 50 },
      { serviceId: sStroke.id, productId: pLinenNano.id, quantity: 1 },
      { serviceId: sHarmonyBody.id, productId: pOilCatHong.id, quantity: 25 },
      { serviceId: sHarmonyBody.id, productId: pLinenNano.id, quantity: 1 },
    ],
  });

  // 10. Customer Package
  const pkgKhai = await prisma.customerPackage.create({
    data: {
      code: "PKG-ROYAL-2026-001",
      customerId: uCustomerKhai.id,
      serviceId: sStroke.id,
      totalSessions: 16,
      usedSessions: 6,
      remainingSessions: 10,
      expiryDate: new Date(2027, 4, 15),
      status: "ACTIVE",
    },
  });

  // 11. Today's active appointments
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  await prisma.appointment.create({
    data: {
      bookingCode: "PLM-20261115-089",
      branchId: branches["LANG_HA"].id,
      customerId: uCustomerKhai.id,
      therapistId: uTherapistAn.id,
      roomBedId: rooms["CABIN_AI_01"].id,
      serviceId: sStroke.id,
      customerPackageId: pkgKhai.id,
      startTime: new Date(y, m, d, 13, 30),
      endTime: new Date(y, m, d, 15, 30),
      status: "IN_PROGRESS",
      healthNotes: "Huyết áp 125/82 mmHg, đả thông kinh lạc vai gáy bằng tinh dầu Cát Hồng.",
    },
  });

  console.log("Seeding real plumeriaspa.com.vn data finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
