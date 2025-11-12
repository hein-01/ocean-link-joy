import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SubmitBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

export type ConfirmBookingResult = { success: true } | { success: false; error: string };

function buildReceiptPath(slotId: string, userId: string, originalName: string): string {
  const sanitizedName = originalName
    ? originalName.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
    : "receipt";
  const randomToken =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${userId}/${slotId}/${Date.now()}-${randomToken}-${sanitizedName}`;
}

async function uploadReceipt(
  slotId: string,
  userId: string,
  receiptFile: File
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const storagePath = buildReceiptPath(slotId, userId, receiptFile.name);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(storagePath, receiptFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError || !uploadData?.path) {
    console.error("Receipt upload failed", uploadError);
    return { success: false, error: "Unable to upload receipt. Please try again." };
  }

  const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(uploadData.path);
  if (!publicUrlData?.publicUrl) {
    console.error("Failed to generate public URL for receipt", uploadData.path);
    return { success: false, error: "Unable to retrieve receipt link." };
  }

  return { success: true, url: publicUrlData.publicUrl };
}

export async function submitBooking(
  slotId: string,
  userId: string,
  amount: number,
  receiptFile: File
): Promise<SubmitBookingResult> {
  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .select("id, resource_id, slot_price, booking_id")
    .eq("id", slotId)
    .maybeSingle();

  if (slotError) {
    console.error("Failed to load slot for booking", slotError);
    return { success: false, error: "Unable to validate the selected slot." };
  }

  if (!slot) {
    return { success: false, error: "Selected slot could not be found." };
  }

  if (slot.booking_id) {
    return { success: false, error: "This slot has already been booked by another customer." };
  }

  if (Number(slot.slot_price) !== Number(amount)) {
    console.warn("Payment amount mismatch for slot", { slotId, amount, slotPrice: slot.slot_price });
    return { success: false, error: "Submitted amount does not match the slot price." };
  }

  const uploadResult = await uploadReceipt(slotId, userId, receiptFile);
  if (uploadResult.success === false) {
    return { success: false, error: uploadResult.error };
  }

  const { data: bookingData, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      slot_id: slot.id,
      resource_id: slot.resource_id,
      user_id: userId,
      payment_amount: slot.slot_price,
      receipt_url: uploadResult.url,
    })
    .select("id")
    .single();

  if (bookingError) {
    if (bookingError.code === "23505") {
      return {
        success: false,
        error: "This slot was already booked. Please choose another available slot.",
      };
    }

    console.error("Failed to create booking", bookingError);
    return { success: false, error: "Unable to submit booking. Please try again." };
  }

  return { success: true, bookingId: bookingData.id };
}

export async function confirmBooking(
  bookingId: string,
  staffUserId: string
): Promise<ConfirmBookingResult> {
  const { data: updatedBooking, error: bookingError } = await supabase
    .from("bookings")
    .update({ status: "Confirmed", confirmed_by_id: staffUserId })
    .eq("id", bookingId)
    .eq("status", "Pending")
    .select("id, slot_id")
    .single();

  if (bookingError) {
    console.error("Failed to confirm booking", bookingError);
    return { success: false, error: "Unable to confirm booking." };
  }

  if (!updatedBooking?.slot_id) {
    return { success: false, error: "Booking not found or already processed." };
  }

  const { data: updatedSlot, error: slotError } = await supabase
    .from("slots")
    .update({ is_booked: true, booking_id: bookingId })
    .eq("id", updatedBooking.slot_id)
    .select("id")
    .single();

  if (slotError || !updatedSlot) {
    console.error("Failed to update slot inventory for booking", bookingId, slotError);
    await supabase
      .from("bookings")
      .update({ status: "Pending", confirmed_by_id: null })
      .eq("id", bookingId);
    return {
      success: false,
      error: "Booking status updated but slot inventory failed. The booking was reverted to pending.",
    };
  }

  return { success: true };
}

export type BookingRecord = Tables<"bookings">;
