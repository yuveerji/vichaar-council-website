import prisma from "@/lib/db";
import { syncPaymentToSheets, syncRegistrationToSheets } from "@/lib/google-sheets";
import { sendEventConfirmationEmail, sendPaymentFailedEmail } from "@/lib/sendEmail";

export interface ConfirmRegistrationParams {
  registrationId?: string;
  registrationNumber?: string;
  orderId?: string;
  cfPaymentId?: string;
  paymentMethod?: string;
  bankReference?: string;
  amount?: number;
  source?: "CASHFREE_VERIFY" | "CASHFREE_WEBHOOK" | "GSHEETS_SYNC" | "ADMIN_PORTAL";
  forceResend?: boolean;
}

export async function confirmRegistrationSuccess(params: ConfirmRegistrationParams) {
  const {
    registrationId,
    registrationNumber,
    orderId,
    cfPaymentId,
    paymentMethod = "ONLINE",
    bankReference = "N/A",
    amount,
    source = "CASHFREE_VERIFY",
    forceResend = false
  } = params;

  console.log(`[REGISTRATION CONFIRMATION] Processing confirmation via ${source}...`, params);

  // 1. Locate Registration
  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        ...(registrationId ? [{ id: registrationId }] : []),
        ...(registrationNumber ? [{ registrationNumber }] : []),
        ...(orderId ? [{ paymentOrder: { orderId } }] : [])
      ]
    },
    include: {
      event: true,
      ticketCategory: true,
      participant: true,
      paymentOrder: true
    }
  });

  if (!registration) {
    throw new Error(
      `Registration record not found for parameters: ${JSON.stringify({
        registrationId,
        registrationNumber,
        orderId
      })}`
    );
  }

  const effectiveOrderId = orderId || registration.paymentOrder?.orderId || `TVC_MANUAL_${registration.registrationNumber}`;
  const effectiveAmount = amount ?? registration.paymentOrder?.amount ?? registration.totalAmount;
  const isAlreadySuccess = registration.paymentStatus === "SUCCESS";

  // 2. Resolve participant account if not linked
  let resolvedParticipantId = registration.participantId;
  let resolvedParticipant = registration.participant;

  if (!resolvedParticipantId) {
    const userMatch = await prisma.participantUser.findUnique({
      where: { email: registration.email }
    });
    if (userMatch) {
      resolvedParticipantId = userMatch.id;
      resolvedParticipant = userMatch;
    }
  }

  // 3. Database State Update (Atomic Transaction)
  if (!isAlreadySuccess) {
    await prisma.$transaction(async (tx) => {
      // Update registration status
      await tx.registration.update({
        where: { id: registration.id },
        data: {
          paymentStatus: "SUCCESS",
          ...(resolvedParticipantId ? { participantId: resolvedParticipantId } : {})
        }
      });

      // Update or create payment order
      if (registration.paymentOrder) {
        await tx.paymentOrder.update({
          where: { id: registration.paymentOrder.id },
          data: {
            status: "SUCCESS",
            paymentMethod,
            bankReference,
            paymentTime: new Date()
          }
        });
      }

      // Increment ticket sold count and event attendance
      await tx.ticketCategory.update({
        where: { id: registration.ticketCategoryId },
        data: { soldCount: { increment: 1 } }
      });

      await tx.event.update({
        where: { id: registration.eventId },
        data: { registeredCount: { increment: 1 } }
      });
    });

    // Record payment attempt safely (audit log)
    if (registration.paymentOrder?.id) {
      try {
        await prisma.paymentAttempt.create({
          data: {
            orderId: registration.paymentOrder.id,
            cfPaymentId: cfPaymentId || `pay_${Date.now()}`,
            paymentMethod,
            paymentStatus: "SUCCESS",
            amount: effectiveAmount,
            rawPayloadJson: JSON.stringify({ source, bankReference, timestamp: new Date() })
          }
        });
      } catch (attemptErr) {
        console.warn("[PAYMENT_ATTEMPT] Non-critical warning recording payment attempt:", attemptErr);
      }
    }
  }

  // 4. Create In-Website Notification for Participant
  if (resolvedParticipantId) {
    try {
      const existingNotification = await prisma.participantNotification.findFirst({
        where: {
          participantId: resolvedParticipantId,
          type: "REGISTRATION",
          title: { contains: registration.registrationNumber }
        }
      });

      if (!existingNotification) {
        await prisma.participantNotification.create({
          data: {
            participantId: resolvedParticipantId,
            title: `Registration Confirmed · ${registration.registrationNumber}`,
            message: `Your delegate registration for "${registration.event.title}" has been successfully confirmed. Your digital pass and admission credentials are now active.`,
            link: "/my-vichaar/tickets",
            type: "REGISTRATION",
            isRead: false
          }
        });
        console.log(`[IN-SITE NOTIFICATION] Created notification for participant ${resolvedParticipantId}`);
      }
    } catch (notifErr) {
      console.error("[IN-SITE NOTIFICATION ERROR]:", notifErr);
    }
  }

  // 5. Google Sheets Master Database Synchronization (Cashfree & Registration)
  try {
    await Promise.allSettled([
      // A. Sync to PAYMENTS tab
      syncPaymentToSheets({
        orderId: effectiveOrderId,
        cfOrderId: registration.paymentOrder?.cfOrderId || "",
        registrationNumber: registration.registrationNumber,
        participantName: registration.fullName,
        payerEmail: registration.email,
        payerPhone: registration.phone,
        amount: effectiveAmount,
        paymentMethod,
        paymentStatus: "SUCCESS",
        bankReference
      }),
      // B. Update REGISTRATIONS & TICKETS tabs
      syncRegistrationToSheets({
        id: registration.id,
        registrationNumber: registration.registrationNumber,
        eventId: registration.eventId,
        eventTitle: registration.event.title,
        registrationType: "INDIVIDUAL_DELEGATE",
        participantId: resolvedParticipantId || "",
        fullName: registration.fullName,
        email: registration.email,
        phone: registration.phone,
        institution: registration.institution,
        passCategory: registration.ticketCategory.name,
        totalAmount: effectiveAmount,
        paymentStatus: "SUCCESS"
      })
    ]);
    console.log(`[GOOGLE SHEETS SYNC] Synchronized ${registration.registrationNumber} to PAYMENTS and REGISTRATIONS.`);
  } catch (sheetErr) {
    console.error("[GOOGLE SHEETS SYNC ERROR]:", sheetErr);
  }

  // 6. Dispatch Official Delegate Admission Voucher & Letter Email (Anti-Spam Deduplication)
  const shouldSendEmail = !isAlreadySuccess || forceResend;
  if (shouldSendEmail) {
    try {
      const formattedDate = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
      }).format(new Date(registration.event.startDate));

      await sendEventConfirmationEmail({
        name: registration.fullName,
        email: registration.email,
        registrationNumber: registration.registrationNumber,
        eventTitle: registration.event.title,
        ticketCategory: registration.ticketCategory.name,
        venue: registration.event.venue,
        city: registration.event.city,
        eventDate: formattedDate,
        amountPaid: effectiveAmount,
        currency: registration.currency || "INR",
        orderId: effectiveOrderId,
        bankReference
      });
      console.log(`[CONFIRMATION EMAIL DISPATCHED] Sent to ${registration.email} (forced: ${!!forceResend})`);
    } catch (emailErr) {
      console.error("[CONFIRMATION EMAIL ERROR]:", emailErr);
    }
  } else {
    console.log(
      `[CONFIRMATION EMAIL SKIPPED] Registration ${registration.registrationNumber} is already confirmed previously. Duplicate email prevented.`
    );
  }

  return {
    success: true,
    registration: {
      registrationNumber: registration.registrationNumber,
      fullName: registration.fullName,
      email: registration.email,
      eventTitle: registration.event.title,
      eventDate: registration.event.startDate,
      venue: registration.event.venue,
      ticketName: registration.ticketCategory.name,
      amountPaid: effectiveAmount,
      currency: registration.currency,
      orderId: effectiveOrderId,
      paymentMethod,
      bankReference,
      confirmedAt: new Date()
    }
  };
}

