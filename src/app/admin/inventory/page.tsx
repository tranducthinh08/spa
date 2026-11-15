import React from "react";
import { getInventoryStockAction } from "@/features/pos/actions/pos-actions";
import { InventoryClientView } from "./inventory-client-view";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const res = await getInventoryStockAction("ALL");
  const initialInventoryData = res.success ? res.data : null;

  return <InventoryClientView initialInventoryData={initialInventoryData} />;
}
