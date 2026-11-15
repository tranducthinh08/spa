"use server";

import { prisma } from "@/shared/lib/prisma";
import { signSession, verifySession, SESSION_COOKIE_NAME } from "../lib/auth-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: {
  emailOrPhone: string;
  password?: string;
  redirectTo?: string;
}) {
  try {
    const { emailOrPhone, password = "admin", redirectTo } = formData;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
      include: { branch: true },
    });

    if (!user) {
      return { success: false, error: "Không tìm thấy tài khoản với email hoặc số điện thoại này." };
    }

    // Spa login portal is strictly for internal staff & management
    if (user.role === "CUSTOMER") {
      return {
        success: false,
        error: "Cổng đăng nhập này chỉ dành cho Cán bộ & Nhân sự Quản trị Spa. Thượng khách có thể xem và đặt lịch trực tiếp mà không cần tài khoản.",
      };
    }

    if (user.status === "LOCKED") {
      return {
        success: false,
        error: "Tài khoản của bạn đã bị tạm khóa bởi Ban Giám Đốc. Vui lòng liên hệ Hội Đồng Quản Trị.",
      };
    }

    if (user.password && user.password !== password) {
      return { success: false, error: "Mật khẩu không chính xác. Mặc định là: admin" };
    }

    const token = await signSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      branchId: user.branchId,
      membershipTier: user.membershipTier,
    });

    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 86400, // 24 hours
        sameSite: "lax",
      });
    } catch {
      // Standalone script fallback
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        branchName: user.branch?.name,
        redirectTo:
          redirectTo && redirectTo !== "/admin/dashboard"
            ? redirectTo
            : user.role === "RECEPTIONIST" || user.role === "THERAPIST"
            ? "/admin/appointments"
            : "/admin/dashboard",
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function quickDemoLoginAction(role: string, redirectTo?: string) {
  try {
    if (role === "CUSTOMER") {
      return {
        success: false,
        error: "Tài khoản Thượng khách không có quyền truy cập cổng Quản trị Spa.",
      };
    }

    const user = await prisma.user.findFirst({
      where: { role },
      include: { branch: true },
    });

    if (!user) {
      return { success: false, error: `Không tìm thấy tài khoản mẫu cho vai trò: ${role}` };
    }

    if (user.status === "LOCKED") {
      return { success: false, error: `Tài khoản ${user.name} đang ở trạng thái Tạm Khóa.` };
    }

    const token = await signSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      branchId: user.branchId,
      membershipTier: user.membershipTier,
    });

    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 86400,
        sameSite: "lax",
      });
    } catch {
      // Standalone script fallback
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        branchName: user.branch?.name,
        redirectTo:
          redirectTo && redirectTo !== "/admin/dashboard"
            ? redirectTo
            : user.role === "RECEPTIONIST" || user.role === "THERAPIST"
            ? "/admin/appointments"
            : "/admin/dashboard",
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutAction(redirectTo: string = "/login") {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore in non-cookie context
  }
  redirect(redirectTo);
}

export async function getCurrentSessionAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const session = await verifySession(token);
    if (!session || session.role === "CUSTOMER") {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
