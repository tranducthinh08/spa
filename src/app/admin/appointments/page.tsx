"use client";

import React, { useEffect, useState } from "react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { getAppointmentsAction } from "@/features/appointments/actions/appointment-actions";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { TimelineKpiBar } from "@/widgets/appointments/timeline-kpi-bar";
import { TimelineGanttMatrix } from "@/widgets/appointments/timeline-gantt-matrix";
import { AppointmentInspector } from "@/widgets/appointments/appointment-inspector";
import { Calendar, RefreshCw, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  const { selectedBranch } = useRoleContext();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [aptsRes, wizardRes] = await Promise.all([
      getAppointmentsAction({ branchId: selectedBranch }),
      getBookingWizardDataAction(selectedBranch !== "ALL" ? selectedBranch : undefined),
    ]);

    if (aptsRes.success && aptsRes.data) {
      setAppointments(aptsRes.data);
      // Auto select first active or confirmed appointment
      if (!selectedAppointment && aptsRes.data.length > 0) {
        setSelectedAppointment(aptsRes.data[0]);
      } else if (selectedAppointment) {
        const updated = aptsRes.data.find((a: any) => a.id === selectedAppointment.id);
        if (updated) setSelectedAppointment(updated);
      }
    }

    if (wizardRes.success && wizardRes.data) {
      setRooms(wizardRes.data.rooms);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  // Compute live KPIs
  const aiCabins = rooms.filter((r) => r.type === "AI_CABIN");
  const occupiedAiCabins = aiCabins.filter((r) => r.status === "OCCUPIED").length;
  const vipRooms = rooms.filter((r) => r.type !== "AI_CABIN");
  const occupiedVip = vipRooms.filter((r) => r.status === "OCCUPIED").length;
  const inProgressApts = appointments.filter((a) => a.status === "IN_PROGRESS").length;
  const confirmedApts = appointments.filter((a) => a.status === "CONFIRMED").length;

  return (
    <div className="space-y-5">
      {/* Top Header & Matrix Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E2DD] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#032517]">
              Smart Dispatch & Timeline Matrix
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Grid
            </span>
          </div>
          <p className="text-xs text-[#424843] mt-0.5">
            Điều phối thời gian thực Cabin Từ Trường AI, Phòng VIP Đông Y & Kỹ Thuật Viên Ngự Y
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-[#E5E2DD] hover:bg-[#FAF7F2] text-[#424843] transition disabled:opacity-50"
            title="Làm mới lịch"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Xếp Lịch Trị Liệu Mới</span>
          </Link>
        </div>
      </div>

      {/* KPI Bar */}
      <TimelineKpiBar
        cabinOccupancy={`${occupiedAiCabins}/${aiCabins.length || 4} Buồng hoạt động`}
        vipRoomOccupancy={`${occupiedVip}/${vipRooms.length || 6} Phòng có khách`}
        activeTherapists={4}
        waitingCheckin={confirmedApts}
      />

      {/* Main Split Layout: 70% Matrix Timeline - 30% Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 xl:col-span-8">
          <TimelineGanttMatrix
            rooms={rooms}
            appointments={appointments}
            selectedAppointmentId={selectedAppointment?.id || null}
            onSelectAppointment={(apt) => setSelectedAppointment(apt)}
          />
        </div>

        <div className="lg:col-span-4 xl:col-span-4 sticky top-28">
          <AppointmentInspector
            appointment={selectedAppointment}
            onRefresh={loadData}
          />
        </div>
      </div>
    </div>
  );
}
