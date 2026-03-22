'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import BookingStatusEmail from '@/components/emails/BookingStatusEmail';

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

  // Trigger Cancel Email if the status actually changed to cancelled
  if (newStatus === 'cancelled') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
    const { data: guest } = await supabase.from('profiles').select('full_name, email').eq('id', booking.guest_id).single();
    const { data: property } = await supabase.from('properties').select('title').eq('id', booking.property_id).single();
    
    if (guest?.email) {
      await sendEmail({
        to: guest.email,
        subject: `Prenotazione Annullata - ${property?.title || 'la proprietà'}`,
        react: BookingStatusEmail({
          guestName: guest?.full_name || 'Ospite',
          propertyName: property?.title || 'la proprietà',
          status: 'cancelled',
          bookingUrl: `${baseUrl}/dashboard/bookings/${bookingId}`
        })
      });
    }
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

  // Trigger Cancel Email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
  const { data: guest } = await supabase.from('profiles').select('full_name, email').eq('id', booking.guest_id).single();
  const { data: property } = await supabase.from('properties').select('title').eq('id', booking.property_id).single();

  if (guest?.email) {
    await sendEmail({
      to: guest.email,
      subject: `Prenotazione Annullata dal Proprietario - ${property?.title || 'la proprietà'}`,
      react: BookingStatusEmail({
        guestName: guest?.full_name || 'Ospite',
        propertyName: property?.title || 'la proprietà',
        status: 'cancelled',
        bookingUrl: `${baseUrl}/dashboard/bookings/${bookingId}`
      })
    });
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/bookings/${bookingId}`);

  return { success: true };
}
