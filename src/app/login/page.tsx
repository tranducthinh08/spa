"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck,
  Stethoscope,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { loginAction, quickDemoLoginAction } from "@/features/auth/actions/auth-actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAction({
      emailOrPhone,
      password,
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Đăng nhập không thành công.");
    } else {
      router.push(res.data?.redirectTo || redirectUrl);
      router.refresh();
    }
  };

  const handleQuickDemo = async (role: string) => {
    setLoading(true);
    setError(null);
    const res = await quickDemoLoginAction(role, redirectUrl);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Lỗi đăng nhập nhanh.");
    } else {
      router.push(res.data?.redirectTo || redirectUrl);
      router.refresh();
    }
  };

  const demoRoles = [
    {
      role: "SUPER_ADMIN",
      name: "Hoàng Đức Long",
      title: "Hội Đồng Quản Trị",
      scope: "Toàn Chuỗi 7 Cơ Sở",
      icon: ShieldCheck,
      color: "from-amber-600 to-amber-800",
    },
    {
      role: "BRANCH_MANAGER",
      name: "Vũ Minh Châu",
      title: "Giám Đốc Chi Nhánh",
      scope: "Plumeria Láng Hạ",
      icon: Building2,
      color: "from-emerald-700 to-emerald-900",
    },
    {
      role: "RECEPTIONIST",
      name: "Lê Thuỳ Linh",
      title: "Lễ Tân Trưởng",
      scope: "Điều phối & POS",
      icon: UserCheck,
      color: "from-teal-700 to-teal-900",
    },
    {
      role: "THERAPIST",
      name: "Lê Hoài An",
      title: "KTV Ngự Y Cung Đình",
      scope: "Trị liệu & Hoa hồng",
      icon: Stethoscope,
      color: "from-purple-700 to-purple-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#032517] via-[#0A1F14] to-[#1B3B2B] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FED488]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/dich-vu" className="inline-flex items-center gap-2 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B3B2B] text-[#FED488] flex items-center justify-center border border-[#C5A059]/40 shadow-lg">
            <Sparkles className="w-6 h-6 text-[#FED488]" />
          </div>
        </Link>
        <h2 className="font-serif font-bold text-3xl tracking-tight text-[#FAF7F2]">
          PLUMERIA BY ROYAL
        </h2>
        <p className="mt-1 text-xs text-[#83A590] tracking-widest uppercase font-medium">
          Cổng Xác Thực & Quản Trị Nội Bộ Chuỗi Plumeria Spa
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 space-y-6">
        {/* Main Login Box */}
        <div className="bg-[#FAF7F2] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-[#C5A059]/30 text-[#1C1C19]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#775A19] mb-1">
                Email Hoặc Số Điện Thoại
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin@plumeria.vn hoặc 0903456789"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E2DD] bg-white text-xs text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
                <Mail className="w-4 h-4 text-[#775A19] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#775A19] mb-1">
                Mật Khẩu <span className="font-normal text-[#83A590]">(Mặc định: admin)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E2DD] bg-white text-xs text-[#1C1C19] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
                <Lock className="w-4 h-4 text-[#775A19] absolute left-3 top-3" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-6 pt-5 border-t border-[#E5E2DD]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#775A19] text-center mb-3">
              ⚡ Hoặc Đăng Nhập Nhanh 1-Click Theo Vai Trò Quản Trị:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoRoles.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickDemo(item.role)}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-[#E5E2DD] bg-white hover:bg-[#F0EDE9] hover:border-[#C5A059] transition flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1B3B2B] text-[#FED488] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#032517] leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#775A19]">{item.title}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#83A590] group-hover:text-[#032517] transition">
                      Đăng nhập →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Link back to services */}
        <div className="text-center text-xs text-[#83A590]">
          <span>Quay lại </span>
          <Link href="/dich-vu" className="text-[#FED488] underline hover:text-white font-medium">
            Trang Danh Mục Dịch Vụ & Đặt Lịch
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
