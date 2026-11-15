import React, { Suspense } from "react";
import { RoleProvider } from "@/shared/components/role-switcher-bar";
import { AdminShell } from "@/widgets/admin-layout/admin-shell";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { getBranchesAction } from "@/features/branches/actions/branch-actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, branchesRes] = await Promise.all([
    getCurrentSessionAction(),
    getBranchesAction(),
  ]);

  const initialBranches = branchesRes.success && branchesRes.data
    ? branchesRes.data.map((b: any) => ({ code: b.code, name: b.name }))
    : [];

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F4] flex items-center justify-center text-xs text-[#775A19]">Đang tải...</div>}>
      <RoleProvider initialSession={session}>
        <AdminShell initialBranches={initialBranches}>{children}</AdminShell>
      </RoleProvider>
    </Suspense>
  );
}
