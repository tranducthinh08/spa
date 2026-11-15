"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Phone,
  Shield,
  Clock,
  Crown,
  MapPin,
  ArrowRight,
  Check,
  Flame,
  Search,
  LogOut,
} from "lucide-react";
import { formatVND } from "@/shared/lib/utils";
import { getBookingWizardDataAction } from "@/features/booking/actions/booking-actions";
import { getCurrentSessionAction, logoutAction } from "@/features/auth/actions/auth-actions";
import { PlumeriaBookingModal } from "@/features/booking/ui/plumeria-booking-modal";

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffSession, setStaffSession] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      const [wizardRes, sessionData] = await Promise.all([
        getBookingWizardDataAction(),
        getCurrentSessionAction(),
      ]);
      if (wizardRes.success && wizardRes.data) {
        setCategories(wizardRes.data.categories);
        setBranches(wizardRes.data.branches);
        setTherapists(wizardRes.data.therapists);
        setRooms(wizardRes.data.rooms);
      }
      setStaffSession(sessionData);
      setLoading(false);
    }
    loadData();
  }, []);

  const allServices = categories.flatMap((c) =>
    c.services.map((s: any) => ({ ...s, categoryName: c.name, categoryCode: c.code }))
  );

  const filteredServices = allServices.filter((srv) => {
    const matchCat = activeCategory === "ALL" || srv.categoryCode === activeCategory;
    const matchSearch =
      !searchQuery ||
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenBooking = (srv: any) => {
    setSelectedServiceForModal(srv);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FCF9F4] text-[#1C1C19] flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="bg-[#FAF7F2]/90 border-b border-[#E5E2DD] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/dich-vu" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B3B2B] flex items-center justify-center text-[#FED488] shadow-md border border-[#C5A059]/40">
              <Sparkles className="w-6 h-6 text-[#FED488]" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-[#032517] tracking-wide">
                PLUMERIA SPA BY ROYAL
              </div>
              <div className="text-[10px] tracking-widest text-[#775A19] font-medium uppercase">
                Vẻ Đẹp Thăng Hoa — Sức Khỏe Vẹn Toàn
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#775A19] font-medium bg-[#FED488]/30 px-3.5 py-1.5 rounded-full border border-[#C5A059]/30">
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline Thượng Khách: <strong>024.3838.6868</strong></span>
            </div>

            {staffSession ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#032517] leading-tight">
                    {staffSession.name}
                  </span>
                  <span className="text-[10px] text-[#775A19] font-medium uppercase tracking-wider">
                    {staffSession.role === "SUPER_ADMIN" ? "Quản Trị Toàn Chuỗi" : staffSession.role}
                  </span>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vào Quản Trị</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutAction("/dich-vu");
                    setStaffSession(null);
                  }}
                  title="Đăng xuất quản trị"
                  className="p-2 rounded-xl border border-[#E5E2DD] bg-white hover:bg-red-50 text-[#775A19] hover:text-red-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-semibold shadow-xs transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Đăng Nhập Quản Trị</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner matching plumeriaspa.com.vn/dich-vu/ */}
      <section className="relative bg-gradient-to-br from-[#032517] via-[#1B3B2B] to-[#0A1F14] text-white py-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FED488]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2]/10 text-[#FED488] border border-[#C5A059]/40 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#FED488]" />
            PLUMERIA SPA BY ROYAL • DỊCH VỤ HOÀNG GIA
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#FAF7F2] leading-tight">
            Lựa Chọn Dịch Vụ Và Tận Hưởng <br className="hidden sm:inline" />
            <span className="text-[#FED488]">Khoảnh Khắc Thư Giãn Tuyệt Đối</span>
          </h1>

          <p className="text-sm sm:text-base text-[#83A590] max-w-2xl mx-auto leading-relaxed">
            Hệ sinh thái tiên phong kết hợp tinh hoa Dưỡng sinh Đông y cổ truyền với thiết bị Cabin Từ Trường AI và Thẩm mỹ công nghệ cao từ Thụy Sĩ & Nhật Bản.
          </p>

          {/* Quick Search */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm liệu trình (đột quỵ, massage, trẻ hóa, triệt lông...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF7F2] text-[#1C1C19] text-xs font-medium placeholder-[#775A19]/60 focus:outline-none focus:ring-2 focus:ring-[#C5A059] shadow-lg"
              />
              <Search className="w-4 h-4 text-[#775A19] absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Category Tabs */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E2DD]">
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeCategory === "ALL"
                ? "bg-[#1B3B2B] text-[#FED488] shadow-sm"
                : "bg-white text-[#424843] border border-[#E5E2DD] hover:bg-[#FAF7F2]"
            }`}
          >
            Tất Cả Dịch Vụ ({allServices.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.code)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat.code
                  ? "bg-[#1B3B2B] text-[#FED488] shadow-sm"
                  : "bg-white text-[#424843] border border-[#E5E2DD] hover:bg-[#FAF7F2]"
              }`}
            >
              {cat.name} ({cat.services.length})
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isStroke = service.code.includes("STROKE");

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-[#E5E2DD] hover:border-[#C5A059] transition-all shadow-xs overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Service Image banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-200">
                    <img
                      src={service.imageUrl || "https://plumeriaspa.com.vn/wp-content/uploads/2025/03/massage-scaled.jpg"}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1B3B2B]/90 text-[#FED488] px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#C5A059]/40">
                        {service.categoryName}
                      </span>
                      {service.requiresAiCabin && (
                        <span className="text-[10px] font-bold bg-purple-900/90 text-purple-200 px-2 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-300" />
                          Cabin AI
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FED488]" />
                      <span>Thời lượng: {service.durationMinutes} Phút</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-base text-[#032517] leading-snug group-hover:text-[#775A19] transition">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#424843] line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Price Block */}
                    <div className="pt-2 border-t border-[#F0EDE9] flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-[#775A19] uppercase font-bold">Giá trải nghiệm đơn:</div>
                        <div className="text-base font-bold text-[#032517] font-serif">
                          {formatVND(service.singlePrice)}
                        </div>
                      </div>
                      {service.packagePrice && (
                        <div className="text-right">
                          <div className="text-[10px] text-[#775A19] uppercase font-bold">Gói {service.packageSessions} buổi:</div>
                          <div className="text-xs font-bold text-[#775A19]">
                            {formatVND(service.packagePrice)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(service)}
                    className="w-full py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 group-hover:bg-[#C5A059] group-hover:text-[#032517]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đặt Lịch Ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Branches Showcase */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E2DD] shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="font-serif font-bold text-2xl text-[#032517]">
              Hệ Thống 7 Cơ Sở Plumeria Spa Toàn Quốc
            </h2>
            <p className="text-xs text-[#424843]">
              Không gian dưỡng sinh chuẩn mực phục vụ Thượng khách tại Hà Nội, Hải Phòng, Bắc Ninh và TP. Hồ Chí Minh
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DD] space-y-1.5 text-xs">
                <div className="font-serif font-bold text-sm text-[#032517]">{b.name}</div>
                <div className="text-[#424843] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#775A19] shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="text-[11px] text-[#775A19] font-medium flex items-center gap-1 pt-1">
                  <Phone className="w-3 h-3" />
                  <span>{b.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2DD] bg-[#FAF7F2] py-8 px-6 text-center text-xs text-[#424843] space-y-2">
        <div className="font-serif font-bold text-sm text-[#032517]">
          HỆ THỐNG DƯỠNG SINH ĐÔNG Y HOÀNG CUNG & CABIN TỪ TRƯỜNG AI PLUMERIA
        </div>
        <p className="max-w-xl mx-auto text-[#775A19]">
          Cơ sở 1: Tầng 3, 93 Láng Hạ, Đống Đa, Hà Nội • Hotline: 024.3838.6868
        </p>
        <div className="text-[11px] text-[#83A590] pt-1">
          © 2026 Plumeria Spa by Royal. Dữ liệu dịch vụ & hình ảnh trích xuất từ plumeriaspa.com.vn.
        </div>
      </footer>

      {/* Booking Modal */}
      <PlumeriaBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preSelectedService={selectedServiceForModal}
        branches={branches}
        services={allServices}
        therapists={therapists}
        rooms={rooms}
      />
    </div>
  );
}
