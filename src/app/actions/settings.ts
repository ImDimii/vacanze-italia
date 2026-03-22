'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import BookingRequestEmail from '@/components/emails/BookingRequestEmail';
import ReceiptUploadedEmail from '@/components/emails/ReceiptUploadedEmail';
import BookingStatusEmail from '@/components/emails/BookingStatusEmail';
import PropertyStatusEmail from '@/components/emails/PropertyStatusEmail';
import ProfileUpdatedEmail from '@/components/emails/ProfileUpdatedEmail';
import SupportTicketEmail from '@/components/emails/SupportTicketEmail';

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching site settings:', error);
    return null;
  }

  // Se non esistono, creiamo i default
  if (!data) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: newData, error: insertError } = await supabaseAdmin
      .from('site_settings')
      .insert([{ id: 1 }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating default site settings:', insertError);
      return null;
    }
    return newData;
  }

  return data;
}

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non autorizzato');
  }

  // Verifica che sia admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Non hai i permessi per questa azione');
  }

  const site_name = formData.get('site_name') as string;
  const contact_email = formData.get('contact_email') as string;
  const contact_phone = formData.get('contact_phone') as string;

  const email_enabled = formData.get('email_enabled') === 'on';
  const email_provider = formData.get('email_provider') as string;
  const resend_api_key = formData.get('resend_api_key') as string;
  const smtp_host = formData.get('smtp_host') as string;
  const smtp_port = parseInt(formData.get('smtp_port') as string) || 587;
  const smtp_user = formData.get('smtp_user') as string;
  const smtp_password = formData.get('smtp_password') as string;
  const smtp_from_email = formData.get('smtp_from_email') as string;

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({
      id: 1,
      site_name: site_name || 'VacanzeItalia',
      contact_email: contact_email || '',
      contact_phone: contact_phone || '',
      email_enabled: email_enabled,
      email_provider: email_provider || 'resend',
      resend_api_key: resend_api_key || null,
      smtp_host: smtp_host || null,
      smtp_port: smtp_port,
      smtp_user: smtp_user || null,
      smtp_password: smtp_password || null,
      smtp_from_email: smtp_from_email || 'noreply@vacanzeitalia.it',
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Errore durante l\'aggiornamento delle impostazioni:', error);
    throw new Error('Errore durante l\'aggiornamento delle impostazioni del sito');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}

export async function sendTestEmails(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non autorizzato');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Non autorizzato');

  const testEmail = formData.get('test_email') as string;
  if (!testEmail) throw new Error('Email mancante');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
  
  await sendEmail({
    to: testEmail,
    subject: '[TEST] Nuova Richiesta (Host)',
    react: BookingRequestEmail({
      guestName: 'Mario Rossi',
      hostName: 'Test Admin',
      propertyName: 'Villa Esempio',
      checkIn: '10/08/2026',
      checkOut: '24/08/2026',
      totalPrice: '€ 1.200,00',
      isToHost: true,
      bookingUrl: baseUrl
    })
  });

  await sendEmail({
    to: testEmail,
    subject: '[TEST] Ricevuta Caricata (Host)',
    react: ReceiptUploadedEmail({
      guestName: 'Mario Rossi',
      hostName: 'Test Admin',
      propertyName: 'Villa Esempio',
      bookingUrl: baseUrl
    })
  });

  await sendEmail({
    to: testEmail,
    subject: '[TEST] Prenotazione Confermata (Ospite)',
    react: BookingStatusEmail({
      guestName: 'Mario Rossi',
      propertyName: 'Villa Esempio',
      status: 'confirmed',
      bookingUrl: baseUrl
    })
  });

  await sendEmail({
    to: testEmail,
    subject: '[TEST] Struttura Approvata (Host)',
    react: PropertyStatusEmail({
      hostName: 'Test Host',
      propertyName: 'Villa Esempio',
      status: 'published',
      dashboardUrl: baseUrl
    })
  });

  await sendEmail({
    to: testEmail,
    subject: '[TEST] Nuovo Ticket (Admin/User)',
    react: SupportTicketEmail({
      userName: 'Mario Rossi',
      ticketSubject: 'Assistenza Esempio',
      isAdminAlert: false
    })
  });

  await sendEmail({
    to: testEmail,
    subject: '[TEST] Profilo Aggiornato',
    react: ProfileUpdatedEmail({
      userName: 'Mario Rossi',
      updateTime: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
      accountUrl: baseUrl
    })
  });
}
