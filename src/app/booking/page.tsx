import React, { Suspense } from "react";
import Link from "next/link";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { RoleProvider } from "@/shared/components/role-switcher-bar";
import { EditorialLuxuryShowcase } from "@/features/booking/ui/editorial-luxury-showcase";
import { BookingWizardContainer } from "@/widgets/booking/booking-wizard-container";
import { Sparkles, Phone, Shield, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingPage(props: {
  searchParams?: Promise<{
    packageId?: string;
    serviceId?: string;
    customerPhone?: string;
  }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const customerPhone = searchParams.customerPhone || "0988776655";

  const wizardDataRes = await getBookingWizardDataAction(undefined, customerPhone);
  const data = wizardDataRes.data || {
    branches: [],
    categories: [],
    rooms: [],
    therapists: [],
    customerPackages: [],
  };

  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải cổng đặt lịch...</div>}>
      <RoleProvider>
        <div className="min-h-screen bg-[#FCF9F4] text-[#1C1C19] flex flex-col">
          {/* Main Top Header */}
          <header className="bg-[#FAF7F2]/90 border-b border-[#E5E2DD] sticky top-[37px] z-40 backdrop-blur-md">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
              {/* Brand Logo */}
              <Link href="/booking" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1B3B2B] flex items-center justify-center text-[#FED488] shadow-md border border-[#C5A059]/40">
                  <Sparkles className="w-6 h-6 text-[#FED488]" />
                </div>
                <div>
                  <div className="font-serif font-bold text-lg text-[#032517] tracking-wide">
                    PLUMERIA BY ROYAL
                  </div>
                  <div className="text-[10px] tracking-widest text-[#775A19] font-medium uppercase">
                    Eastern Wellness & AI Therapy
                  </div>
                </div>
              </Link>

              {/* Header Right Action Pill */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-xs text-[#775A19] font-medium bg-[#FED488]/30 px-3 py-1.5 rounded-full border border-[#C5A059]/30">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hotline Thượng Khách: <strong>024.3838.6868</strong></span>
                </div>

                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Trang Quản Trị</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </header>

          {/* Main 2-Column Split Experience */}
          <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: 40% (5 cols) Editorial Luxury Showcase */}
              <div className="lg:col-span-5">
                <EditorialLuxuryShowcase />
              </div>

              {/* Right Column: 60% (7 cols) 4-Step Interactive Booking Wizard */}
              <div className="lg:col-span-7">
                <BookingWizardContainer
                  branches={data.branches}
                  categories={data.categories}
                  rooms={data.rooms}
                  therapists={data.therapists}
                  initialPackages={data.customerPackages}
                  initialCustomerPhone={customerPhone}
                />
              </div>
            </div>
          </main>

          {/* Luxury Footer */}
          <footer className="border-t border-[#E5E2DD] bg-[#FAF7F2] py-8 px-6 text-center text-xs text-[#424843] space-y-2">
            <div className="font-serif font-bold text-sm text-[#032517]">
              HỆ THỐNG DƯỠNG SINH ĐÔNG Y HOÀNG CUNG & CABIN TỪ TRƯỜNG AI PLUMERIA
            </div>
            <p className="max-w-xl mx-auto text-[#775A19]">
              Hà Nội: 88 Láng Hạ, Đống Đa • Biệt thự Sơn Tây Luxury • San Hô Vinhomes Ocean Park | Hải Phòng: 26 Lê Hồng Phong
            </p>
            <div className="text-[11px] text-[#83A590] pt-1">
              © 2026 Plumeria Spa by Royal. Bản quyền giải pháp thuộc về Hệ thống Điều hành Y Sinh Hoàng Cung.
            </div>
          </footer>
        </div>
      </RoleProvider>
    </Suspense>
  );
}
