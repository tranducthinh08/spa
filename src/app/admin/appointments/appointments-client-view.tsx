"use client";

import React, { useEffect, useState } from "react";
import { useRoleContext } from "@/shared/components/role-switcher-bar";
import { getAppointmentsAction } from "@/features/appointments/actions/appointment-actions";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { TimelineKpiBar } from "@/widgets/appointments/timeline-kpi-bar";
import { TimelineGanttMatrix } from "@/widgets/appointments/timeline-gantt-matrix";
import { AppointmentInspector } from "@/widgets/appointments/appointment-inspector";
import { RefreshCw, PlusCircle } from "lucide-react";
import Link from "next/link";

interface AppointmentsClientViewProps {
  initialAppointments: any[];
  initialRooms: any[];
}

export function AppointmentsClientView({
  initialAppointments,
  initialRooms,
}: AppointmentsClientViewProps) {
  const { selectedBranch } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>(initialAppointments);
  const [rooms, setRooms] = useState<any[]>(initialRooms);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    initialAppointments.length > 0 ? initialAppointments[0] : null
  );
  const [firstMount, setFirstMount] = useState(true);

  const loadData = async (branch: string) => {
    setLoading(true);
    const [aptsRes, wizardRes] = await Promise.all([
      getAppointmentsAction({ branchId: branch }),
      getBookingWizardDataAction(branch),
    ]);

    if (aptsRes.success && aptsRes.data) {
      setAppointments(aptsRes.data);
      if (selectedAppointment) {
        const updated = aptsRes.data.find((a: any) => a.id === selectedAppointment.id);
        setSelectedAppointment(updated || (aptsRes.data.length > 0 ? aptsRes.data[0] : null));
      } else {
        setSelectedAppointment(aptsRes.data.length > 0 ? aptsRes.data[0] : null);
      }
    }

    if (wizardRes.success && wizardRes.data) {
      setRooms(wizardRes.data.rooms);
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

  // Compute live KPIs
  const aiCabins = rooms.filter((r) => r.type === "AI_CABIN");
  const occupiedAiCabins = aiCabins.filter((r) => r.status === "OCCUPIED").length;
  const vipRooms = rooms.filter((r) => r.type !== "AI_CABIN");
  const occupiedVip = vipRooms.filter((r) => r.status === "OCCUPIED").length;
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
            onClick={() => loadData(selectedBranch)}
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
            onRefresh={() => loadData(selectedBranch)}
          />
        </div>
      </div>
    </div>
  );
}
