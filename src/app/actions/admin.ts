'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import PropertyStatusEmail from '@/components/emails/PropertyStatusEmail';

/**
 * Helper to verify if the current user is an administrator
 */
async function verifyAdmin(): Promise<{ isAdmin: true, supabase: any } | { isAdmin: false, error: string }> {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (!currentUser) return { isAdmin: false, error: 'Sessione scaduta. Effettua nuovamente l\'accesso.' };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (error || profile?.role !== 'admin') {
    return { isAdmin: false, error: 'Non autorizzato: accesso riservato agli amministratori.' };
  }

  return { isAdmin: true, supabase };
}

// --- USER MANAGEMENT ---

export async function toggleAdminRole(userId: string, currentRole: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  const newRole = currentRole === 'admin' ? 'user' : 'admin';

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUser(userId: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error, count } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .eq('id', userId);

    if (error) throw error;
    if (count === 0) return { success: false, error: 'Nessun utente trovato.' };
    
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- PROPERTY MANAGEMENT ---

export async function togglePropertyPublish(propertyId: string, currentStatus: boolean) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error } = await supabase
      .from('properties')
      .update({ is_published: !currentStatus })
      .eq('id', propertyId);

    if (error) throw error;

    // Fetch details for email
    const { data: prop } = await supabase.from('properties').select('title, host_id').eq('id', propertyId).single();
    if (prop) {
      const { data: hostProfile } = await supabase.from('profiles').select('full_name, email').eq('id', prop.host_id).single();
      if (hostProfile?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
        await sendEmail({
          to: hostProfile.email,
          subject: !currentStatus ? 'La tua struttura è online!' : 'Struttura sospesa',
          react: PropertyStatusEmail({
            hostName: hostProfile.full_name || 'Host',
            propertyName: prop.title,
            status: !currentStatus ? 'published' : 'hidden',
            dashboardUrl: `${baseUrl}/dashboard/host`
          })
        });
      }
    }

    revalidatePath('/admin/properties');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function togglePropertyFeatured(propertyId: string, currentFeatured: boolean) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error } = await supabase
      .from('properties')
      .update({ is_featured: !currentFeatured })
      .eq('id', propertyId);

    if (error) throw error;

    revalidatePath('/admin/properties');
    revalidatePath('/'); // Revalidate homepage as featured properties might be displayed there
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProperty(propertyId: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error, count } = await supabase
      .from('properties')
      .delete({ count: 'exact' })
      .eq('id', propertyId);

    if (error) throw error;
    if (count === 0) return { success: false, error: 'Nessuna proprietà trovata.' };

    revalidatePath('/admin/properties');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- BOOKING MANAGEMENT ---

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) throw error;
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBooking(bookingId: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error, count } = await supabase
      .from('bookings')
      .delete({ count: 'exact' })
      .eq('id', bookingId);

    if (error) {
      // Possible foreign key constraint error
      if (error.code === '23503') {
        return { success: false, error: 'Impossibile eliminare: ci sono dati correlati (pagamenti o recensioni) collegati a questa prenotazione.' };
      }
      throw error;
    }

    if (count === 0) return { success: false, error: 'Nessuna prenotazione trovata da eliminare.' };

    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- TICKET MANAGEMENT ---

export async function updateTicketStatus(ticketId: string, newStatus: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) throw error;
    revalidatePath('/admin/tickets');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/** 
 * GESTIONE HOST 
 */

export async function approveHost(userId: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ host_status: 'approved' })
      .eq('id', userId);

    if (error) throw error;

    // Send email to host
    const { data: hostProfile } = await supabase.from('profiles').select('full_name, email').eq('id', userId).single();
    if (hostProfile?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
      await sendEmail({
        to: hostProfile.email,
        subject: 'Congratulazioni! Sei diventato Host',
        react: PropertyStatusEmail({
          hostName: hostProfile.full_name || 'Host',
          propertyName: 'Account Host',
          status: 'published',
          dashboardUrl: `${baseUrl}/dashboard/host`
        })
      });
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectHost(userId: string) {
  const result = await verifyAdmin();
  if (!result.isAdmin) return { success: false, error: result.error };
  const { supabase } = result;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ host_status: 'none' })
      .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
