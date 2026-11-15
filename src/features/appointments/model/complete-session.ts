import { prisma } from "@/shared/lib/prisma";

export interface CompleteSessionParams {
  appointmentId: string;
  postSessionFeedback?: string;
  rating?: number;
  healthNotesUpdate?: string;
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "CARD" | "PACKAGE_REDEMPTION";
}

export interface SessionCompletionResult {
  success: boolean;
  appointmentId: string;
  packageDeduction?: {
    packageId: string;
    usedSessions: number;
    remainingSessions: number;
    isExhausted: boolean;
  };
  inventoryDeductions: Array<{
    productName: string;
    deductedQty: number;
    remainingQty: number;
    isLowStock: boolean;
  }>;
  commission: {
    therapistId: string;
    therapistName: string;
    commissionAmount: number;
    rate: number;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    finalAmount: number;
    paymentMethod: string;
  };
}

export async function completeAppointmentTransaction(
  params: CompleteSessionParams
): Promise<SessionCompletionResult> {
  const { appointmentId, postSessionFeedback, rating, healthNotesUpdate, paymentMethod } = params;

  // 1. Fetch current appointment details
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: {
        include: {
          consumables: {
            include: { product: true },
          },
        },
      },
      therapist: true,
      customer: true,
      roomBed: true,
      customerPackage: true,
    },
  });

  if (!apt) {
    throw new Error(`Không tìm thấy ca trị liệu với ID: ${appointmentId}`);
  }

  if (apt.status === "COMPLETED") {
    throw new Error("Ca trị liệu này đã được hoàn tất trước đó.");
  }

  if (apt.status === "CANCELLED") {
    throw new Error("Không thể hoàn tất ca trị liệu đã bị hủy.");
  }

  // 2. Perform ACID Transaction
  return await prisma.$transaction(async (tx) => {
    // a. Update Appointment Status
    const updatedApt = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED",
        postSessionFeedback: postSessionFeedback || apt.postSessionFeedback,
        rating: rating || apt.rating || 5,
        healthNotes: healthNotesUpdate ? `${apt.healthNotes || ""}\n${healthNotesUpdate}`.trim() : apt.healthNotes,
      },
    });

    // b. Free Room/Bed back to AVAILABLE
    await tx.roomBed.update({
      where: { id: apt.roomBedId },
      data: { status: "AVAILABLE" },
    });

    // c. Deduct Customer Package (if applicable)
    let packageDeductionResult;
    if (apt.customerPackageId && apt.customerPackage) {
      const newUsed = apt.customerPackage.usedSessions + 1;
      const newRemaining = Math.max(0, apt.customerPackage.remainingSessions - 1);
      const isExhausted = newRemaining === 0;

      await tx.customerPackage.update({
        where: { id: apt.customerPackageId },
        data: {
          usedSessions: newUsed,
          remainingSessions: newRemaining,
          status: isExhausted ? "EXHAUSTED" : "ACTIVE",
        },
      });

      packageDeductionResult = {
        packageId: apt.customerPackageId,
        usedSessions: newUsed,
        remainingSessions: newRemaining,
        isExhausted,
      };
    }

    // d. BOM Inventory Deductions
    const inventoryDeductions = [];
    for (const consumable of apt.service.consumables) {
      const currentInv = await tx.branchInventory.findUnique({
        where: {
          branchId_productId: {
            branchId: apt.branchId,
            productId: consumable.productId,
          },
        },
      });

      const currentQty = currentInv ? currentInv.quantity : 0;
      const newQty = currentQty - consumable.quantity;
      const reorderLvl = currentInv ? currentInv.reorderLevel : 10;
      const isLowStock = newQty <= reorderLvl;

      await tx.branchInventory.upsert({
        where: {
          branchId_productId: {
            branchId: apt.branchId,
            productId: consumable.productId,
          },
        },
        create: {
          branchId: apt.branchId,
          productId: consumable.productId,
          quantity: newQty,
          reorderLevel: reorderLvl,
        },
        update: {
          quantity: newQty,
        },
      });

      inventoryDeductions.push({
        productName: consumable.product.name,
        deductedQty: consumable.quantity,
        remainingQty: newQty,
        isLowStock,
      });
    }

    // e. Calculate and record Therapist Commission
    const commissionRate = apt.therapist.commissionRate || 0.1;
    const serviceAmount = apt.service.singlePrice;
    const commissionAmount = Math.round(serviceAmount * commissionRate);

    await tx.staffCommission.upsert({
      where: { appointmentId: apt.id },
      create: {
        therapistId: apt.therapistId,
        appointmentId: apt.id,
        serviceAmount,
        rate: commissionRate,
        commissionAmount,
        status: "APPROVED",
      },
      update: {
        serviceAmount,
        rate: commissionRate,
        commissionAmount,
      },
    });

    // f. Generate POS Invoice
    const isPackageRedeem = Boolean(apt.customerPackageId);
    const chosenMethod = isPackageRedeem
      ? "PACKAGE_REDEMPTION"
      : paymentMethod || "CASH";
    const finalAmount = isPackageRedeem ? 0 : serviceAmount;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${apt.bookingCode.slice(-4)}`;

    const createdInvoice = await tx.invoice.upsert({
      where: { appointmentId: apt.id },
      create: {
        invoiceNumber,
        branchId: apt.branchId,
        customerId: apt.customerId,
        appointmentId: apt.id,
        totalAmount: serviceAmount,
        discountAmount: isPackageRedeem ? serviceAmount : 0,
        finalAmount,
        paymentMethod: chosenMethod,
        status: "PAID",
      },
      update: {
        finalAmount,
        paymentMethod: chosenMethod,
        status: "PAID",
      },
    });

    // g. Reward customer loyalty points (+50 pts)
    await tx.user.update({
      where: { id: apt.customerId },
      data: { loyaltyPoints: { increment: 50 } },
    });

    return {
      success: true,
      appointmentId: updatedApt.id,
      packageDeduction: packageDeductionResult,
      inventoryDeductions,
      commission: {
        therapistId: apt.therapistId,
        therapistName: apt.therapist.name,
        commissionAmount,
        rate: commissionRate,
      },
      invoice: {
        id: createdInvoice.id,
        invoiceNumber: createdInvoice.invoiceNumber,
        finalAmount: createdInvoice.finalAmount,
        paymentMethod: createdInvoice.paymentMethod,
      },
    };
  });
}
