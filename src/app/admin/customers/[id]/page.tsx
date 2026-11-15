"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCustomerDetailAction } from "@/features/crm/actions/customer-actions";
import { CustomerMasterHeader } from "@/widgets/crm/customer-master-header";
import { HeroTreatmentCard } from "@/widgets/crm/hero-treatment-card";
import { RecoveryTrendChart } from "@/widgets/crm/recovery-trend-chart";
import { ClinicalSessionLog } from "@/widgets/crm/clinical-session-log";
import { ArrowLeft, RefreshCw, PlusCircle, Sparkles } from "lucide-react";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getCustomerDetailAction(id);
    if (res.success && res.data) {
      setCustomer(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#424843] flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#775A19]" />
        <span className="text-xs font-semibold">Đang tải hồ sơ Thượng Khách 360...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-20 text-center text-[#424843]">
        <h2 className="font-serif text-lg font-bold text-red-700">Không tìm thấy thượng khách</h2>
        <Link href="/admin/customers" className="mt-3 inline-block text-xs text-[#775A19] underline">
          Quay lại danh sách khách hàng
        </Link>
      </div>
    );
  }

  const primaryPackage = customer.customerPackages?.[0];
  const secondaryPackages = customer.customerPackages?.slice(1) || [];

  return (
    <div className="space-y-6">
      {/* Back button & Action sub-bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#775A19] hover:text-[#032517] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh Sách Thượng Khách</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/booking?customerPhone=${customer.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-semibold transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Đặt Lịch Hẹn Mới Cho Khách</span>
          </Link>
        </div>
      </div>

      {/* Customer 360 Master Header */}
      <CustomerMasterHeader customer={customer} />

      {/* Main Asymmetric Workspace Layout (7 Cols Left - 5 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): Treatment Cards & Recovery Chart */}
        <div className="lg:col-span-7 space-y-6">
          {primaryPackage ? (
            <HeroTreatmentCard pkg={primaryPackage} />
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#E5E2DD] text-center text-xs text-[#424843]">
              Thượng khách chưa đăng ký gói thẻ liệu trình 16 buổi nào.
            </div>
          )}

          {/* Secondary packages if any */}
          {secondaryPackages.map((secPkg: any) => (
            <div
              key={secPkg.id}
              className="bg-white rounded-2xl p-5 border border-[#E5E2DD] shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] font-bold text-[#775A19] uppercase tracking-wider">
                  Thẻ bổ sung • {secPkg.code}
                </div>
                <div className="font-serif font-bold text-base text-[#032517] mt-0.5">
                  {secPkg.service?.name}
                </div>
                <div className="text-xs text-[#424843] mt-1">
                  Đã thực hiện: <strong>{secPkg.usedSessions}/{secPkg.totalSessions} buổi</strong>
                </div>
              </div>
              <Link
                href={`/booking?packageId=${secPkg.id}&serviceId=${secPkg.service?.id}`}
                className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#E5E2DD] text-xs font-semibold text-[#032517] transition"
              >
                Đặt Lịch Buổi Này
              </Link>
            </div>
          ))}

          {/* Biometric Recovery Chart */}
          <RecoveryTrendChart />
        </div>

        {/* Right Column (5 Cols): Clinical Therapy Log & Biosensor History */}
        <div className="lg:col-span-5 sticky top-28">
          <ClinicalSessionLog appointments={customer.customerAppointments || []} />
        </div>
      </div>
    </div>
  );
}
