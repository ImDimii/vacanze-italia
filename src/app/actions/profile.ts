'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import ProfileUpdatedEmail from '@/components/emails/ProfileUpdatedEmail';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorizzato' };
  }

  try {
    const avatarFile = formData.get('avatar_file') as File | null;

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that are explicitly provided in this specific form submission
    if (formData.has('full_name')) updateData.full_name = formData.get('full_name');
    if (formData.has('phone')) updateData.phone = formData.get('phone');
    if (formData.has('bio')) updateData.bio = formData.get('bio');
    if (formData.has('iban')) updateData.iban = formData.get('iban');
    if (formData.has('bank_name')) updateData.bank_name = formData.get('bank_name');
    if (formData.has('bank_holder')) updateData.bank_holder = formData.get('bank_holder');

    // Upload Avatar se presente
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        throw new Error(`Errore caricamento avatar: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      updateData.avatar_url = publicUrlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Invia alert di sicurezza via Email (usiamo la prima email che abbiamo poichè Auth user ha l'email garantita)
    if (user.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
      await sendEmail({
        to: user.email,
        subject: 'Avviso di sicurezza: il tuo profilo è stato aggiornato',
        react: ProfileUpdatedEmail({
          userName: updateData.full_name || 'Utente',
          updateTime: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
          accountUrl: `${baseUrl}/dashboard/profile`
        })
      });
    }

    revalidatePath('/dashboard/profile', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message || 'Errore durante il salvataggio' };
  }
}

export async function requestHostStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non autorizzato' };

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ host_status: 'pending' })
      .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
