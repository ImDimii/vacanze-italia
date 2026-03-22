'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import PropertyStatusEmail from '@/components/emails/PropertyStatusEmail';

/**
 * Helper to verify if the current user is an administrator
 */
async function verifyAdmin(): Promise<{ isAdmin: true, userId: string } | { isAdmin: false, error: string }> {
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

  return { isAdmin: true, userId: currentUser.id };
}

/**
 * Creates a Supabase client with Service Role to bypass RLS for admin actions
 */
async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '', // Using service role key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// --- USER MANAGEMENT ---

export async function toggleAdminRole(userId: string, currentRole: string) {
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabaseAdmin = await createAdminClient();

  const newRole = currentRole === 'admin' ? 'user' : 'admin';

  try {
    const { error } = await supabaseAdmin
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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabaseAdmin = await createAdminClient();

  try {
    // 1. Manually cleanup data that doesn't have ON DELETE CASCADE
    // Delete reviews by this user
    await supabaseAdmin.from('reviews').delete().eq('reviewer_id', userId);
    
    // Delete messages by this user
    await supabaseAdmin.from('messages').delete().eq('sender_id', userId);

    // Delete bookings where this user is the host
    // (Bookings where they are the guest will cascade via guest_id)
    await supabaseAdmin.from('bookings').delete().eq('host_id', userId);

    // 2. Delete from auth.users (this will cascade to profiles and related properties)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    // 3. Ensuring profile is also gone (redundant but safe)
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error in deleteUser:', err);
    return { success: false, error: `Errore database: ${err.message || 'impossibile eliminare l\'utente per vincoli di integrità.'}` };
  }
}

// --- PROPERTY MANAGEMENT ---

export async function togglePropertyPublish(propertyId: string, currentStatus: boolean) {
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabase = await createClient();

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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabase = await createClient();

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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabaseAdmin = await createAdminClient();

  try {
    const { error, count } = await supabaseAdmin
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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabase = await createClient();

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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabaseAdmin = await createAdminClient();

  try {
    const { error, count } = await supabaseAdmin
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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabase = await createClient();

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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabaseAdmin = await createAdminClient();

  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ host_status: 'approved' })
      .eq('id', userId);

    if (error) throw error;

    // Send email to host
    const { data: hostProfile } = await supabaseAdmin.from('profiles').select('full_name, email').eq('id', userId).single();
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
  const authCheck = await verifyAdmin();
  if (!authCheck.isAdmin) return { success: false, error: authCheck.error };
  const supabaseAdmin = await createAdminClient();

  try {
    const { error } = await supabaseAdmin
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
