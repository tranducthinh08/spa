import React from "react";
import { getAppointmentsAction } from "@/features/appointments/actions/appointment-actions";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { AppointmentsClientView } from "./appointments-client-view";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const session = await getCurrentSessionAction();
  const branchFilter =
    session && session.role !== "SUPER_ADMIN" && session.branchId
      ? session.branchId
      : "ALL";

  const [aptsRes, wizardRes] = await Promise.all([
    getAppointmentsAction({ branchId: branchFilter }),
    getBookingWizardDataAction(branchFilter),
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
