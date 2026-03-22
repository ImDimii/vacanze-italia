import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import BookingStatusEmail from '@/components/emails/BookingStatusEmail';

/**
 * internal library for triggers - NOT a Server Action file
 * This avoids bundling issues when Server Actions are imported in Client Components
 */

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

export async function sendBookingStatusEmail(
  to: string,
  guestName: string,
  propertyName: string,
  status: 'confirmed' | 'cancelled',
  bookingUrl: string
) {
  try {
    await sendEmail({
      to,
      subject: status === 'confirmed' ? `Prenotazione Confermata - ${propertyName}` : `Prenotazione Annullata - ${propertyName}`,
      react: BookingStatusEmail({
        guestName,
        propertyName,
        status,
        bookingUrl
      })
    });
    return { success: true };
  } catch (err) {
    console.error('Email sending error:', err);
    return { success: false };
  }
}
