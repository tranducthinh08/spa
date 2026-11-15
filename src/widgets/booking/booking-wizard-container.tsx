"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Calendar, Clock, MapPin } from "lucide-react";
import { BookingWizardStep1Branch } from "@/features/booking/ui/booking-wizard-step1-branch";
import { BookingWizardStep2Service } from "@/features/booking/ui/booking-wizard-step2-service";
import { BookingWizardStep3DateTime } from "@/features/booking/ui/booking-wizard-step3-datetime";
import { BookingWizardStep4Confirm } from "@/features/booking/ui/booking-wizard-step4-confirm";
import { createBookingAction } from "@/features/booking/actions/booking-actions";
import { formatVND } from "@/shared/lib/utils";

interface WizardProps {
  branches: Array<any>;
  categories: Array<any>;
  rooms: Array<any>;
  therapists: Array<any>;
  initialPackages?: Array<any>;
  initialCustomerPhone?: string;
}

export function BookingWizardContainer({
  branches,
  categories,
  rooms,
  therapists,
  initialPackages = [],
  initialCustomerPhone = "0988776655",
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");
  const [selectedServiceId, setSelectedServiceId] = useState(categories[1]?.services[0]?.id || "");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(initialPackages[0]?.id || null);
  const [customerPackages, setCustomerPackages] = useState(initialPackages);

  // Step 3 state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("16:30");
  const [selectedTherapistId, setSelectedTherapistId] = useState(therapists[0]?.id || "");
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || "");

  // Step 4 state
  const [customerName, setCustomerName] = useState("Bà Nguyễn Thị Minh Khai");
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);
  const [healthNotes, setHealthNotes] = useState("Huyết áp cao 135/85 mmHg, nhức mỏi cơ cổ sau khi họp dài.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  // Derived references
  const currentBranch = branches.find((b) => b.id === selectedBranchId);
  const allServices = categories.flatMap((c) => c.services);
  const currentService = allServices.find((s) => s.id === selectedServiceId);
  const currentTherapist = therapists.find((t) => t.id === selectedTherapistId);
  const currentRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Compute ISO start and end
    const [hours, minutes] = selectedTimeSlot.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);

    const duration = currentService?.durationMinutes || 90;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const result = await createBookingAction({
      branchId: selectedBranchId,
      serviceId: selectedServiceId,
      therapistId: selectedTherapistId,
      roomBedId: selectedRoomId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      customerName,
      customerPhone,
      customerPackageId: selectedPackageId || undefined,
      healthNotes,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Không thể xếp lịch do xung đột.");
    } else {
      setBookingSuccessData(result.data);
    }
  };

  // If successfully booked, render confirmation screen
  if (bookingSuccessData) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-[#C5A059] shadow-2xl text-center space-y-5 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#1B3B2B] text-[#FED488] flex items-center justify-center mx-auto shadow-lg border-2 border-[#C5A059]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#775A19] bg-[#FED488]/40 px-3 py-1 rounded-full">
            Đặt Chỗ Thành Công
          </span>
          <h2 className="font-serif font-bold text-2xl text-[#032517] mt-2">
            Kính Chúc Quý Khách An Lạc!
          </h2>
          <p className="text-xs text-[#424843] mt-1">
            Mã đặt lịch của Thượng khách đã được ghi nhận trực tiếp vào hệ thống điều phối
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] text-xs text-left space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-[#775A19]">Mã Đặt Hẹn:</span>
            <span className="font-mono font-bold text-base text-[#1B3B2B]">
              {bookingSuccessData.bookingCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#775A19]">Cơ Sở:</span>
            <span className="font-semibold">{bookingSuccessData.branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#775A19]">Liệu Trình:</span>
            <span className="font-semibold">{bookingSuccessData.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#775A19]">KTV Ngự Y:</span>
            <span className="font-semibold">{bookingSuccessData.therapistName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#775A19]">Phòng / Cabin:</span>
            <span className="font-semibold">{bookingSuccessData.roomName}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/admin/appointments"
            className="w-full py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Xem Trên Timeline Điều Phối</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setBookingSuccessData(null);
              setCurrentStep(1);
            }}
            className="w-full py-2.5 rounded-xl border border-[#E5E2DD] text-xs font-semibold text-[#424843] hover:bg-[#FAF7F2] transition"
          >
            Đặt Thêm Lịch Hẹn Khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DD] shadow-lg flex flex-col justify-between min-h-[580px]">
      <div>
        {/* Wizard Stepper Progress Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E5E2DD] mb-6">
          {[1, 2, 3, 4].map((step) => {
            const isActive = currentStep === step;
            const isDone = currentStep > step;
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-[#1B3B2B] text-[#FED488]"
                      : isActive
                      ? "bg-[#FED488] text-[#032517] ring-4 ring-[#FED488]/30 font-extrabold"
                      : "bg-[#F0EDE9] text-[#775A19]"
                  }`}
                >
                  {isDone ? "✓" : step}
                </div>
                <span className="hidden md:inline text-xs font-medium text-[#424843]">
                  {step === 1 && "Chi nhánh"}
                  {step === 2 && "Liệu trình"}
                  {step === 3 && "Ngày & KTV"}
                  {step === 4 && "Xác nhận"}
                </span>
                {step < 4 && <div className="hidden sm:block w-8 lg:w-14 h-0.5 bg-[#E5E2DD]" />}
              </div>
            );
          })}
        </div>

        {/* Step Views */}
        {currentStep === 1 && (
          <BookingWizardStep1Branch
            branches={branches}
            selectedBranchId={selectedBranchId}
            onSelectBranch={(id) => {
              setSelectedBranchId(id);
              handleNext();
            }}
          />
        )}

        {currentStep === 2 && (
          <BookingWizardStep2Service
            categories={categories}
            customerPackages={customerPackages}
            selectedServiceId={selectedServiceId}
            selectedPackageId={selectedPackageId}
            onSelectService={(srvId, pkgId) => {
              setSelectedServiceId(srvId);
              setSelectedPackageId(pkgId || null);
            }}
          />
        )}

        {currentStep === 3 && (
          <BookingWizardStep3DateTime
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onSelectTimeSlot={setSelectedTimeSlot}
            therapists={therapists}
            selectedTherapistId={selectedTherapistId}
            onSelectTherapist={setSelectedTherapistId}
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
        )}

        {currentStep === 4 && (
          <BookingWizardStep4Confirm
            summary={{
              branchName: currentBranch?.name,
              serviceName: currentService?.name,
              durationMinutes: currentService?.durationMinutes,
              price: currentService?.singlePrice,
              isPackageRedeem: Boolean(selectedPackageId),
              date: selectedDate,
              timeSlot: selectedTimeSlot,
              therapistName: currentTherapist?.name,
              roomName: currentRoom?.name,
            }}
            customerName={customerName}
            onChangeName={setCustomerName}
            customerPhone={customerPhone}
            onChangePhone={setCustomerPhone}
            healthNotes={healthNotes}
            onChangeHealthNotes={setHealthNotes}
            errorMessage={errorMessage}
          />
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="mt-8 pt-4 border-t border-[#E5E2DD] flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E2DD] text-xs font-semibold text-[#424843] hover:bg-[#FAF7F2] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        ) : (
          <div className="text-xs text-[#775A19] font-medium">
            Bước 1 / 4
          </div>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-bold transition shadow-sm"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={isSubmitting || !customerName || !customerPhone}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08c46] text-[#032517] text-xs font-bold transition shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? "Đang xếp lịch..." : "Xác Nhận Đặt Chỗ Hoàng Gia"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
