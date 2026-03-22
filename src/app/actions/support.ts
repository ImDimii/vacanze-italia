'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import SupportTicketEmail from '@/components/emails/SupportTicketEmail';
import { getSiteSettings } from '@/app/actions/settings';

export async function submitSupportTicket(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  
  if (!name || !email || !message) {
    return { success: false, error: 'Tutti i campi obbligatori devono essere compilati' };
  }

  try {
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        name,
        email,
        subject: subject || 'Nessun oggetto',
        message,
        status: 'open',
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Invia email di conferma all'utente
    await sendEmail({
      to: email,
      subject: `Conferma ricezione ticket: ${subject || 'Supporto'}`,
      react: SupportTicketEmail({ userName: name, ticketSubject: subject || 'Supporto' })
    });

    // Invia email di allerta all'Admin
    const settings = await getSiteSettings();
    if (settings && settings.contact_email) {
      await sendEmail({
        to: settings.contact_email,
        subject: `[Nuovo Ticket] da ${name} - ${subject || 'Supporto'}`,
        react: SupportTicketEmail({ userName: name, ticketSubject: subject || 'Supporto', isAdminAlert: true })
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Support ticket error:', err);
    return { success: false, error: err.message || 'Errore durante l\'invio del messaggio' };
  }
}
