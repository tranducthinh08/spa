"use client";

import React, { useState, useEffect } from "react";
import { X, BedDouble, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Sliders } from "lucide-react";
import {
  getBranchRoomsAction,
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  batchSetupRoomsAction,
} from "@/features/branches/actions/room-actions";

interface BranchRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: { id: string; name: string; code: string } | null;
  onSuccess: () => void;
}

export function BranchRoomsModal({ isOpen, onClose, branch, onSuccess }: BranchRoomsModalProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [targetAiCabins, setTargetAiCabins] = useState(2);
  const [targetVipRooms, setTargetVipRooms] = useState(2);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"AI_CABIN" | "VIP_SINGLE" | "COUPLE_SUITE">("AI_CABIN");

  const loadRooms = async () => {
    if (!branch) return;
    setLoading(true);
    const res = await getBranchRoomsAction(branch.id);
    if (res.success && res.data) {
      setRooms(res.data);
      const aiCount = res.data.filter((r: any) => r.type === "AI_CABIN").length;
      const vipCount = res.data.filter((r: any) => r.type !== "AI_CABIN").length;
      setTargetAiCabins(Math.max(aiCount, 2));
      setTargetVipRooms(Math.max(vipCount, 2));
    } else setError(res.error || "Không thể tải danh sách buồng.");
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && branch) {
      setError(null); setMsg(null); loadRooms();
    }
  }, [isOpen, branch]);

  if (!isOpen || !branch) return null;

  const handleBatchSetup = async () => {
    setActionLoading(true); setError(null);
    const res = await batchSetupRoomsAction(branch.id, targetAiCabins, targetVipRooms);
    setActionLoading(false);
    if (res.success) {
      setMsg(res.message || "Thiết lập buồng thành công!");
      setTimeout(() => setMsg(null), 3000);
      loadRooms(); onSuccess();
    } else setError(res.error);
  };

  const handleAddCustomRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return setError("Vui lòng nhập tên buồng.");
    setActionLoading(true); setError(null);
    const res = await createRoomAction({ branchId: branch.id, name: newRoomName.trim(), type: newRoomType });
    setActionLoading(false);
    if (res.success) {
      setNewRoomName(""); setMsg("Đã thêm buồng thành công!");
      setTimeout(() => setMsg(null), 3000);
      loadRooms(); onSuccess();
    } else setError(res.error);
  };

  const handleToggleStatus = async (room: any) => {
    const nextStatus = room.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    setActionLoading(true);
    const res = await updateRoomAction(room.id, { status: nextStatus });
    setActionLoading(false);
    if (res.success) { loadRooms(); onSuccess(); } else setError(res.error);
  };

  const handleDeleteRoom = async (room: any) => {
    if (!confirm(`Xác nhận xóa buồng "${room.name}" khỏi cơ sở?`)) return;
    setActionLoading(true);
    const res = await deleteRoomAction(room.id);
    setActionLoading(false);
    if (res.success) {
      setMsg(res.message || "Đã xóa buồng thành công!"); setTimeout(() => setMsg(null), 3000);
      loadRooms(); onSuccess();
    } else setError(res.error || "Lỗi khi xóa buồng.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E5E2DD] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#112C1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FED488]/20 flex items-center justify-center text-[#FED488]">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FAF7F2]">Cấu Hình Buồng Phòng & Cabin AI</h3>
              <p className="text-[11px] text-[#FED488]/80">{branch.name} ({branch.code}) • Hiện có {rooms.length} buồng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-[#032517]">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {msg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* Quick Setup / Scale Section */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E2DD] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#112C1E] flex items-center gap-1.5 text-xs">
                <Sliders className="w-3.5 h-3.5 text-[#775A19]" />
                Thiết Lập Nhanh Số Lượng Buồng (Quick Scale)
              </span>
              <span className="text-[11px] font-semibold text-[#775A19]">Mục tiêu: {targetAiCabins + targetVipRooms} buồng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD] flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Cabin Từ Trường AI</span>
                  <span className="text-[10px] text-stone-400">Trị liệu công nghệ cao</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setTargetAiCabins(Math.max(1, targetAiCabins - 1))} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold">-</button>
                  <span className="font-bold text-[#112C1E] text-sm w-5 text-center">{targetAiCabins}</span>
                  <button type="button" onClick={() => setTargetAiCabins(Math.min(12, targetAiCabins + 1))} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold">+</button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD] flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Phòng VIP Đông Y</span>
                  <span className="text-[10px] text-stone-400">Đả thông kinh lạc Hoàng Cung</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setTargetVipRooms(Math.max(1, targetVipRooms - 1))} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold">-</button>
                  <span className="font-bold text-[#112C1E] text-sm w-5 text-center">{targetVipRooms}</span>
                  <button type="button" onClick={() => setTargetVipRooms(Math.min(12, targetVipRooms + 1))} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold">+</button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleBatchSetup}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#112C1E] hover:bg-[#032517] text-[#FED488] font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Áp Dụng Thiết Lập Số Buồng</span>
              </button>
            </div>
          </div>

          {/* Add custom room form */}
          <form onSubmit={handleAddCustomRoom} className="bg-white p-3 rounded-2xl border border-[#E5E2DD] flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Tên buồng mới (VD: Cabin AI 05, Phòng VIP Hoàng Cung)..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1 w-full px-3 py-1.5 rounded-xl border border-[#E5E2DD] text-xs focus:ring-1 focus:ring-[#C5A059]"
            />
            <select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E5E2DD] bg-white font-medium text-xs text-stone-800"
            >
              <option value="AI_CABIN">Cabin Từ Trường AI</option>
              <option value="VIP_SINGLE">Phòng VIP Đông Y</option>
              <option value="COUPLE_SUITE">Phòng Đôi Hoàng Gia</option>
            </select>
            <button
              type="submit"
              disabled={actionLoading || !newRoomName.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] text-[#112C1E] border border-[#E5E2DD] font-bold text-xs transition disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#775A19]" />
              <span>Thêm Buồng</span>
            </button>
          </form>

          {/* Existing Rooms List */}
          <div className="space-y-2">
            <span className="font-bold text-[#112C1E] block">Danh Sách Buồng Phòng Đang Có ({rooms.length} buồng)</span>
            {loading ? (
              <div className="py-6 text-center text-stone-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#775A19]" />
                <span>Đang tải danh sách buồng...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-5 text-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                Chưa có buồng nào. Vui lòng bấm "Áp Dụng Thiết Lập Số Buồng" phía trên.
              </div>
            ) : (
              <div className="divide-y divide-[#F0EDE9] border border-[#E5E2DD] rounded-2xl overflow-hidden bg-white max-h-[240px] overflow-y-auto">
                {rooms.map((r) => (
                  <div key={r.id} className="p-2.5 px-3.5 flex items-center justify-between hover:bg-[#FAF7F2]/60 transition">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                        r.type === "AI_CABIN" ? "bg-purple-50 text-purple-800 border-purple-200" : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        <BedDouble className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{r.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {r.code} • {r.type === "AI_CABIN" ? "Cabin AI" : "Phòng VIP"} • {r._count?.appointments || 0} ca phục vụ
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          r.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-stone-100 text-stone-600 border-stone-300"
                        }`}
                        title="Đổi trạng thái"
                      >
                        {r.status === "AVAILABLE" ? "Sẵn sàng" : "Bảo trì"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(r)}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Xóa buồng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5 px-6 bg-[#FAF7F2] border-t border-[#E5E2DD] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#112C1E] text-[#FED488] font-bold text-xs hover:bg-[#032517] transition"
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
}
