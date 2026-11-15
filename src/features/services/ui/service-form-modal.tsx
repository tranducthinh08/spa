"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Coins, Check, AlertCircle } from "lucide-react";
import { formatVND } from "@/shared/lib/utils";
import { createServiceAction, updateServiceAction, ServiceInput } from "../actions/service-actions";

const PRESET_IMAGES = [
  { label: "Massage Đông Y", url: "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg" },
  { label: "Cabin Từ Trường AI", url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80" },
  { label: "Trị Liệu Vai Gáy", url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=80" },
  { label: "Trẻ Hóa Da Hoàng Cung", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80" },
];

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string; code: string }>;
  initialService?: any | null;
  onSuccess: (saved: any) => void;
}

export function ServiceFormModal({
  isOpen,
  onClose,
  categories,
  initialService,
  onSuccess,
}: ServiceFormModalProps) {
  const isEdit = Boolean(initialService?.id);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [singlePrice, setSinglePrice] = useState<number>(1200000);
  const [packageSessions, setPackageSessions] = useState<number>(10);
  const [packagePrice, setPackagePrice] = useState<number>(10800000);
  const [requiresAiCabin, setRequiresAiCabin] = useState(false);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialService) {
      setCategoryId(initialService.categoryId || categories[0]?.id || "");
      setName(initialService.name || "");
      setCode(initialService.code || "");
      setDurationMinutes(initialService.durationMinutes || 60);
      setSinglePrice(initialService.singlePrice || 1200000);
      setPackageSessions(initialService.packageSessions || 10);
      setPackagePrice(initialService.packagePrice || 10800000);
      setRequiresAiCabin(Boolean(initialService.requiresAiCabin));
      setImageUrl(initialService.imageUrl || PRESET_IMAGES[0].url);
      setDescription(initialService.description || "");
    } else {
      setCategoryId(categories[0]?.id || "");
      setName("");
      setCode("");
      setDurationMinutes(60);
      setSinglePrice(1200000);
      setPackageSessions(10);
      setPackagePrice(10800000);
      setRequiresAiCabin(false);
      setImageUrl(PRESET_IMAGES[0].url);
      setDescription("");
    }
    setError(null);
  }, [initialService, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const inputData: ServiceInput = {
      categoryId,
      name,
      code: code || undefined,
      description,
      durationMinutes,
      singlePrice,
      packageSessions,
      packagePrice: packagePrice || undefined,
      requiresAiCabin,
      imageUrl,
    };

    const res = isEdit
      ? await updateServiceAction(initialService.id, inputData)
      : await createServiceAction(inputData);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Có lỗi xảy ra khi lưu dịch vụ.");
    } else {
      onSuccess(res.data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#C5A059]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1B3B2B] text-white flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#032517] text-[#FED488] flex items-center justify-center border border-[#C5A059]/40">
              <Sparkles className="w-4 h-4 text-[#FED488]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FAF7F2]">
                {isEdit ? "Chỉnh Sửa Liệu Trình Dịch Vụ" : "Thêm Liệu Trình Dịch Vụ Mới"}
              </h3>
              <p className="text-[11px] text-[#83A590]">Thiết lập bảng giá, thời lượng và thông số Cabin AI</p>
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

          {/* Category & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">Chuyên Mục (*)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-medium focus:ring-1 focus:ring-[#C5A059]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#775A19] mb-1">Tên Dịch Vụ (*)</label>
              <input
                type="text"
                required
                placeholder="VD: Liệu Trình Đả Thông Kinh Lạc Vai Gáy Thảo Mộc"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-medium focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {/* Code & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">
                Mã Dịch Vụ <span className="font-normal text-stone-400">(Để trống tự sinh)</span>
              </label>
              <input
                type="text"
                placeholder="VD: PLU-STROKE-02"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white font-mono uppercase focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#775A19] mb-1">Thời Lượng Liệu Trình</label>
              <div className="flex gap-1.5">
                {[45, 60, 75, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border text-[11px] transition ${
                      durationMinutes === mins
                        ? "bg-[#1B3B2B] text-[#FED488] border-[#1B3B2B]"
                        : "bg-white text-stone-700 border-[#E5E2DD]"
                    }`}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E2DD] space-y-2.5">
            <div className="font-bold text-[#032517] flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Thiết Lập Bảng Giá & Gói Dài Hạn</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-stone-500 mb-0.5">Giá Trải Nghiệm (*)</label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={singlePrice}
                  onChange={(e) => setSinglePrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-[#FAF7F2] font-bold"
                />
                <span className="text-[10px] text-[#775A19]">{formatVND(singlePrice)}</span>
              </div>
              <div>
                <label className="block text-stone-500 mb-0.5">Số Buổi Gói</label>
                <input
                  type="number"
                  value={packageSessions}
                  onChange={(e) => setPackageSessions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-[#FAF7F2] font-bold"
                />
                <span className="text-[10px] text-stone-400">10 hoặc 16 buổi</span>
              </div>
              <div>
                <label className="block text-stone-500 mb-0.5">Giá Gói Trọn Gói</label>
                <input
                  type="number"
                  step="100000"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-[#FAF7F2] font-bold text-[#775A19]"
                />
                <span className="text-[10px] text-[#775A19]">{formatVND(packagePrice)}</span>
              </div>
            </div>
          </div>

          {/* AI Cabin Switch */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-900 text-purple-200 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <div>
                <div className="font-bold text-purple-950 text-xs">Yêu Cầu Cabin Từ Trường AI</div>
                <div className="text-[10px] text-purple-700">Tự động ưu tiên gán phòng Cabin Sóng Delta</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requiresAiCabin}
                onChange={(e) => setRequiresAiCabin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-800"></div>
            </label>
          </div>

          {/* Image Presets & Input */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#775A19]">Ảnh Liệu Trình (Chọn mẫu hoặc dán link)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_IMAGES.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 h-14 group transition ${
                      isSelected ? "border-[#C5A059]" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white py-0.5 text-center font-bold truncate">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#C5A059] text-[#1B3B2B] flex items-center justify-center">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Hoặc dán URL ảnh"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-white text-[11px]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-[#775A19] mb-1">Mô Tả & Tác Dụng Trị Liệu</label>
            <textarea
              rows={2}
              placeholder="Mô tả các bước thực hiện, tác dụng đả thông kinh mạch..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] bg-white focus:ring-1 focus:ring-[#C5A059]"
            />
          </div>

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
              <span>{loading ? "Đang lưu..." : isEdit ? "Cập Nhật" : "Lưu & Xuất Bản"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
