'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorizzato' };
  }

  const booking_id = formData.get('booking_id') as string;
  const property_id = formData.get('property_id') as string;
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment') as string;

  if (!booking_id || !property_id || !rating) {
    return { success: false, error: 'Dati mancanti' };
  }

  try {
    // 1. Verifica che la prenotazione appartenga all'utente
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, guest_id')
      .eq('id', booking_id)
      .single();

    if (bookingErr || booking?.guest_id !== user.id) {
      return { success: false, error: 'Prenotazione non valida' };
    }

    // 2. Inserisci recensione
    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        booking_id,
        property_id,
        reviewer_id: user.id,
        rating,
        comment,
        is_visible: true
      });

    if (insertError) {
      throw insertError;
    }

    // Il trigger del DB "update_property_rating" aggiornerà in colpo solo rating_avg e review_count in "properties".
    revalidatePath(`/property/${property_id}`, 'page');
    revalidatePath('/dashboard/bookings/[id]', 'page');
    revalidatePath('/', 'page');

    return { success: true };
  } catch (err: any) {
    console.error('Review insert error:', err);
    // Errore UNIQUE indica che esiste già una recensione per questo booking_id
    if (err.code === '23505') {
       return { success: false, error: 'Hai già lasciato una recensione per questo soggiorno.' };
    }
    return { success: false, error: 'Errore durante il salvataggio della recensione.' };
  }
}
