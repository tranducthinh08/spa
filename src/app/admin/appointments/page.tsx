import React from "react";
import { getAppointmentsAction } from "@/features/appointments/actions/appointment-actions";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { AppointmentsClientView } from "./appointments-client-view";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [aptsRes, wizardRes] = await Promise.all([
    getAppointmentsAction({ branchId: "ALL" }),
    getBookingWizardDataAction(undefined),
  ]);

  const initialAppointments = aptsRes.success ? aptsRes.data || [] : [];
  const initialRooms = wizardRes.success && wizardRes.data ? wizardRes.data.rooms || [] : [];

  return (
    <AppointmentsClientView
      initialAppointments={initialAppointments}
      initialRooms={initialRooms}
    />
  );
}
