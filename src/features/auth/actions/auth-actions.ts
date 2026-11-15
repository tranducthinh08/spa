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

    let user = await prisma.user.findFirst({
      where: { role },
      include: { branch: true },
    });

    if (!user) {
      const firstBranch = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
      const branchId = firstBranch?.id;

      if (role === "BRANCH_MANAGER") {
        user = await prisma.user.create({
          data: {
            name: "Vũ Minh Châu",
            email: "manager.langha@plumeria.vn",
            phone: "0912345678",
            password: "admin",
            role: "BRANCH_MANAGER",
            branchId,
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
          },
          include: { branch: true },
        });
      } else if (role === "SUPER_ADMIN") {
        user = await prisma.user.create({
          data: {
            name: "Hoàng Đức Long",
            email: "admin@plumeria.vn",
            phone: "0903456789",
            password: "admin",
            role: "SUPER_ADMIN",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
          },
          include: { branch: true },
        });
      } else if (role === "RECEPTIONIST") {
        user = await prisma.user.create({
          data: {
            name: "Lê Thuỳ Linh",
            email: "letan.langha@plumeria.vn",
            phone: "0922334455",
            password: "admin",
            role: "RECEPTIONIST",
            branchId,
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
          },
          include: { branch: true },
        });
      } else if (role === "THERAPIST") {
        user = await prisma.user.create({
          data: {
            name: "Lê Hoài An",
            email: "ktv.an@plumeria.vn",
            phone: "0933445577",
            password: "admin",
            role: "THERAPIST",
            branchId,
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
          },
          include: { branch: true },
        });
      }
    }

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
        branchId: user.branchId,
        branchCode: user.branch?.code,
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
