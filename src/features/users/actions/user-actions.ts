"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";
import { resolveBranch } from "@/shared/lib/resolve-branch";

export interface StaffUserInput {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "SUPER_ADMIN" | "BRANCH_MANAGER" | "RECEPTIONIST" | "THERAPIST";
  branchId?: string | null;
  specialty?: string | null;
  commissionRate?: number;
  avatar?: string | null;
}

// Lấy danh sách nhân sự cán bộ
export async function getStaffUsersAction(selectedBranch: string = "ALL") {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return { success: false, error: "Bạn không có quyền truy cập danh sách nhân sự." };
    }

    const whereClause: any = {
      role: { not: "CUSTOMER" },
    };

    // Nếu là Giám Đốc Chi Nhánh, chỉ được xem nhân sự tại chi nhánh của mình
    if (session.role === "BRANCH_MANAGER") {
      if (session.branchId) {
        whereClause.branchId = session.branchId;
      }
    } else if (selectedBranch && selectedBranch !== "ALL") {
      // Super Admin lọc theo chi nhánh cụ thể (hỗ trợ cả code lẫn cuid)
      const matched = await resolveBranch(selectedBranch);
      if (matched) {
        whereClause.branchId = matched.id;
      } else {
        whereClause.branch = { code: selectedBranch };
      }
    }

    const [staffList, branches] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          branch: true,
          _count: {
            select: {
              therapistAppointments: true,
              commissions: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      }),
      prisma.branch.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        staff: staffList,
        branches,
        currentUserRole: session.role,
        currentUserId: session.userId,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Thêm cán bộ nhân sự mới
