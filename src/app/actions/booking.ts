'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createInternalNotification, sendBookingStatusEmail } from '@/lib/notifications';

export async function cancelBooking(bookingId: string, refundInfo?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorizzato' };
  }

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('host_id, guest_id, status, property_id')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: 'Prenotazione non trovata' };
  }

  const isHost = booking.host_id === user.id;
  const isGuest = booking.guest_id === user.id;

  if (!isHost && !isGuest) {
    return { success: false, error: 'Non hai i permessi per cancellare questa prenotazione' };
  }

  if (['cancelled', 'completed', 'refunded'].includes(booking.status)) {
    return { success: false, error: 'La prenotazione non può essere cancellata nel suo stato attuale' };
  }

  // Se è l'ospite e ha già pagato (o caricato ricevuta), serve approvazione host
  const requiresApproval = isGuest && ['confirmed', 'receipt_uploaded'].includes(booking.status);
  const newStatus = requiresApproval ? 'cancellation_requested' : 'cancelled';

  const updateData: any = { status: newStatus };
  if (refundInfo) {
    updateData.receipt_rejection_reason = `[REFUND] ${refundInfo}`;
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId);

  if (updateError) {
    console.error('Update error in cancelBooking:', updateError);
    return { success: false, error: updateError.message || 'Impossibile completare l\'operazione. Riprova più tardi.' };
  }

  // Handle Email and Notifications
  const { data: property } = await supabase.from('properties').select('title').eq('id', booking.property_id).single();
  const { data: guest } = await supabase.from('profiles').select('full_name, email').eq('id', booking.guest_id).single();

  if (newStatus === 'cancelled' && guest?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
    await sendBookingStatusEmail(
      guest.email,
      guest.full_name || 'Ospite',
      property?.title || 'la struttura',
      'cancelled',
      `${baseUrl}/dashboard/bookings/${bookingId}`
    );
  }

  // Create Notification
  try {
    const recipientId = isGuest ? booking.host_id : booking.guest_id;
    const notifyTitle = newStatus === 'cancelled' ? 'Prenotazione Annullata' : 'Richiesta Annullamento';
    const notifyContent = newStatus === 'cancelled' 
      ? `${isGuest ? "L'ospite" : "L'host"} ha annullato la prenotazione per ${property?.title || 'la struttura'}.`
      : `L'ospite ha richiesto di annullare la prenotazione per ${property?.title || 'la struttura'}.`;

    await createInternalNotification(
      recipientId,
      'booking_update',
      notifyTitle,
      notifyContent,
      `/dashboard/bookings/${bookingId}`
    );
  } catch (notifyError) {
    console.error('Notification error in cancelBooking:', notifyError);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/bookings/${bookingId}`);

  return { success: true, requested: requiresApproval };
}

export async function approveCancellation(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorizzato' };
  }

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('host_id, status, property_id, guest_id')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: 'Prenotazione non trovata' };
  }

  if (booking.host_id !== user.id) {
    return { success: false, error: 'Solo l\'host può approvare questa richiesta' };
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, error: 'Impossibile approvare l\'annullamento.' };
  }

  // Handle Email and Notifications
  const { data: property } = await supabase.from('properties').select('title').eq('id', booking.property_id).single();
  const { data: guest } = await supabase.from('profiles').select('full_name, email').eq('id', booking.guest_id).single();

  if (guest?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
    await sendBookingStatusEmail(
      guest.email,
      guest.full_name || 'Ospite',
      property?.title || 'la struttura',
      'cancelled',
      `${baseUrl}/dashboard/bookings/${bookingId}`
    );
  }

  // Create Notification for guest
  try {
    await createInternalNotification(
      booking.guest_id,
      'booking_update',
      'Richiesta Annullamento Approvata',
      `La tua richiesta di annullamento per ${property?.title || 'la struttura'} è stata accettata dall'host.`,
      `/dashboard/bookings/${bookingId}`
    );
  } catch (notifyError) {
    console.error('Notification error in approveCancellation:', notifyError);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/bookings/${bookingId}`);

  return { success: true };
}
