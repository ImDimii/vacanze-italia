'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createInternalNotification } from '@/lib/notifications';

export async function getMessages(bookingId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(id, full_name, avatar_url)')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data;
}

export async function sendMessage(bookingId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorizzato' };
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: content.trim()
    });

  if (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }

  // Create notification for the other party
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('guest_id, host_id, property:properties(title)')
      .eq('id', bookingId)
      .single();

    if (booking) {
      const recipientId = user.id === booking.guest_id ? booking.host_id : booking.guest_id;
      const senderType = user.id === booking.guest_id ? 'L\'ospite' : 'L\'host';
      
      // Handle the case where property might be returned as an array or object
      const prop = Array.isArray(booking.property) ? booking.property[0] : booking.property;
      const propertyTitle = prop?.title || 'una struttura';

      await createInternalNotification(
        recipientId,
        'new_message',
        `Nuovo messaggio per ${propertyTitle}`,
        `${senderType} ti ha inviato un messaggio: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        `/dashboard/bookings/${bookingId}`
      );
    }
  } catch (notifyError) {
    console.error('Notification error in sendMessage:', notifyError);
  }

  return { success: true };
}

export async function markAsRead(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('booking_id', bookingId)
    .neq('sender_id', user.id)
    .eq('is_read', false);
}
