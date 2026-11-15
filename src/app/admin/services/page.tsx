import React from "react";
import { getAdminServicesAction } from "@/features/services/actions/service-actions";
import { AdminServicesClientView } from "./admin-services-client-view";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const res = await getAdminServicesAction();
  const initialServices = res.success && res.data ? res.data.services || [] : [];
  const initialCategories = res.success && res.data ? res.data.categories || [] : [];

  return (
    <AdminServicesClientView
      initialServices={initialServices}
      initialCategories={initialCategories}
    />
  );
}
