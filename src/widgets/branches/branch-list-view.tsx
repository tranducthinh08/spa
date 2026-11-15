"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  BedDouble,
  Users,
  Edit2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { formatVND } from "@/shared/lib/utils";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { BranchFormModal } from "./branch-form-modal";
import { getBranchesAction } from "@/features/branches/actions/branch-actions";

interface BranchListViewProps {
  initialBranches: any[];
}

export function BranchListView({ initialBranches }: BranchListViewProps) {
  const [branches, setBranches] = useState<any[]>(initialBranches);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { setSelectedBranch } = useRoleContext();

  const reloadData = async () => {
    setRefreshing(true);
    const res = await getBranchesAction();
    if (res.success && res.data) {
      setBranches(res.data);
    }
    setRefreshing(false);
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone.includes(searchTerm);
      const matchCity = selectedCity === "ALL" || b.city === selectedCity;
      const matchStatus = selectedStatus === "ALL" || b.status === selectedStatus;
      return matchSearch && matchCity && matchStatus;
    });
  }, [branches, searchTerm, selectedCity, selectedStatus]);

  // Aggregate stats
  const totalBranches = branches.length;
  const activeCount = branches.filter((b) => b.status === "ACTIVE").length;
  const totalRooms = branches.reduce((sum, b) => sum + (b.counts?.rooms || b.rooms?.length || 0), 0);
  const totalStaff = branches.reduce((sum, b) => sum + (b.counts?.users || 0), 0);

  const cities = Array.from(new Set(branches.map((b) => b.city))).filter(Boolean);

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#032517] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#775A19]" />
              Quản Lý Hệ Thống Chi Nhánh Toàn Chuỗi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FED488]/40 text-[#775A19] text-xs font-semibold">
              {totalBranches} Cơ sở
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-1">
            Khởi tạo, thiết lập buồng phòng Cabin AI và theo dõi hoạt động từng cơ sở trên toàn quốc
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={reloadData}
            disabled={refreshing}
            className="p-2 rounded-xl border border-[#E5E2DD] text-stone-600 hover:bg-[#FAF7F2] transition disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#112C1E] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Chi Nhánh Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E2DD] shadow-xs">
          <span className="text-[11px] font-semibold text-[#775A19] uppercase tracking-wider block mb-1">
            Tổng Cơ Sở Chuỗi
          </span>
          <div className="text-2xl font-serif font-bold text-[#032517]">{totalBranches}</div>
          <span className="text-[11px] text-stone-500 mt-1 block">Toàn quốc</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E2DD] shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Đang Hoạt Động
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-900">{activeCount} / {totalBranches}</div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Tỷ lệ {totalBranches > 0 ? Math.round((activeCount/totalBranches)*100) : 0}%</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E2DD] shadow-xs">
          <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block mb-1">
            Cabin AI & Buồng Phòng
          </span>
          <div className="text-2xl font-serif font-bold text-purple-900">{totalRooms} Buồng</div>
          <span className="text-[11px] text-purple-700 mt-1 block">Sẵn sàng đón khách</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E2DD] shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
            Cán Bộ & KTV Ngự Y
          </span>
          <div className="text-2xl font-serif font-bold text-amber-900">{totalStaff} Nhân sự</div>
          <span className="text-[11px] text-amber-700 mt-1 block">Điều hành đa chi nhánh</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E2DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, mã, địa chỉ, hotline..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E5E2DD] text-xs text-[#032517] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E2DD] text-xs font-semibold text-[#032517] bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          >
            <option value="ALL">Tất Cả Khu Vực</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E2DD] text-xs font-semibold text-[#032517] bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          >
            <option value="ALL">Tất Cả Trạng Thái</option>
            <option value="ACTIVE">Đang Vận Hành (ACTIVE)</option>
            <option value="MAINTENANCE">Đang Nâng Cấp (MAINTENANCE)</option>
            <option value="INACTIVE">Tạm Ngưng (INACTIVE)</option>
          </select>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DD] bg-[#FAF7F2] text-[#775A19] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Cơ Sở & Mã Định Danh</th>
                <th className="py-3 px-3">Địa Chỉ & Hotline</th>
                <th className="py-3 px-3">Khu Vực</th>
                <th className="py-3 px-3 text-center">Buồng / Cabin AI</th>
                <th className="py-3 px-3 text-center">Nhân Sự</th>
                <th className="py-3 px-3 text-right">Doanh Thu Thu Được</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Không tìm thấy chi nhánh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#112C1E]/5 text-[#112C1E] flex items-center justify-center shrink-0 font-serif font-bold text-xs border border-[#112C1E]/10">
                          {b.name.match(/\d+/)?.[0] || b.code.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 text-xs">{b.name}</div>
                          <span className="font-mono text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                            {b.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 max-w-[240px]">
                      <div className="truncate text-stone-700" title={b.address}>{b.address}</div>
                      <div className="text-[11px] text-[#775A19] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{b.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-stone-700 font-medium">
                        <MapPin className="w-3 h-3 text-[#775A19]" />
                        {b.city}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 font-semibold text-[11px]">
                        <BedDouble className="w-3 h-3" />
                        {b.counts?.rooms || b.rooms?.length || 0} buồng
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px]">
                        <Users className="w-3 h-3" />
                        {b.counts?.users || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="font-serif font-bold text-stone-900 text-xs">
                        {formatVND(b.totalRevenue || 0)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          b.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : b.status === "MAINTENANCE"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {b.status === "ACTIVE" && <CheckCircle2 className="w-3 h-3" />}
                        {b.status === "MAINTENANCE" && <AlertTriangle className="w-3 h-3" />}
                        <span>{b.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-1.5 rounded-lg border border-[#E5E2DD] hover:bg-[#FAF7F2] text-stone-700 transition"
                          title="Hiệu chỉnh thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setSelectedBranch(b.code)}
                          className="p-1.5 rounded-lg bg-[#112C1E] hover:bg-[#032517] text-[#FED488] transition shadow-2xs"
                          title="Mở Dashboard cơ sở này"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <BranchFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadData}
        initialBranch={editingBranch}
      />
    </div>
  );
}
