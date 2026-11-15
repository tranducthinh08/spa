import React from "react";
import { getStaffUsersAction } from "@/features/users/actions/user-actions";
import { AdminUsersClientView } from "./admin-users-client-view";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const res = await getStaffUsersAction("ALL");
  const initialStaff = res.success && res.data ? res.data.staff || [] : [];
  const initialBranches = res.success && res.data ? res.data.branches || [] : [];

  return (
    <AdminUsersClientView
      initialStaff={initialStaff}
      initialBranches={initialBranches}
    />
  );
}