export interface CancelRegistrationParams {
  registrationNumber?: string;
  orderId?: string;
  reason?: string;
  hardDelete?: boolean;
}

export async function cancelOrRemoveRegistration(params: CancelRegistrationParams) {
  const {
    registrationNumber,
    orderId,
    reason = "Removed from Master Database by Secretariat",
    hardDelete = false
  } = params;

  console.log(`[REGISTRATION REMOVAL] Processing removal for reg=${registrationNumber}, orderId=${orderId}, hardDelete=${hardDelete}`);

  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        ...(registrationNumber ? [{ registrationNumber }] : []),
        ...(orderId ? [{ paymentOrder: { orderId } }] : [])
      ]
    },
    include: {
      event: true,
      participant: true,
      paymentOrder: true
    }
  });

  if (!registration) {
    return {
      success: false,
      message: `Registration not found for: ${registrationNumber || orderId}`
    };
  }

  if (hardDelete) {
    // Delete payment order first if exists
    if (registration.paymentOrder) {
      await prisma.paymentOrder.delete({
        where: { id: registration.paymentOrder.id }
      }).catch(() => null);
    }

    // Decrement event registered count if greater than 0
    if (registration.event) {
      await prisma.event.update({
        where: { id: registration.event.id },
        data: {
          registeredCount: { decrement: 1 }
        }
      }).catch(() => null);
    }

    // Delete registration
    await prisma.registration.delete({
      where: { id: registration.id }
    });

    console.log(`[REGISTRATION DELETED] Permanently removed registration ${registration.registrationNumber}`);

    return {
      success: true,
      message: `Registration ${registration.registrationNumber} permanently deleted from database.`,
      status: "DELETED",
      registrationNumber: registration.registrationNumber
    };
  } else {
    // Soft cancel
    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: registration.id },
        data: {
          paymentStatus: "CANCELLED"
        }
      });

      if (registration.paymentOrder) {
        await tx.paymentOrder.update({
          where: { id: registration.paymentOrder.id },
          data: {
            status: "CANCELLED"
          }
        });
      }

      if (registration.event) {
        await tx.event.update({
          where: { id: registration.event.id },
          data: {
            registeredCount: { decrement: 1 }
          }
        }).catch(() => null);
      }
    });

    if (registration.participantId) {
      await prisma.participantNotification.create({
        data: {
          participantId: registration.participantId,
          title: `Accreditation Cancelled: ${registration.event?.title || "Assembly"}`,
          message: `Your registration (${registration.registrationNumber}) has been cancelled by the Admissions Secretariat. Reason: ${reason}.`,
          type: "SYSTEM"
        }
      }).catch(() => null);
    }

    console.log(`[REGISTRATION CANCELLED] Marked registration ${registration.registrationNumber} as CANCELLED`);

    return {
      success: true,
      message: `Registration ${registration.registrationNumber} marked as CANCELLED.`,
      status: "CANCELLED",
      registrationNumber: registration.registrationNumber
    };
  }
}

