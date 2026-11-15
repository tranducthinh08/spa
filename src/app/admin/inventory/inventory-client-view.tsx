"use client";

import React, { useEffect, useState } from "react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { getInventoryStockAction, updateInventoryStockAction } from "@/features/pos/actions/pos-actions";
import { Package, AlertTriangle, Plus, RefreshCw, CheckCircle2 } from "lucide-react";

interface InventoryClientViewProps {
  initialInventoryData: any;
}

export function InventoryClientView({
  initialInventoryData,
}: InventoryClientViewProps) {
  const { selectedBranch } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState<any>(initialInventoryData);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [firstMount, setFirstMount] = useState(true);

  const loadStock = async (branch: string) => {
    setLoading(true);
    const res = await getInventoryStockAction(branch);
    if (res.success && res.data) {
      setInventoryData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (firstMount) {
      setFirstMount(false);
      if (selectedBranch && selectedBranch !== "ALL") {
        loadStock(selectedBranch);
      }
      return;
    }
    loadStock(selectedBranch);
  }, [selectedBranch]);

  const handleRestock = async (item: any) => {
    setUpdatingId(item.id);
    await updateInventoryStockAction({
      branchId: item.branchId,
      productId: item.productId,
      deltaQuantity: 100,
      reason: "Bổ sung kho chi nhánh",
    });
    setUpdatingId(null);
    loadStock(selectedBranch);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#032517]">
              Quản Trị Kho Dược Liệu & Định Mức BOM
            </h1>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              Tự Động Khấu Trừ
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-0.5">
            Theo dõi tồn kho tinh dầu Cát Hồng, thảo dược ngải diệp, đá muối Himalaya và khăn ga kháng khuẩn
          </p>
        </div>

        <button
          onClick={() => loadStock(selectedBranch)}
          disabled={loading}
          className="p-2 rounded-xl border border-[#E5E2DD] hover:bg-[#FAF7F2] text-[#424843] transition self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Low Stock Banner Alert */}
      {inventoryData?.criticalCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-red-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">Phát hiện {inventoryData.criticalCount} loại dược liệu dưới định mức an toàn:</span>
              <span className="ml-1 text-red-800">
                Tinh dầu Cát Hồng và Serum tái sinh da đang cần nhập kho bổ sung gấp để phục vụ các ca tiếp theo.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-red-200 text-red-900 px-2.5 py-1 rounded-full shrink-0">
            Cảnh Báo Đỏ
          </span>
        </div>
      )}

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E5E2DD] bg-[#FAF7F2] flex items-center justify-between text-xs font-semibold text-[#775A19]">
          <span>Danh Sách Tồn Kho Vật Tư Tiêu Hao</span>
          <span>{inventoryData?.inventory?.length || 0} Mặt hàng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E2DD] text-[#775A19] uppercase font-semibold bg-[#FAF7F2]/60">
                <th className="p-3.5">Mã & Tên Dược Liệu</th>
                <th className="p-3.5">Chi Nhánh</th>
                <th className="p-3.5">Tồn Kho Hiện Tại</th>
                <th className="p-3.5">Ngưỡng Tối Thiểu (BOM)</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 text-right">Nhập Bổ Sung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {inventoryData?.inventory?.map((item: any) => {
                const isLow = item.quantity <= item.reorderLevel;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2] transition">
                    <td className="p-3.5 font-medium text-[#1C1C19]">
                      <div className="font-bold text-sm text-[#032517]">{item.product.name}</div>
                      <div className="text-[11px] text-[#775A19] font-mono">{item.product.code}</div>
                    </td>
                    <td className="p-3.5 text-[#424843]">
                      {item.branch.name.replace("Plumeria ", "")}
                    </td>
                    <td className="p-3.5 font-bold text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-lg ${
                          isLow ? "bg-red-100 text-red-700 font-extrabold" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.quantity} {item.product.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#424843]">
                      {item.reorderLevel} {item.product.unit}
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Sắp hết hàng
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đầy đủ
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleRestock(item)}
                        disabled={updatingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-semibold text-xs transition disabled:opacity-50 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{updatingId === item.id ? "Đang lưu..." : "+100 Đơn vị"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
