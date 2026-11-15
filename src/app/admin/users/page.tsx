import React from "react";
import { getStaffUsersAction } from "@/features/users/actions/user-actions";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { AdminUsersClientView } from "./admin-users-client-view";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getCurrentSessionAction();
  const branchFilter =
    session && session.role !== "SUPER_ADMIN" && session.branchId
      ? session.branchId
      : "ALL";

  const res = await getStaffUsersAction(branchFilter);
  const initialStaff = res.success && res.data ? res.data.staff || [] : [];
  const initialBranches = res.success && res.data ? res.data.branches || [] : [];

  return (
    <AdminUsersClientView
      initialStaff={initialStaff}
      initialBranches={initialBranches}
    />
  );
}
