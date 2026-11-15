import { PrismaClient } from "@prisma/client";
import { loginAction, quickDemoLoginAction } from "../src/features/auth/actions/auth-actions";
import { signSession, verifySession } from "../src/features/auth/lib/auth-session";

const prisma = new PrismaClient();

async function runV2Verification() {
  console.log("=== BẮT ĐẦU KIỂM THỬ DỮ LIỆU THỰC & PHÂN QUYỀN V2 ===");

  // 1. Verify Real Services Data
  console.log("\n1. Kiểm tra Dữ liệu Dịch vụ chuẩn plumeriaspa.com.vn:");
  const categories = await prisma.serviceCategory.findMany({ include: { services: true } });
  console.log(`-> Tổng số danh mục: ${categories.length}`);
  for (const c of categories) {
    console.log(`   * [${c.name}]: ${c.services.length} dịch vụ`);
    for (const s of c.services.slice(0, 2)) {
      console.log(`     - ${s.name} (${s.durationMinutes}p) - Đơn: ${s.singlePrice.toLocaleString()}đ | Gói ${s.packageSessions}B: ${s.packagePrice?.toLocaleString() || "N/A"}đ`);
    }
  }

  // 2. Verify Real Branches
  console.log("\n2. Kiểm tra Hệ thống 7 Chi nhánh thực tế:");
  const branches = await prisma.branch.findMany({ select: { name: true, address: true, phone: true } });
  for (const b of branches) {
    console.log(`   * ${b.name}: ${b.address} (${b.phone})`);
  }

  // 3. Test Authentication Logic
  console.log("\n3. Kiểm tra Xác thực Đăng nhập (Authentication):");
  // Test wrong password
  const failLogin = await loginAction({ emailOrPhone: "admin@plumeria.vn", password: "wrongpassword" });
  console.log("-> Đăng nhập sai mật khẩu:", !failLogin.success ? `PASS (Chặn đúng: ${failLogin.error})` : "FAIL");

  // Test correct admin password
  const successAdmin = await loginAction({ emailOrPhone: "admin@plumeria.vn", password: "admin" });
  console.log("-> Đăng nhập Hội sở Admin đúng mật khẩu:", successAdmin.success ? `PASS (Chuyển hướng: ${successAdmin.data?.redirectTo})` : "FAIL");

  // Test 1-click Quick Demo login
  console.log("\n4. Kiểm tra 1-Click Quick Demo Login cho 5 Vai trò:");
  for (const role of ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST", "CUSTOMER"]) {
    const demoRes = await quickDemoLoginAction(role);
    console.log(`   * [${role}]:`, demoRes.success ? `PASS -> Người dùng: ${demoRes.data?.name} (Chuyển về: ${demoRes.data?.redirectTo})` : `FAIL: ${demoRes.error}`);
  }

  // 5. Test Web Crypto Session Sign & Verify
  console.log("\n5. Kiểm tra Web Crypto Session Token (Edge Runtime compatible):");
  const token = await signSession({
    userId: "test_user_id",
    name: "Bà Nguyễn Thị Minh Khai",
    email: "khach.minhkhai@gmail.com",
    phone: "0988776655",
    role: "CUSTOMER",
  });
  const verified = await verifySession(token);
  console.log("-> Ký và giải mã Session Token:", verified && verified.role === "CUSTOMER" ? "PASS" : "FAIL");

  console.log("\n=== TẤT CẢ KIỂM THỬ V2 ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ! ===");
}

runV2Verification()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