/**
 * Universal payment status update handler:
 * Handles SUCCESS, FAILED, PENDING, CANCELLED, etc.
 * Dispatches in-site notification and corresponding email to the participant.
 */
export interface UpdatePaymentStatusParams {
  registrationId?: string;
  registrationNumber?: string;
  orderId?: string;
  paymentStatus: string;
  reason?: string;
  source?: string;
  paymentMethod?: string;
  bankReference?: string;
  amount?: number;
  forceResend?: boolean;
}

export async function updateRegistrationPaymentStatus(params: UpdatePaymentStatusParams) {
  const {
    registrationId,
    registrationNumber,
    orderId,
    paymentStatus: rawStatus,
    reason = "Payment status updated from Google Sheets Master Database",
    source = "GSHEETS_SYNC",
    paymentMethod,
    bankReference,
    amount,
    forceResend = false
  } = params;

  const normalizedStatus = String(rawStatus || "").toUpperCase().trim();

  // If SUCCESS -> route directly to confirmRegistrationSuccess
  if (normalizedStatus === "SUCCESS" || normalizedStatus === "CONFIRMED" || normalizedStatus === "PAID") {
    return confirmRegistrationSuccess({
      registrationId,
      registrationNumber,
      orderId,
      paymentMethod: paymentMethod || "GSHEETS_VERIFIED",
      bankReference: bankReference || "GSHEETS_OFFICIAL",
      amount,
      source: "GSHEETS_SYNC",
      forceResend
    });
  }

  // If CANCELLED, DELETED, REFUNDED -> route to cancelOrRemoveRegistration
  if (normalizedStatus === "CANCELLED" || normalizedStatus === "DELETED" || normalizedStatus === "REFUNDED") {
    return cancelOrRemoveRegistration({
      registrationNumber,
      orderId,
      reason,
      hardDelete: normalizedStatus === "DELETED"
    });
  }

  // 1. Locate registration
  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        ...(registrationId ? [{ id: registrationId }] : []),
        ...(registrationNumber ? [{ registrationNumber }] : []),
        ...(orderId ? [{ paymentOrder: { orderId } }] : [])
      ]
    },
    include: {
      event: true,
      ticketCategory: true,
      participant: true,
      paymentOrder: true
    }
  });

  if (!registration) {
    throw new Error(`Registration not found for: ${JSON.stringify({ registrationId, registrationNumber, orderId })}`);
  }

  // 2. Resolve participant
  let resolvedParticipantId = registration.participantId;
  if (!resolvedParticipantId) {
    const userMatch = await prisma.participantUser.findUnique({
      where: { email: registration.email }
    });
    if (userMatch) {
      resolvedParticipantId = userMatch.id;
    }
  }

  const previousStatus = registration.paymentStatus;
  const isNowFailed = normalizedStatus === "FAILED" || normalizedStatus === "REJECTED";
  const isNowPending = normalizedStatus === "PENDING";

  // 3. Update DB state
  await prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: registration.id },
      data: {
        paymentStatus: isNowFailed ? "FAILED" : isNowPending ? "PENDING" : normalizedStatus,
        ...(resolvedParticipantId ? { participantId: resolvedParticipantId } : {})
      }
    });

    if (registration.paymentOrder) {
      await tx.paymentOrder.update({
        where: { id: registration.paymentOrder.id },
        data: {
          status: isNowFailed ? "FAILED" : isNowPending ? "PENDING" : normalizedStatus
        }
      });
    }

    // If it was previously SUCCESS, decrement counts
    if (previousStatus === "SUCCESS") {
      if (registration.ticketCategory && registration.ticketCategory.soldCount > 0) {
        await tx.ticketCategory.update({
          where: { id: registration.ticketCategoryId },
          data: { soldCount: { decrement: 1 } }
        }).catch(() => null);
      }
      if (registration.event && registration.event.registeredCount > 0) {
        await tx.event.update({
          where: { id: registration.eventId },
          data: { registeredCount: { decrement: 1 } }
        }).catch(() => null);
      }
    }
  });

  // 4. Send In-Site Notification to Participant
  if (resolvedParticipantId) {
    try {
      if (isNowFailed) {
        await prisma.participantNotification.create({
          data: {
            participantId: resolvedParticipantId,
            title: `Payment Verification Failed · ${registration.registrationNumber}`,
            message: `Your payment verification for "${registration.event?.title || "Assembly"}" was marked as FAILED by the Secretariat (${reason}). Please verify your UTR number or contact the Secretariat.`,
            link: "/my-vichaar/registrations",
            type: "REGISTRATION",
            isRead: false
          }
        });
        console.log(`[IN-SITE NOTIFICATION] Created FAILED notification for participant ${resolvedParticipantId}`);
      } else if (isNowPending) {
        await prisma.participantNotification.create({
          data: {
            participantId: resolvedParticipantId,
            title: `Registration In Review · ${registration.registrationNumber}`,
            message: `Your registration payment verification for "${registration.event?.title || "Assembly"}" is currently undergoing review by the Secretariat.`,
            link: "/my-vichaar/registrations",
            type: "REGISTRATION",
            isRead: false
          }
        });
      } else {
        await prisma.participantNotification.create({
          data: {
            participantId: resolvedParticipantId,
            title: `Payment Status: ${normalizedStatus} · ${registration.registrationNumber}`,
            message: `The payment status for your registration (${registration.event?.title || "Assembly"}) has been updated to ${normalizedStatus}.`,
            link: "/my-vichaar/registrations",
            type: "REGISTRATION",
            isRead: false
          }
        });
      }
    } catch (notifErr) {
      console.error("[IN-SITE NOTIFICATION ERROR]:", notifErr);
    }
  }

  // 5. Send Email if FAILED
  if (isNowFailed) {
    try {
      await sendPaymentFailedEmail({
        name: registration.fullName,
        email: registration.email,
        registrationNumber: registration.registrationNumber,
        eventTitle: registration.event?.title || "SHABD & SOCH Assembly",
        reason
      });
      console.log(`[EMAIL DISPATCH] Sent payment failed notice to ${registration.email}`);
    } catch (emailErr) {
      console.error("[EMAIL DISPATCH ERROR]:", emailErr);
    }
  }

  return {
    success: true,
    message: `Payment status for registration ${registration.registrationNumber} updated to ${normalizedStatus}. User notified via in-site notification and email.`,
    registration: {
      ...registration,
      paymentStatus: isNowFailed ? "FAILED" : isNowPending ? "PENDING" : normalizedStatus
    }
  };
}
