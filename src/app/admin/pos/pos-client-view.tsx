"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Sparkles,
  Receipt,
  RefreshCw,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { getPosTerminalDataAction } from "@/features/pos/actions/pos-terminal-actions";
import { PosShiftSummaryBar } from "@/widgets/pos/pos-shift-summary-bar";
import { PosCheckoutTerminal } from "@/widgets/pos/pos-checkout-terminal";
import { PosPackageSalesTerminal } from "@/widgets/pos/pos-package-sales-terminal";
import { PosInvoiceHistory } from "@/widgets/pos/pos-invoice-history";
import { PosReceiptModal } from "@/widgets/pos/pos-receipt-modal";

interface PosClientViewProps {
  initialAppointments: any[];
  initialPackageServices: any[];
  initialCustomers: any[];
  initialBranches: any[];
  initialInvoices: any[];
}

export function PosClientView({
  initialAppointments,
  initialPackageServices,
  initialCustomers,
  initialBranches,
  initialInvoices,
}: PosClientViewProps) {
  const { selectedBranch } = useRoleContext();
  const [activeTab, setActiveTab] = useState<"checkout" | "packages" | "history">("checkout");
  const [appointments, setAppointments] = useState<any[]>(initialAppointments);
  const [packageServices, setPackageServices] = useState<any[]>(initialPackageServices);
  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [branches, setBranches] = useState<any[]>(initialBranches);
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [firstMount, setFirstMount] = useState(true);

  const loadData = async (branch: string) => {
    setLoading(true);
    const res = await getPosTerminalDataAction(branch);
    if (res.success && res.data) {
      setAppointments(res.data.appointments);
      setPackageServices(res.data.packageServices);
      setCustomers(res.data.customers);
      setBranches(res.data.branches);
      setInvoices(res.data.todayInvoices);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (firstMount) {
      setFirstMount(false);
      if (selectedBranch && selectedBranch !== "ALL") {
        loadData(selectedBranch);
      }
      return;
    }
    loadData(selectedBranch);
  }, [selectedBranch]);

  const handleOpenReceipt = (invoice: any) => {
    setSelectedReceiptInvoice(invoice);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6 text-[#1C1C19]">
      {/* Top Header & Executive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#032517]">
              Quầy Thu Ngân POS & Hóa Đơn Hoàng Cung
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live POS Terminal
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-0.5">
            Thanh toán ca trị liệu, phát hành thẻ liệu trình 16 buổi và đối soát sổ quỹ ca trực thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData(selectedBranch)}
            disabled={loading}
            className="p-2 rounded-xl border border-[#E5E2DD] hover:bg-[#FAF7F2] text-[#424843] transition disabled:opacity-50"
            title="Làm mới dữ liệu POS"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* POS Shift Summary KPIs */}
      <PosShiftSummaryBar invoices={invoices} />

      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-2 border-b border-[#E5E2DD] pb-2 text-xs font-bold">
        {[
          { id: "checkout", label: `Thanh Toán Ca Trị Liệu (${appointments.length})`, icon: CreditCard },
          { id: "packages", label: "Phát Hành Thẻ Liệu Trình", icon: Sparkles },
          { id: "history", label: `Sổ Quỹ & Lịch Sử Hóa Đơn (${invoices.length})`, icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
                isActive
                  ? "bg-[#1B3B2B] text-[#FED488] shadow-xs"
                  : "bg-white text-stone-600 hover:bg-[#FAF7F2] border border-[#E5E2DD]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      {activeTab === "checkout" && (
        <PosCheckoutTerminal
          appointments={appointments}
          onCheckoutSuccess={(inv) => handleOpenReceipt(inv)}
          onRefresh={() => loadData(selectedBranch)}
        />
      )}

      {activeTab === "packages" && (
        <PosPackageSalesTerminal
          packageServices={packageServices}
          customers={customers}
          branches={branches}
          selectedBranch={selectedBranch}
          onSaleSuccess={(inv) => handleOpenReceipt(inv)}
          onRefresh={() => loadData(selectedBranch)}
        />
      )}

      {activeTab === "history" && (
        <PosInvoiceHistory
          invoices={invoices}
          onSelectInvoice={(inv) => handleOpenReceipt(inv)}
        />
      )}

      {/* Receipt Modal */}
      <PosReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={selectedReceiptInvoice}
      />
    </div>
  );
}
