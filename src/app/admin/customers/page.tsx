import React from "react";
import { getCustomersAction } from "@/features/crm/actions/customer-actions";
import { CustomersClientView } from "./customers-client-view";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const res = await getCustomersAction({ search: "", tier: "ALL" });
  const initialCustomers = res.success && res.data ? res.data : [];

  return <CustomersClientView initialCustomers={initialCustomers} />;
}
