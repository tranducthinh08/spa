"use client";

import React from "react";
import { Printer, X, CheckCircle2, QrCode, Sparkles } from "lucide-react";
import { formatVND, formatTimeVN, formatDateVN } from "@/shared/lib/utils";

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

export function PosReceiptModal({ isOpen, onClose, invoice }: PosReceiptModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isBankTransfer = invoice.paymentMethod === "BANK_TRANSFER";
  const isPackage = invoice.paymentMethod === "PACKAGE_REDEMPTION";

  // Dynamic VietQR generator
  const qrUrl = isBankTransfer
    ? `https://img.vietqr.io/image/MB-99998888PLUMERIA-compact.png?amount=${invoice.finalAmount}&addInfo=${invoice.invoiceNumber}&accountName=PLUMERIA%20SPA%20HOANG%20GIA`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Print stylesheet override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pos-receipt-print-area,
          #pos-receipt-print-area * {
            visibility: visible !important;
          }
          #pos-receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 10px !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E5E2DD] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#1B3B2B] text-[#FED488] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-serif font-bold text-sm">Hóa Đơn Hoàng Cung Chuẩn POS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body (K80 Styled) */}
        <div
          id="pos-receipt-print-area"
          className="p-6 overflow-y-auto font-sans text-stone-900 bg-[#FAF7F2]/40 text-xs space-y-4"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-stone-300">
            <div className="font-serif font-bold text-lg text-[#032517] tracking-wider uppercase">
              PLUMERIA SPA BY ROYAL
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Hệ Thống Dưỡng Sinh Đông Y & Cabin Từ Trường AI
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              {invoice.branch?.address || "Tầng 3, 93 Láng Hạ, Đống Đa, Hà Nội"}
            </div>
            <div className="text-[10px] font-mono text-stone-500 mt-0.5">
              Hotline: 024.3838.6868 • MST: 0109988776
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500">Mã hóa đơn:</span>
              <span className="font-mono font-bold text-[#032517]">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Thời gian:</span>
              <span>{formatTimeVN(invoice.createdAt)} - {formatDateVN(invoice.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Thượng khách:</span>
              <span className="font-bold text-[#032517]">{invoice.customer?.name} ({invoice.customer?.phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Hạng thẻ:</span>
              <span className="font-semibold text-[#775A19]">{invoice.customer?.membershipTier || "SILVER"}</span>
            </div>
            {invoice.appointment?.therapist && (
              <div className="flex justify-between">
                <span className="text-stone-500">KTV Ngự Y:</span>
                <span>{invoice.appointment.therapist.name}</span>
              </div>
            )}
          </div>

          {/* Bill Items */}
          <div className="space-y-2 pb-3 border-b border-dashed border-stone-300">
            <div className="flex justify-between text-[10px] font-bold uppercase text-stone-400 pb-1">
              <span>Nội Dung Liệu Trình / Gói</span>
              <span>Thành Tiền</span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-[#032517]">
                  {invoice.appointment?.service?.name || "Gói Liệu Trình Thượng Hạng"}
                </div>
                {invoice.appointment?.roomBed && (
                  <div className="text-[10px] text-stone-400">
                    Phòng: {invoice.appointment.roomBed.name}
                  </div>
                )}
              </div>
              <div className="font-bold text-right">
                {formatVND(invoice.totalAmount)}
              </div>
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-stone-300">
            <div className="flex justify-between text-stone-500">
              <span>Tổng tiền dịch vụ:</span>
              <span>{formatVND(invoice.totalAmount)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>{isPackage ? "Chiết khấu thẻ liệu trình:" : "Chiết khấu đặc quyền VIP:"}</span>
                <span>-{formatVND(invoice.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-[#032517] pt-1">
              <span>THANH TOÁN THỰC TẾ:</span>
              <span className="font-serif text-base text-[#1B3B2B]">
                {isPackage ? "0 ₫ (Đã trừ thẻ)" : formatVND(invoice.finalAmount)}
              </span>
            </div>

            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Hình thức:</span>
              <span className="font-bold text-[#775A19]">{invoice.paymentMethod}</span>
            </div>
          </div>

          {/* VietQR Code Display */}
          {qrUrl && invoice.finalAmount > 0 && (
            <div className="text-center p-3 bg-white rounded-2xl border border-[#E5E2DD] space-y-1.5">
              <div className="text-[11px] font-bold text-[#032517] flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Quét Mã VietQR Chuyển Khoản 24/7</span>
              </div>
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-44 h-44 mx-auto rounded-xl border border-stone-200"
              />
              <div className="text-[10px] text-stone-400 font-mono">
                MB Bank: 99998888PLUMERIA
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center text-[10px] text-stone-400 space-y-1 pt-1">
            <div className="font-serif italic text-stone-600">
              "Kính chúc Quý khách thân tâm an lạc, vạn sự hanh thông!"
            </div>
            <div>Tích lũy +50 điểm Hoàng Cung cho lần trị liệu tiếp theo.</div>
            <div className="text-[9px] text-stone-300 font-mono">
              In tự động từ Plumeria Cloud POS Terminal
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-[#E5E2DD] flex items-center justify-end gap-2.5 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E5E2DD] hover:bg-[#FAF7F2] text-xs font-semibold text-stone-600 transition"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1B3B2B] hover:bg-[#032517] text-[#FED488] text-xs font-bold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn (K80)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