export async function createStaffUserAction(input: StaffUserInput) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return { success: false, error: "Bạn không có quyền tạo tài khoản nhân sự." };
    }

    // Branch Manager chỉ được tạo RECEPTIONIST hoặc THERAPIST tại chi nhánh của mình
    if (session.role === "BRANCH_MANAGER") {
      if (input.role === "SUPER_ADMIN" || input.role === "BRANCH_MANAGER") {
        return { success: false, error: "Giám Đốc Chi Nhánh chỉ được bổ nhiệm Lễ Tân hoặc Kỹ Thuật Viên." };
      }
      input.branchId = session.branchId;
    }

    if (!input.name?.trim() || !input.email?.trim() || !input.phone?.trim()) {
      return { success: false, error: "Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại." };
    }

    // Kiểm tra trùng lặp email hoặc SĐT
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email.trim() }, { phone: input.phone.trim() }],
      },
    });

    if (existing) {
      return { success: false, error: "Email hoặc Số điện thoại này đã được sử dụng trong hệ thống." };
    }

    const defaultAvatars: Record<string, string> = {
      SUPER_ADMIN: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      BRANCH_MANAGER: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
      RECEPTIONIST: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      THERAPIST: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    };

    const newUser = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        password: input.password?.trim() || "admin",
        role: input.role,
        branchId: input.branchId || null,
        specialty: input.specialty?.trim() || null,
        commissionRate: input.commissionRate !== undefined ? Number(input.commissionRate) : 0.10,
        status: "ACTIVE",
        avatar: input.avatar || defaultAvatars[input.role] || defaultAvatars.THERAPIST,
      },
      include: { branch: true },
    });

    safeRevalidatePath("/admin/users");
    safeRevalidatePath("/admin/appointments");

    return {
      success: true,
      data: newUser,
      message: `Đã tạo thành công tài khoản: ${newUser.name} (${newUser.role})`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Cập nhật thông tin và đổi quyền hạn nhân sự
export async function updateStaffUserAction(id: string, input: Partial<StaffUserInput>) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return { success: false, error: "Bạn không có quyền chỉnh sửa nhân sự." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return { success: false, error: "Không tìm thấy thông tin nhân sự này." };
    }

    // Kiểm tra phạm vi của Branch Manager
    if (session.role === "BRANCH_MANAGER") {
      if (targetUser.branchId !== session.branchId) {
        return { success: false, error: "Bạn chỉ có thể chỉnh sửa nhân sự thuộc chi nhánh của mình." };
      }
      if (targetUser.role === "SUPER_ADMIN" || targetUser.role === "BRANCH_MANAGER") {
        return { success: false, error: "Bạn không thể chỉnh sửa cấp Quản lý cao hơn hoặc ngang quyền." };
      }
      if (input.role && (input.role === "SUPER_ADMIN" || input.role === "BRANCH_MANAGER")) {
        return { success: false, error: "Bạn không thể bổ nhiệm quyền Quản lý Chi Nhánh hoặc Super Admin." };
      }
    }

    // Kiểm tra trùng email hoặc phone nếu có thay đổi
    if (input.email || input.phone) {
      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(input.email ? [{ email: input.email.trim().toLowerCase() }] : []),
            ...(input.phone ? [{ phone: input.phone.trim() }] : []),
          ],
        },
      });
      if (conflict) {
        return { success: false, error: "Email hoặc Số điện thoại này đã được sử dụng bởi người khác." };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.email && { email: input.email.trim().toLowerCase() }),
        ...(input.phone && { phone: input.phone.trim() }),
        ...(input.password && { password: input.password.trim() }),
        ...(input.role && { role: input.role }),
        ...(input.branchId !== undefined && { branchId: input.branchId }),
        ...(input.specialty !== undefined && { specialty: input.specialty?.trim() || null }),
        ...(input.commissionRate !== undefined && { commissionRate: Number(input.commissionRate) }),
        ...(input.avatar && { avatar: input.avatar }),
      },
      include: { branch: true },
    });

    safeRevalidatePath("/admin/users");
    safeRevalidatePath("/admin/appointments");

    return {
      success: true,
      data: updated,
      message: `Đã cập nhật quyền hạn và hồ sơ nhân sự: ${updated.name}`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Khóa hoặc Mở khóa tài khoản nhân sự
export async function toggleUserStatusAction(id: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return { success: false, error: "Bạn không có quyền khóa tài khoản nhân sự." };
    }

    if (session.userId === id) {
      return { success: false, error: "Bạn không thể tự khóa tài khoản của chính mình." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return { success: false, error: "Không tìm thấy nhân sự." };
    }

    if (session.role === "BRANCH_MANAGER") {
      if (targetUser.branchId !== session.branchId || targetUser.role === "SUPER_ADMIN") {
        return { success: false, error: "Bạn không có quyền khóa tài khoản nhân sự này." };
      }
    }

    const newStatus = targetUser.status === "LOCKED" ? "ACTIVE" : "LOCKED";
    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });

    safeRevalidatePath("/admin/users");

    return {
      success: true,
      data: updated,
      message: newStatus === "LOCKED"
        ? `Đã tạm khóa tài khoản: ${updated.name}. Nhân sự này sẽ không thể đăng nhập.`
        : `Đã mở khóa hoạt động cho tài khoản: ${updated.name}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Xóa tài khoản an toàn
export async function deleteStaffUserAction(id: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Chỉ Hội Đồng Quản Trị (SUPER_ADMIN) mới có quyền xóa tài khoản." };
    }

    if (session.userId === id) {
      return { success: false, error: "Bạn không thể tự xóa tài khoản của chính mình." };
    }

    // Kiểm tra lịch sử trị liệu
    const apptCount = await prisma.appointment.count({
      where: { therapistId: id },
    });
    const commCount = await prisma.staffCommission.count({
      where: { therapistId: id },
    });

    if (apptCount > 0 || commCount > 0) {
      return {
        success: false,
        error: `Nhân sự này đã thực hiện ${apptCount} ca trị liệu và có ${commCount} phiếu hoa hồng. Để bảo toàn lịch sử y tế và tài chính, vui lòng dùng chức năng 'Khóa Tài Khoản' thay vì xóa.`,
      };
    }

    const deleted = await prisma.user.delete({ where: { id } });
    safeRevalidatePath("/admin/users");

    return {
      success: true,
      message: `Đã xóa tài khoản nhân sự: ${deleted.name}`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
