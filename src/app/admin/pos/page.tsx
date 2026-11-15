import React from "react";
import { getPosTerminalDataAction } from "@/features/pos/actions/pos-terminal-actions";
import { PosClientView } from "./pos-client-view";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const res = await getPosTerminalDataAction("ALL");
  const data = res.success && res.data ? res.data : {
    appointments: [],
    packageServices: [],
    customers: [],
    branches: [],
    todayInvoices: [],
  };

  return (
    <PosClientView
      initialAppointments={data.appointments}
      initialPackageServices={data.packageServices}
      initialCustomers={data.customers}
      initialBranches={data.branches}
      initialInvoices={data.todayInvoices}
    />
  );
}
