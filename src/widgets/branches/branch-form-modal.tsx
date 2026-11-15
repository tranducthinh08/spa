"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, MapPin, Phone, Check, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { createBranchAction, updateBranchAction, BranchInput } from "@/features/branches/actions/branch-actions";

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialBranch?: any | null;
}

const CITIES = ["Hà Nội", "Hải Phòng", "Bắc Ninh", "TP Hồ Chí Minh", "Đà Nẵng", "Quảng Ninh", "Khác"];

export function BranchFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialBranch,
}: BranchFormModalProps) {
  const isEditing = !!initialBranch;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [status, setStatus] = useState("ACTIVE");
  const [autoCreateRooms, setAutoCreateRooms] = useState(true);
  const [aiCabinCount, setAiCabinCount] = useState(2);
  const [vipRoomCount, setVipRoomCount] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBranch) {
      setName(initialBranch.name || "");
      setCode(initialBranch.code || "");
      setAddress(initialBranch.address || "");
      setPhone(initialBranch.phone || "");
      setCity(initialBranch.city || "Hà Nội");
      setStatus(initialBranch.status || "ACTIVE");
      setAutoCreateRooms(false);
    } else {
      setName(""); setCode(""); setAddress(""); setPhone("");
      setCity("Hà Nội"); setStatus("ACTIVE"); setAutoCreateRooms(true);
    }
    setError(null);
  }, [initialBranch, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !code) {
      const slug = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_").toUpperCase();
      setCode(slug.slice(0, 15));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Vui lòng nhập tên chi nhánh.");
    if (!code.trim()) return setError("Vui lòng nhập mã chi nhánh.");
    if (!address.trim()) return setError("Vui lòng nhập địa chỉ chi nhánh.");
    if (!phone.trim()) return setError("Vui lòng nhập số hotline liên hệ.");
    setLoading(true);

    try {
      if (isEditing) {
        const res = await updateBranchAction(initialBranch.id, { name, address, phone, city, status });
        if (!res.success) throw new Error(res.error);
      } else {
        const input: BranchInput = { name, code, address, phone, city, status, autoCreateRooms, aiCabinCount, vipRoomCount };
        const res = await createBranchAction(input);
        if (!res.success) throw new Error(res.error);
      }
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi lưu thông tin chi nhánh.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E5E2DD] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#112C1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FED488]/20 flex items-center justify-center text-[#FED488]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FAF7F2]">
                {isEditing ? "Hiệu Chỉnh Chi Nhánh" : "Thành Lập Chi Nhánh Mới"}
              </h3>
              <p className="text-[11px] text-[#FED488]/80">
                Hệ sinh thái chuỗi Dưỡng sinh Đông Y Hoàng Cung Plumeria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Tên cơ sở */}
          <div>
            <label className="block text-xs font-semibold text-[#032517] mb-1">
              Tên Cơ Sở Chi Nhánh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Cơ sở 9: Plumeria Royal City"
              className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#032517] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
          </div>

          {/* Grid: Mã chi nhánh & Hotline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1">
                Mã Chi Nhánh (Code) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isEditing}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                placeholder="ROYAL_CITY"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs font-mono font-semibold text-[#032517] uppercase focus:outline-none focus:ring-1 focus:ring-[#C5A059] disabled:bg-stone-100 disabled:text-stone-500"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                {isEditing ? "Mã định danh không thể sửa" : "Viết hoa, không dấu (ví dụ: OCEAN_PARK)"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1">
                Hotline Tiếp Đón <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024.3688.9999"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#032517] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {/* Địa chỉ chi tiết */}
          <div>
            <label className="block text-xs font-semibold text-[#032517] mb-1">
              Địa Chỉ Chi Tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tòa R4, KĐT Vinhomes Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội"
              className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#032517] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
          </div>

          {/* Grid: Tỉnh/Thành phố & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1">
                Khu Vực / Tỉnh Thành
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs font-medium text-[#032517] bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1">
                Trạng Thái Vận Hành
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs font-medium text-[#032517] bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              >
                <option value="ACTIVE">Đang Vận Hành (ACTIVE)</option>
                <option value="MAINTENANCE">Đang Nâng Cấp (MAINTENANCE)</option>
                <option value="INACTIVE">Tạm Ngưng (INACTIVE)</option>
              </select>
            </div>
          </div>

          {/* Option tự động tạo buồng phòng (chỉ khi tạo mới) */}
          {!isEditing && (
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCreateRooms}
                  onChange={(e) => setAutoCreateRooms(e.target.checked)}
                  className="mt-0.5 rounded text-[#112C1E] focus:ring-[#C5A059]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#032517] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#775A19]" />
                    Khởi tạo sẵn buồng trị liệu & liên kết kho ({aiCabinCount + vipRoomCount} buồng)
                  </span>
                  <p className="text-[11px] text-[#424843] mt-0.5">
                    Tự động tạo số buồng theo thiết lập bên dưới và phân bổ dược liệu ban đầu.
                  </p>
                </div>
              </label>

              {autoCreateRooms && (
                <div className="pt-2 border-t border-[#E5E2DD] grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
                    <span className="font-semibold text-[#032517] block mb-1">
                      Cabin Từ Trường AI
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAiCabinCount(Math.max(1, aiCabinCount - 1))}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-[#112C1E] text-sm w-6 text-center">
                        {aiCabinCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAiCabinCount(Math.min(10, aiCabinCount + 1))}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
                    <span className="font-semibold text-[#032517] block mb-1">
                      Phòng VIP Đông Y
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVipRoomCount(Math.max(1, vipRoomCount - 1))}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-[#112C1E] text-sm w-6 text-center">
                        {vipRoomCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVipRoomCount(Math.min(10, vipRoomCount + 1))}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#F0EDE9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-[#E5E2DD] text-xs font-semibold text-[#424843] hover:bg-[#FAF7F2] transition disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#112C1E] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isEditing ? "Lưu Thay Đổi" : "Thành Lập Chi Nhánh"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
