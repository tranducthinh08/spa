"use server";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { safeRevalidatePath } from "@/shared/lib/safe-revalidate";

export interface ServiceInput {
  id?: string;
  categoryId: string;
  name: string;
  code?: string;
  description?: string;
  durationMinutes: number;
  singlePrice: number;
  packageSessions?: number;
  packagePrice?: number;
  requiresAiCabin: boolean;
  imageUrl?: string;
}

// Lấy danh sách dịch vụ và chuyên mục cho trang Admin
export async function getAdminServicesAction() {
  try {
    const [services, categories] = await Promise.all([
      prisma.service.findMany({
        include: {
          category: true,
          _count: {
            select: {
              appointments: true,
              customerPackages: true,
            },
          },
        },
        orderBy: [{ categoryId: "asc" }, { createdAt: "desc" }],
      }),
      prisma.serviceCategory.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        services,
        categories,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Lấy riêng danh mục chuyên mục
export async function getCategoriesAction() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Tạo dịch vụ mới (chỉ SUPER_ADMIN và BRANCH_MANAGER)
export async function createServiceAction(input: ServiceInput) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return {
        success: false,
        error: "Bạn không có quyền tạo dịch vụ. Chỉ Hội Đồng Quản Trị hoặc Giám Đốc Chi Nhánh mới được thực hiện.",
      };
    }

    if (!input.name?.trim()) {
      return { success: false, error: "Vui lòng nhập tên dịch vụ." };
    }
    if (!input.categoryId) {
      return { success: false, error: "Vui lòng chọn chuyên mục dịch vụ." };
    }
    if (!input.singlePrice || input.singlePrice <= 0) {
      return { success: false, error: "Vui lòng nhập giá trải nghiệm hợp lệ." };
    }

    // Tự sinh mã code nếu chưa có
    let code = input.code?.trim().toUpperCase();
    if (!code) {
      const slug = input.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 15);
      const rand = Math.floor(1000 + Math.random() * 9000);
      code = `PLU-${slug}-${rand}`;
    } else {
      const existing = await prisma.service.findUnique({ where: { code } });
      if (existing) {
        code = `${code}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    const defaultImg = input.requiresAiCabin
      ? "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
      : "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg";

    const newService = await prisma.service.create({
      data: {
        categoryId: input.categoryId,
        name: input.name.trim(),
        code,
        description: input.description?.trim() || "",
        durationMinutes: Number(input.durationMinutes) || 60,
        singlePrice: Number(input.singlePrice),
        packageSessions: Number(input.packageSessions) || 10,
        packagePrice: input.packagePrice ? Number(input.packagePrice) : null,
        requiresAiCabin: Boolean(input.requiresAiCabin),
        imageUrl: input.imageUrl?.trim() || defaultImg,
      },
      include: {
        category: true,
      },
    });

    safeRevalidatePath("/dich-vu");
    safeRevalidatePath("/admin/services");
    safeRevalidatePath("/booking");

    return {
      success: true,
      data: newService,
      message: `Đã xuất bản dịch vụ: ${newService.name} (${newService.code})`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Cập nhật dịch vụ
export async function updateServiceAction(id: string, input: Partial<ServiceInput>) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return {
        success: false,
        error: "Bạn không có quyền chỉnh sửa dịch vụ.",
      };
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.name && { name: input.name.trim() }),
        ...(input.code && { code: input.code.trim().toUpperCase() }),
        ...(input.description !== undefined && { description: input.description.trim() }),
        ...(input.durationMinutes && { durationMinutes: Number(input.durationMinutes) }),
        ...(input.singlePrice && { singlePrice: Number(input.singlePrice) }),
        ...(input.packageSessions && { packageSessions: Number(input.packageSessions) }),
        ...(input.packagePrice !== undefined && {
          packagePrice: input.packagePrice ? Number(input.packagePrice) : null,
        }),
        ...(input.requiresAiCabin !== undefined && {
          requiresAiCabin: Boolean(input.requiresAiCabin),
        }),
        ...(input.imageUrl && { imageUrl: input.imageUrl.trim() }),
      },
      include: { category: true },
    });

    safeRevalidatePath("/dich-vu");
    safeRevalidatePath("/admin/services");
    safeRevalidatePath("/booking");

    return {
      success: true,
      data: updated,
      message: `Đã cập nhật dịch vụ: ${updated.name}`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Xóa dịch vụ
export async function deleteServiceAction(id: string) {
  try {
    const session = await getCurrentSessionAction();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "BRANCH_MANAGER")) {
      return {
        success: false,
        error: "Bạn không có quyền xoá dịch vụ.",
      };
    }

    // Kiểm tra xem đã có lịch hẹn chưa
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    });
    if (appointmentCount > 0) {
      return {
        success: false,
        error: `Không thể xoá vì liệu trình này đang có ${appointmentCount} lịch hẹn của Thượng khách. Vui lòng giữ lại để tra cứu lịch sử.`,
      };
    }

    const deleted = await prisma.service.delete({
      where: { id },
    });

    safeRevalidatePath("/dich-vu");
    safeRevalidatePath("/admin/services");
    safeRevalidatePath("/booking");

    return {
      success: true,
      message: `Đã xoá liệu trình: ${deleted.name}`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
