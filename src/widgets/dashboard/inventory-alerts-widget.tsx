"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, CheckCircle, PackageCheck } from "lucide-react";
import { updateInventoryStockAction } from "@/features/pos/actions/pos-actions";

interface InventoryAlertsProps {
  items: Array<{
    id: string;
    branchId: string;
    quantity: number;
    reorderLevel: number;
    product: {
      id: string;
      name: string;
      code: string;
      unit: string;
    };
    branch: {
      name: string;
    };
  }>;
}

export function InventoryAlertsWidget({ items }: InventoryAlertsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRestock = async (item: InventoryAlertsProps["items"][0]) => {
    setLoadingId(item.id);
    await updateInventoryStockAction({
      branchId: item.branchId,
      productId: item.product.id,
      deltaQuantity: 100,
      reason: "Nhập bổ sung khẩn cấp từ kho tổng",
    });
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E2DD] shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#032517]">
              Cảnh Báo Định Mức BOM Dược Liệu Tự Động
            </h3>
            <p className="text-xs text-[#424843]">
              Hệ thống tự động trừ kho khi hoàn tất ca và báo động khi chạm ngưỡng an toàn
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          Telemetry Live
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#F0EDE9] text-[#775A19] uppercase font-semibold">
              <th className="pb-2">Vật tư dược liệu</th>
              <th className="pb-2">Chi nhánh</th>
              <th className="pb-2">Tồn hiện tại</th>
              <th className="pb-2">Ngưỡng BOM</th>
              <th className="pb-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE9]">
            {items.map((item) => {
              const isCritical = item.quantity <= item.reorderLevel;
              return (
                <tr key={item.id} className="hover:bg-[#FAF7F2] transition">
                  <td className="py-2.5 font-medium text-[#1C1C19]">
                    <div className="font-semibold">{item.product.name}</div>
                    <div className="text-[10px] text-[#775A19]">{item.product.code}</div>
                  </td>
                  <td className="py-2.5 text-[#424843]">
                    {item.branch.name.replace("Plumeria ", "").split("—")[0]}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {item.quantity} {item.product.unit}
                    </span>
                  </td>
                  <td className="py-2.5 text-[#424843]">
                    {item.reorderLevel} {item.product.unit}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleRestock(item)}
                      disabled={loadingId === item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-medium text-[11px] transition disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{loadingId === item.id ? "Đang nhập..." : "+100 Nhập kho"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
