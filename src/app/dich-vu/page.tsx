import React from "react";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { getCurrentSessionAction } from "@/features/auth/actions/auth-actions";
import { ServicesClientView } from "./services-client-view";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [wizardRes, session] = await Promise.all([
    getBookingWizardDataAction(),
    getCurrentSessionAction(),
  ]);

  return (
    <ServicesClientView
      initialWizardData={wizardRes.success ? wizardRes.data : null}
      initialSession={session}
    />
  );
}
