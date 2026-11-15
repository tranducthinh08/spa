"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Building2, UserCheck, Stethoscope, AlertCircle, Sparkles } from "lucide-react";
import { createStaffUserAction, updateStaffUserAction, StaffUserInput } from "../actions/user-actions";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
];

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Array<{ id: string; name: string; code: string }>;
  currentUserRole: string;
  initialUser?: any | null;
  onSuccess: (saved: any) => void;
}

export function UserFormModal({
  isOpen,
  onClose,
  branches,
  currentUserRole,
  initialUser,
  onSuccess,
}: UserFormModalProps) {
  const isEdit = Boolean(initialUser?.id);
  const isBranchManager = currentUserRole === "BRANCH_MANAGER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("admin");
  const [role, setRole] = useState<StaffUserInput["role"]>("THERAPIST");
  const [branchId, setBranchId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUser) {
      setName(initialUser.name || "");
      setEmail(initialUser.email || "");
      setPhone(initialUser.phone || "");
      setPassword("");
      setRole(initialUser.role || "THERAPIST");
      setBranchId(initialUser.branchId || branches[0]?.id || "");
      setSpecialty(initialUser.specialty || "");
      setCommissionRate(initialUser.commissionRate ? Math.round(initialUser.commissionRate * 100) : 10);
      setAvatar(initialUser.avatar || AVATAR_PRESETS[0]);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("admin");
      setRole(isBranchManager ? "THERAPIST" : "RECEPTIONIST");
      setBranchId(branches[0]?.id || "");
      setSpecialty("Bấm huyệt đả thông kinh lạc hoàng gia");
      setCommissionRate(10);
      setAvatar(AVATAR_PRESETS[3]);
    }
    setError(null);
  }, [initialUser, branches, isOpen, isBranchManager]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: StaffUserInput = {
      name,
      email,
      phone,
      password: password ? password : undefined,
      role,
      branchId: role === "SUPER_ADMIN" ? null : branchId || null,
      specialty: role === "THERAPIST" ? specialty : null,
      commissionRate: commissionRate / 100,
      avatar,
    };

    const res = isEdit
      ? await updateStaffUserAction(initialUser.id, payload)
      : await createStaffUserAction(payload);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Có lỗi xảy ra khi lưu nhân sự.");
    } else {
      onSuccess(res.data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] w-full max-w-xl rounded-3xl border border-[#C5A059]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1B3B2B] text-white flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#032517] text-[#FED488] flex items-center justify-center border border-[#C5A059]/40">
              <ShieldCheck className="w-4 h-4 text-[#FED488]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FAF7F2]">
                {isEdit ? "Chỉnh Sửa Hồ Sơ & Bổ Nhiệm Quyền" : "Bổ Nhiệm Cán Bộ / Nhân Sự Mới"}
              </h3>
              <p className="text-[11px] text-[#83A590]">Phân quyền vai trò và quản trị nhân lực spa</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-1 rounded-full hover:bg-white/10 text-[#83A590]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-[#1C1C19] text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar selector */}
          <div>
            <label className="block font-semibold text-[#775A19] mb-1.5">Ảnh Đại Diện Nhân Sự</label>
            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                    avatar === url ? "border-[#C5A059] scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">Họ Và Tên (*)</label>
              <input
                type="text"
                required
                placeholder="VD: Trần Quốc Bảo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-medium focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">Vai Trò Phân Quyền (*)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-bold text-[#032517] focus:ring-1 focus:ring-[#C5A059]"
              >
                {!isBranchManager && <option value="SUPER_ADMIN">SUPER_ADMIN (Hội Đồng Quản Trị)</option>}
                {!isBranchManager && <option value="BRANCH_MANAGER">BRANCH_MANAGER (Giám Đốc Chi Nhánh)</option>}
                <option value="RECEPTIONIST">RECEPTIONIST (Lễ Tân Trưởng & POS)</option>
                <option value="THERAPIST">THERAPIST (Kỹ Thuật Viên Ngự Y)</option>
              </select>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">Email Đăng Nhập (*)</label>
              <input
                type="email"
                required
                placeholder="bao.tq@plumeria.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-medium focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">Số Điện Thoại (*)</label>
              <input
                type="tel"
                required
                placeholder="0912888999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-medium focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {/* Branch & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">
                Chi Nhánh Công Tác {role === "SUPER_ADMIN" && <span className="font-normal text-stone-400">(Toàn chuỗi)</span>}
              </label>
              <select
                disabled={role === "SUPER_ADMIN" || isBranchManager}
                value={role === "SUPER_ADMIN" ? "" : branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-medium focus:ring-1 focus:ring-[#C5A059] disabled:bg-stone-100"
              >
                {role === "SUPER_ADMIN" ? (
                  <option value="">Hội Sở Toàn Chuỗi</option>
                ) : (
                  branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">
                Mật Khẩu Đăng Nhập {isEdit && <span className="font-normal text-stone-400">(Để trống giữ nguyên)</span>}
              </label>
              <input
                type="text"
                placeholder={isEdit ? "••••••••" : "Mặc định: admin"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-mono focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {/* Conditional Fields for THERAPIST */}
          {role === "THERAPIST" && (
            <div className="p-3.5 rounded-2xl bg-[#F0EDE9]/70 border border-[#E5E2DD] space-y-2.5">
              <div className="font-bold text-[#032517] flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Thiết Lập Chuyên Môn Trị Liệu & Hoa Hồng</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-0.5">Chuyên Môn Kỹ Thuật Viên</label>
                  <input
                    type="text"
                    placeholder="VD: Trị liệu phòng ngừa đột quỵ, Bấm huyệt 14 kinh lạc"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-0.5">Hoa Hồng Trị Liệu (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-white font-bold text-[#775A19]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E2DD]">
            <button type="button" onClick={onClose} disabled={loading} className="px-3.5 py-2 rounded-xl border bg-white font-bold">
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? "Đang xử lý..." : isEdit ? "Cập Nhật Hồ Sơ" : "Lưu & Kích Hoạt Nhân Sự"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
