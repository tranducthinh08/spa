"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { resolveBranch } from "@/shared/lib/resolve-branch";

export interface CreateRoomInput {
  branchId: string;
  name: string;
  code?: string;
  type: "AI_CABIN" | "VIP_SINGLE" | "COUPLE_SUITE";
  status?: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
}

// Lấy danh sách buồng phòng của 1 chi nhánh
export async function getBranchRoomsAction(branchParam: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"].includes(session.role)) {
      return { success: false, error: "Unauthorized access: Vui lòng đăng nhập quản trị viên." };
    }

    const matched = await resolveBranch(branchParam);
    const branchId = matched?.id || branchParam;

    const rooms = await prisma.roomBed.findMany({
      where: { branchId },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return { success: true, data: rooms };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Thêm 1 buồng phòng mới
export async function createRoomAction(input: CreateRoomInput) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Chỉ Quản lý chi nhánh hoặc Hội Đồng Quản Trị mới được thêm buồng phòng." };
    }

    const matched = await resolveBranch(input.branchId);
    const branchId = matched?.id || input.branchId;

    if (!input.name?.trim()) {
      return { success: false, error: "Vui lòng nhập tên buồng phòng." };
    }

    // Tự sinh mã phòng nếu chưa có
    let roomCode = input.code?.trim().toUpperCase();
    if (!roomCode) {
      const prefix = input.type === "AI_CABIN" ? "CABIN_AI" : "VIP";
      const count = await prisma.roomBed.count({
        where: { branchId, type: input.type },
      });
      roomCode = `${prefix}_${String(count + 1).padStart(2, "0")}`;
    }

    // Đảm bảo không trùng code trong cùng branch
    const existing = await prisma.roomBed.findFirst({
      where: { branchId, code: roomCode },
    });
    if (existing) {
      roomCode = `${roomCode}_${Date.now().toString().slice(-4)}`;
    }

    const newRoom = await prisma.roomBed.create({
      data: {
        branchId,
        name: input.name.trim(),
        code: roomCode,
        type: input.type,
        status: input.status || "AVAILABLE",
      },
    });

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/booking");

    return { success: true, data: newRoom };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Cập nhật trạng thái hoặc tên buồng phòng
export async function updateRoomAction(
  roomId: string,
  input: { name?: string; type?: string; status?: string }
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Bạn không có quyền cập nhật buồng phòng." };
    }

    const updated = await prisma.roomBed.update({
      where: { id: roomId },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.type && { type: input.type }),
        ...(input.status && { status: input.status }),
      },
    });

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/dashboard");

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Xóa buồng phòng
export async function deleteRoomAction(roomId: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Chỉ Hội Đồng Quản Trị mới có quyền xóa buồng phòng." };
    }

    const room = await prisma.roomBed.findUnique({
      where: { id: roomId },
      include: { _count: { select: { appointments: true } } },
    });

    if (!room) {
      return { success: false, error: "Không tìm thấy buồng phòng này." };
    }

    if (room._count.appointments > 0) {
      return {
        success: false,
        error: `Buồng này đã phục vụ ${room._count.appointments} ca trị liệu. Bạn nên chuyển trạng thái sang "Bảo trì" thay vì xóa vĩnh viễn.`,
      };
    }

    await prisma.roomBed.delete({ where: { id: roomId } });

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/dashboard");

    return { success: true, message: `Đã xóa buồng "${room.name}".` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Thiết lập nhanh số lượng buồng phòng (Quick Scale / Batch Setup)
export async function batchSetupRoomsAction(
  branchParam: string,
  targetAiCabins: number,
  targetVipRooms: number
) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
      return { success: false, error: "Bạn không có quyền thiết lập cấu hình buồng phòng." };
    }

    const matched = await resolveBranch(branchParam);
    const branch = matched || (await prisma.branch.findUnique({ where: { id: branchParam } }));
    if (!branch) {
      return { success: false, error: "Không tìm thấy chi nhánh." };
    }

    const currentRooms = await prisma.roomBed.findMany({
      where: { branchId: branch.id },
      orderBy: { name: "asc" },
    });

    const currentAiCabins = currentRooms.filter((r) => r.type === "AI_CABIN");
    const currentVipRooms = currentRooms.filter((r) => r.type !== "AI_CABIN");

    const toCreate: Array<{
      branchId: string;
      code: string;
      name: string;
      type: string;
      status: string;
    }> = [];

    // Bổ sung Cabin AI nếu thiếu
    if (targetAiCabins > currentAiCabins.length) {
      const needed = targetAiCabins - currentAiCabins.length;
      for (let i = 1; i <= needed; i++) {
        const nextIdx = currentAiCabins.length + i;
        toCreate.push({
          branchId: branch.id,
          code: `CABIN_AI_${branch.code.slice(0, 4)}_${String(nextIdx).padStart(2, "0")}`,
          name: `Cabin Từ Trường AI ${String(nextIdx).padStart(2, "0")}`,
          type: "AI_CABIN",
          status: "AVAILABLE",
        });
      }
    }

    // Bổ sung Phòng VIP nếu thiếu
    if (targetVipRooms > currentVipRooms.length) {
      const needed = targetVipRooms - currentVipRooms.length;
      const vipNames = ["Ngự Y", "Ngải Diệp", "Trầm Hương", "Hoàng Cung", "An Nhiên", "Tịnh Tâm"];
      for (let i = 1; i <= needed; i++) {
        const nextIdx = currentVipRooms.length + i;
        const subName = vipNames[(nextIdx - 1) % vipNames.length];
        toCreate.push({
          branchId: branch.id,
          code: `VIP_${branch.code.slice(0, 4)}_${String(nextIdx).padStart(2, "0")}`,
          name: `Phòng VIP Đông Y ${String(nextIdx).padStart(2, "0")} (${subName})`,
          type: "VIP_SINGLE",
          status: "AVAILABLE",
        });
      }
    }

    if (toCreate.length > 0) {
      await prisma.roomBed.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    safeRevalidatePath("/admin/branches");
    safeRevalidatePath("/admin/appointments");
    safeRevalidatePath("/admin/dashboard");
    safeRevalidatePath("/booking");

    return {
      success: true,
      createdCount: toCreate.length,
      message: `Đã cập nhật cấu hình: ${targetAiCabins} Cabin AI & ${targetVipRooms} Phòng VIP.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
