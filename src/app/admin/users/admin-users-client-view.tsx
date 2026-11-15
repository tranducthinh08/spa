"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Stethoscope,
  Plus,
  Search,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import {
  getStaffUsersAction,
  toggleUserStatusAction,
  deleteStaffUserAction,
} from "@/features/users/actions/user-actions";
import { UserFormModal } from "@/features/users/ui/user-form-modal";

interface AdminUsersClientViewProps {
  initialStaff: any[];
  initialBranches: any[];
}

export function AdminUsersClientView({
  initialStaff,
  initialBranches,
}: AdminUsersClientViewProps) {
  const { currentPersona, selectedBranch } = useRoleContext();
  const canManage = currentPersona.role === "SUPER_ADMIN" || currentPersona.role === "BRANCH_MANAGER";

  const [staff, setStaff] = useState<any[]>(initialStaff);
  const [branches, setBranches] = useState<any[]>(initialBranches);
  const [activeRole, setActiveRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [firstMount, setFirstMount] = useState(true);

  const loadData = async (branch: string) => {
    const res = await getStaffUsersAction(branch);
    if (res.success && res.data) {
      setStaff(res.data.staff);
      setBranches(res.data.branches);
    }
  };

  useEffect(() => {
    if (firstMount) {
      setFirstMount(false);
      if (selectedBranch && selectedBranch !== "ALL") {
        loadData(selectedBranch);
      }
      return;
    }
    loadData(selectedBranch);
  }, [selectedBranch]);

  const handleToggleLock = async (user: any) => {
    const actionLabel = user.status === "LOCKED" ? "mở khóa" : "tạm khóa";
    if (!confirm(`Xác nhận ${actionLabel} tài khoản của ${user.name}?`)) return;

    const res = await toggleUserStatusAction(user.id);
    if (!res.success) {
      alert(res.error);
    } else {
      setNotification(res.message || "Thao tác thành công!");
      setTimeout(() => setNotification(null), 3500);
      loadData(selectedBranch);
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Xác nhận xóa tài khoản "${user.name}"?`)) return;
    const res = await deleteStaffUserAction(user.id);
    if (!res.success) {
      alert(res.error);
    } else {
      setNotification(res.message || "Đã xóa tài khoản.");
      setTimeout(() => setNotification(null), 3500);
      loadData(selectedBranch);
    }
  };

  const filteredStaff = staff.filter((u) => {
    const matchRole = activeRole === "ALL" || u.role === activeRole;
    const matchQuery =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchQuery;
  });

  const kpis = [
    { title: "Tổng Nhân Sự", value: `${staff.length} Cán Bộ`, desc: "Toàn hệ sinh thái", icon: Users, color: "text-[#1B3B2B]" },
    { title: "KTV Ngự Y", value: `${staff.filter(u => u.role === "THERAPIST").length} Kỹ Thuật Viên`, desc: "Trực tiếp trị liệu", icon: Stethoscope, color: "text-purple-800" },
    { title: "Cán Bộ Quản Lý", value: `${staff.filter(u => u.role !== "THERAPIST").length} Cán Bộ`, desc: "Điều hành & POS", icon: Building2, color: "text-[#775A19]" },
    { title: "Đang Hoạt Động", value: `${staff.filter(u => u.status !== "LOCKED").length} / ${staff.length}`, desc: "Tài khoản hợp lệ", icon: ShieldCheck, color: "text-emerald-800" },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return { label: "Hội Đồng Quản Trị", icon: ShieldCheck, cls: "bg-amber-100 text-amber-900 border-amber-300" };
      case "BRANCH_MANAGER": return { label: "Giám Đốc Chi Nhánh", icon: Building2, cls: "bg-emerald-100 text-emerald-900 border-emerald-300" };
      case "RECEPTIONIST": return { label: "Lễ Tân & POS", icon: UserCheck, cls: "bg-teal-100 text-teal-900 border-teal-300" };
      default: return { label: "KTV Ngự Y", icon: Stethoscope, cls: "bg-purple-100 text-purple-900 border-purple-300" };
    }
  };

  return (
    <div className="space-y-5 text-[#1C1C19]">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B3B2B]/10 text-[#1B3B2B] text-[11px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            Cơ Cấu Tổ Chức & Phân Quyền Vai Trò
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#032517]">Quản Lý Cán Bộ & Phân Quyền Hệ Thống</h1>
          <p className="text-xs text-[#775A19]">Phân bổ quyền điều hành và kiểm soát tài khoản nhân sự toàn chuỗi</p>
        </div>

        {canManage && (
          <button
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Cán Bộ / Nhân Sự Mới</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#E5E2DD] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-bold">{kpi.title}</div>
                <div className="text-xl font-serif font-bold text-[#032517] mt-0.5">{kpi.value}</div>
                <div className="text-[10px] text-stone-500">{kpi.desc}</div>
              </div>
              <div className={`w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E5E2DD] flex items-center justify-center ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar: Search & Role Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E2DD] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại hoặc chuyên môn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E2DD] bg-[#FAF7F2] text-xs font-medium focus:ring-1 focus:ring-[#C5A059]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
          <div className="text-xs text-stone-500 font-medium">
            Hiển thị <strong>{filteredStaff.length}</strong> / {staff.length} nhân sự
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: `Tất Cả (${staff.length})` },
            { id: "SUPER_ADMIN", label: "Hội Đồng Quản Trị" },
            { id: "BRANCH_MANAGER", label: "Giám Đốc Chi Nhánh" },
            { id: "RECEPTIONIST", label: "Lễ Tân & POS" },
            { id: "THERAPIST", label: "KTV Ngự Y" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeRole === tab.id
                  ? "bg-[#1B3B2B] text-[#FED488]"
                  : "bg-[#FAF7F2] text-stone-600 hover:bg-[#F0EDE9]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E5E2DD] text-[#775A19] font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nhân Sự</th>
                <th className="py-3 px-4">Vai Trò Phân Quyền</th>
                <th className="py-3 px-4">Chi Nhánh</th>
                <th className="py-3 px-4">Chuyên Môn / Hoa Hồng</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DD]">
              {filteredStaff.map((u) => {
                const roleBadge = getRoleBadge(u.role);
                const RoleIcon = roleBadge.icon;
                const isLocked = u.status === "LOCKED";

                return (
                  <tr key={u.id} className="hover:bg-[#FAF7F2]/60 transition group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#C5A059]/40"
                        />
                        <div>
                          <div className="font-bold text-[#032517] text-sm group-hover:text-[#775A19] transition">{u.name}</div>
                          <div className="text-[10px] text-stone-400">{u.email} • {u.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.cls}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{roleBadge.label}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-medium text-stone-700">
                      {u.branch ? u.branch.name : <span className="text-amber-800 font-bold">Hội Sở Toàn Chuỗi</span>}
                    </td>

                    <td className="py-3 px-4">
                      {u.role === "THERAPIST" ? (
                        <div>
                          <div className="font-medium text-stone-700 truncate max-w-[180px]">{u.specialty || "Trị liệu đa khoa"}</div>
                          <div className="text-[10px] text-[#775A19] font-bold">Hoa hồng: {Math.round(u.commissionRate * 100)}%</div>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Văn phòng</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isLocked ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}>
                        {isLocked ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{isLocked ? "Tạm Khóa" : "Hoạt Động"}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {canManage && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                            title="Sửa hồ sơ & Bổ nhiệm quyền"
                            className="p-1.5 rounded-lg border border-[#E5E2DD] bg-white hover:bg-[#FAF7F2] text-stone-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(u)}
                            title={isLocked ? "Mở khóa tài khoản" : "Tạm khóa tài khoản"}
                            className={`p-1.5 rounded-lg border transition ${
                              isLocked ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-[#E5E2DD] bg-white text-stone-600 hover:bg-amber-50"
                            }`}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          {currentPersona.role === "SUPER_ADMIN" && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Xóa tài khoản"
                              className="p-1.5 rounded-lg border border-[#E5E2DD] bg-white hover:bg-red-50 text-stone-400 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branches={branches}
        currentUserRole={currentPersona.role}
        initialUser={selectedUser}
        onSuccess={(saved) => {
          setNotification(`Đã lưu thành công nhân sự: ${saved.name} (${saved.role})`);
          setTimeout(() => setNotification(null), 3500);
          loadData(selectedBranch);
        }}
      />
    </div>
  );
}
