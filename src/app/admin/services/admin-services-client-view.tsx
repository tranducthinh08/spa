"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  Coins,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { formatVND } from "@/shared/lib/utils";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import {
  getAdminServicesAction,
  deleteServiceAction,
} from "@/features/services/actions/service-actions";
import { ServiceFormModal } from "@/features/services/ui/service-form-modal";

interface AdminServicesClientViewProps {
  initialServices: any[];
  initialCategories: any[];
}

export function AdminServicesClientView({
  initialServices,
  initialCategories,
}: AdminServicesClientViewProps) {
  const { currentPersona } = useRoleContext();
  const canManage = currentPersona.role === "SUPER_ADMIN" || currentPersona.role === "BRANCH_MANAGER";

  const [services, setServices] = useState<any[]>(initialServices);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    const res = await getAdminServicesAction();
    if (res.success && res.data) {
      setServices(res.data.services);
      setCategories(res.data.categories);
    }
  };

  const handleOpenCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: any) => {
    setSelectedService(srv);
    setIsModalOpen(true);
  };

  const handleDelete = async (srv: any) => {
    if (!confirm(`Xác nhận xóa liệu trình "${srv.name}" khỏi danh mục?`)) return;
    const res = await deleteServiceAction(srv.id);
    if (!res.success) {
      alert(res.error);
    } else {
      setNotification(res.message || "Đã xoá thành công!");
      setTimeout(() => setNotification(null), 3000);
      loadData();
    }
  };

  const filteredServices = services.filter((s) => {
    const matchCat = activeCategory === "ALL" || s.categoryId === activeCategory;
    const matchQuery =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const totalServices = services.length;
  const aiCabinServices = services.filter((s) => s.requiresAiCabin).length;
  const packageServices = services.filter((s) => s.packagePrice).length;

  return (
    <div className="space-y-6 text-[#1C1C19]">
      {/* Page Title & Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B3B2B]/10 text-[#1B3B2B] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            Quản Lý Danh Mục Liệu Trình Dịch Vụ
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#032517]">
            Danh Mục & Bảng Giá Dịch Vụ Toàn Chuỗi
          </h1>
          <p className="text-xs text-[#775A19]">
            Cập nhật liệu trình Đông Y, Cabin Từ Trường AI và đồng bộ thời gian thực ra cổng đặt lịch
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dịch Vụ Mới</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E2DD] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 uppercase font-bold">Tổng Liệu Trình</div>
            <div className="text-2xl font-serif font-bold text-[#032517] mt-0.5">{totalServices} Dịch Vụ</div>
            <div className="text-[10px] text-emerald-700 font-medium">Toàn hệ sinh thái Plumeria</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD] flex items-center justify-center text-[#1B3B2B]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-purple-700 uppercase font-bold">Công Nghệ Cabin AI</div>
            <div className="text-2xl font-serif font-bold text-purple-900 mt-0.5">{aiCabinServices} Liệu Trình</div>
            <div className="text-[10px] text-purple-600 font-medium">Ứng dụng sóng từ trường Delta</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E2DD] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 uppercase font-bold">Gói Liệu Trình Dài Hạn</div>
            <div className="text-2xl font-serif font-bold text-[#775A19] mt-0.5">{packageServices} Gói Bán Chạy</div>
            <div className="text-[10px] text-stone-500 font-medium">Liệu trình 10 & 16 buổi phòng đột quỵ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD] flex items-center justify-center text-[#775A19]">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E2DD] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo tên dịch vụ hoặc mã code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
          <div className="text-xs text-stone-500 font-medium">
            Hiển thị <strong>{filteredServices.length}</strong> / {services.length} dịch vụ
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
              activeCategory === "ALL"
                ? "bg-[#1B3B2B] text-[#FED488]"
                : "bg-[#FAF7F2] text-stone-600 hover:bg-[#F0EDE9]"
            }`}
          >
            Tất Cả ({services.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeCategory === c.id
                  ? "bg-[#1B3B2B] text-[#FED488]"
                  : "bg-[#FAF7F2] text-stone-600 hover:bg-[#F0EDE9]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E5E2DD] text-[#775A19] font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Liệu Trình</th>
                <th className="py-3 px-4">Chuyên Mục</th>
                <th className="py-3 px-4">Thời Lượng</th>
                <th className="py-3 px-4">Giá Trải Nghiệm</th>
                <th className="py-3 px-4">Giá Gói Liệu Trình</th>
                <th className="py-3 px-4">Công Nghệ</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DD]">
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-[#FAF7F2]/60 transition group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={srv.imageUrl || "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg"}
                        alt={srv.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E5E2DD]"
                      />
                      <div>
                        <div className="font-bold text-[#032517] font-serif text-sm group-hover:text-[#775A19] transition">
                          {srv.name}
                        </div>
                        <div className="font-mono text-[10px] text-stone-400 mt-0.5">{srv.code}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-medium text-stone-600">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E5E2DD] text-[11px]">
                      {srv.category?.name}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-semibold text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{srv.durationMinutes} Phút</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-bold text-[#032517] font-serif text-sm">
                    {formatVND(srv.singlePrice)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {srv.packagePrice ? (
                      <div>
                        <div className="font-bold text-[#775A19]">{formatVND(srv.packagePrice)}</div>
                        <div className="text-[10px] text-stone-400">Gói {srv.packageSessions} buổi</div>
                      </div>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {srv.requiresAiCabin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Cabin Từ Trường AI
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Đông Y Thủ Công</span>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    {canManage ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(srv)}
                          title="Chỉnh sửa dịch vụ"
                          className="p-1.5 rounded-lg border border-[#E5E2DD] bg-white hover:bg-[#FAF7F2] text-stone-600 hover:text-[#032517] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv)}
                          title="Xóa dịch vụ"
                          className="p-1.5 rounded-lg border border-[#E5E2DD] bg-white hover:bg-red-50 text-stone-400 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">Chỉ xem</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        initialService={selectedService}
        onSuccess={(saved) => {
          setNotification(`Đã lưu thành công liệu trình: ${saved.name}`);
          setTimeout(() => setNotification(null), 3000);
          loadData();
        }}
      />
    </div>
  );
}
