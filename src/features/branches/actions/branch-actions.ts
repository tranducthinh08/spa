"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";

export interface BranchInput {
  name: string;
  code: string;
  address: string;
  phone: string;
  city: string;
  status?: string;
  autoCreateRooms?: boolean;
  aiCabinCount?: number;
  vipRoomCount?: number;
}

export async function getBranchesAction() {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền quản lý danh mục chi nhánh." };
    }

    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        rooms: {
          select: { id: true, name: true, code: true, type: true, status: true },
        },
        invoices: {
          where: { status: "PAID" },
          select: { finalAmount: true },
        },
        _count: {
          select: {
            rooms: true,
            users: true,
            appointments: true,
            invoices: true,
          },
        },
      },
    });

    const enrichedBranches = branches.map((b) => {
      const totalRevenue = b.invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
      return {
        id: b.id,
        code: b.code,
        name: b.name,
        address: b.address,
        phone: b.phone,
        city: b.city,
        status: b.status,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        rooms: b.rooms,
        counts: b._count,
        totalRevenue,
      };
    });

    return { success: true, data: enrichedBranches };
  } catch (error: any) {
    console.error("getBranchesAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function createBranchAction(input: BranchInput) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Chỉ Hội Đồng Quản Trị (Super Admin) mới có quyền thành lập chi nhánh mới." };
    }

    const cleanCode = input.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    if (!cleanCode) {
      return { success: false, error: "Mã chi nhánh không hợp lệ. Vui lòng sử dụng chữ cái tiếng Anh in hoa và số." };
    }

    const existing = await prisma.branch.findFirst({
      where: {
        OR: [{ code: cleanCode }, { name: input.name.trim() }],
      },
    });
    if (existing) {
      return { success: false, error: `Chi nhánh với mã "${cleanCode}" hoặc tên "${input.name}" đã tồn tại trên hệ thống.` };
    }

    const newBranch = await prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({
        data: {
          code: cleanCode,
          name: input.name.trim(),
          address: input.address.trim(),
          phone: input.phone.trim(),
          city: input.city.trim() || "Hà Nội",
          status: input.status || "ACTIVE",
        },
      });

      // Tự động khởi tạo buồng trị liệu theo số lượng thiết lập
      if (input.autoCreateRooms !== false) {
        const aiCount = Math.max(1, input.aiCabinCount || 2);
        const vipCount = Math.max(1, input.vipRoomCount || 2);
        const roomsToCreate = [];

        for (let i = 1; i <= aiCount; i++) {
          roomsToCreate.push({
            branchId: branch.id,
            code: `CABIN_AI_${cleanCode.slice(0, 4)}_${String(i).padStart(2, "0")}`,
            name: `Cabin Từ Trường AI ${String(i).padStart(2, "0")}`,
            type: "AI_CABIN",
            status: "AVAILABLE",
          });
        }

        const vipNames = ["Ngự Y", "Ngải Diệp", "Trầm Hương", "Hoàng Cung", "An Nhiên", "Tịnh Tâm"];
        for (let i = 1; i <= vipCount; i++) {
          const subName = vipNames[(i - 1) % vipNames.length];
          roomsToCreate.push({
            branchId: branch.id,
            code: `VIP_${cleanCode.slice(0, 4)}_${String(i).padStart(2, "0")}`,
            name: `Phòng VIP Đông Y ${String(i).padStart(2, "0")} (${subName})`,
            type: "VIP_SINGLE",
            status: "AVAILABLE",
          });
        }

        await tx.roomBed.createMany({ data: roomsToCreate });
      }

      // Khởi tạo tồn kho ban đầu với các sản phẩm thảo dược hiện có
      const products = await tx.product.findMany({ select: { id: true } });
      if (products.length > 0) {
        await tx.branchInventory.createMany({
          data: products.map((p) => ({
            branchId: branch.id,
            productId: p.id,
            quantity: 100,
            reorderLevel: 20,
          })),
          skipDuplicates: true,
        });
      }

      return branch;
    });

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/admin/pos");
    safeRevalidatePath("/dich-vu");

    return { success: true, data: newBranch };
  } catch (error: any) {
    console.error("createBranchAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBranchAction(
  id: string,
  input: Partial<Omit<BranchInput, "autoCreateRooms">>
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Bạn không có quyền cập nhật chi nhánh." };
    }

    if (session.role === "BRANCH_MANAGER" && session.branchId !== id) {
      return { success: false, error: "Bạn chỉ có quyền hiệu chỉnh chi nhánh phụ trách của mình." };
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.address && { address: input.address.trim() }),
        ...(input.phone && { phone: input.phone.trim() }),
        ...(input.city && { city: input.city.trim() }),
        ...(input.status && { status: input.status }),
      },
    });

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/admin/pos");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("updateBranchAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBranchAction(id: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Chỉ Hội Đồng Quản Trị mới có thẩm quyền xóa/đóng cửa chi nhánh." };
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { appointments: true, invoices: true, users: true } },
      },
    });

    if (!branch) {
      return { success: false, error: "Không tìm thấy chi nhánh cần xóa." };
    }

    // Nếu chi nhánh đã có dữ liệu giao dịch tài chính hoặc lịch hẹn, chuyển sang INACTIVE thay vì xóa cứng
    if (branch._count.invoices > 0 || branch._count.appointments > 0) {
      await prisma.branch.update({
        where: { id },
        data: { status: "INACTIVE" },
      });
      safeRevalidatePath("/admin/branches");
      safeRevalidatePath("/admin/dashboard");
      return {
        success: true,
        message: `Chi nhánh "${branch.name}" đã phát sinh ${branch._count.invoices} hóa đơn tài chính nên đã được chuyển sang trạng thái "Tạm Dừng Hoạt Động" (INACTIVE) để bảo toàn sổ sách kế toán.`,
      };
    }

    await prisma.branch.delete({ where: { id } });

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/dashboard");

    return { success: true, message: `Đã xóa thành công cơ sở "${branch.name}".` };
  } catch (error: any) {
    console.error("deleteBranchAction error:", error);
    return { success: false, error: error.message };
  }
}
