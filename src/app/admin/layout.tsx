import React, { Suspense } from "react";
import { RoleProvider } from "@/shared/components/role-switcher-bar";
import { AdminShell } from "@/widgets/admin-layout/admin-shell";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSessionAction();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F4] flex items-center justify-center text-xs text-[#775A19]">Đang tải...</div>}>
      <RoleProvider initialSession={session}>
        <AdminShell>{children}</AdminShell>
      </RoleProvider>
    </Suspense>
  );
}
