'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Devi essere loggato per salvare i preferiti' };
  }

  try {
    // Controlla se esiste già
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single();

    if (existing) {
      // Rimuovi
      await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);
    } else {
      // Aggiungi
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        });
    }

    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/dashboard/favorites');
    revalidatePath(`/property/${propertyId}`);
    
    return { success: true, isFavorite: !existing };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
