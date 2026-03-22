'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/'); // Refresh navbar dot
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

// Utility to create internal notifications (called from other server actions)
export async function createInternalNotification(
  userId: string, 
  type: 'new_message' | 'booking_update' | 'system', 
  title: string, 
  content: string, 
  link?: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      content,
      link
    });

  if (error) {
    console.error('Error creating internal notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
