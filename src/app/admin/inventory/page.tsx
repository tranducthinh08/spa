import React from "react";
import { getInventoryStockAction } from "@/features/pos/actions/pos-actions";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { InventoryClientView } from "./inventory-client-view";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const session = await getCurrentSessionAction();
  const branchFilter =
    session && session.role !== "SUPER_ADMIN" && session.branchId
      ? session.branchId
      : "ALL";

  const res = await getInventoryStockAction(branchFilter);
  const initialInventoryData = res.success ? res.data : null;

  return <InventoryClientView initialInventoryData={initialInventoryData} />;
}
