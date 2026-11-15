import React from "react";
import { getBranchesAction } from "@/features/branches/actions/branch-actions";
import { BranchListView } from "@/widgets/branches/branch-list-view";
import { redirect } from "next/navigation";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";

export const metadata = {
  title: "Quản Lý Hệ Thống Chi Nhánh | Plumeria Spa",
  description: "Thiết lập, theo dõi và quản lý mạng lưới chi nhánh dưỡng sinh toàn quốc",
};

export default async function AdminBranchesPage() {
  const session = await getCurrentSessionAction();
  if (!session || !["SUPER_ADMIN", "BRANCH_MANAGER"].includes(session.role)) {
    redirect("/admin/dashboard");
  }

  const branchesRes = await getBranchesAction();
  const branches = branchesRes.success && branchesRes.data ? branchesRes.data : [];

  return <BranchListView initialBranches={branches} />;
}
