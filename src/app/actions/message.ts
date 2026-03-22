'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
