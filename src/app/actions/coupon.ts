'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function validateCoupon(code: string, propertyId: string) {
  const supabase = await createClient();
  
  // 1. Get the property to know its host_id
  const { data: property } = await supabase
    .from('properties')
    .select('host_id')
    .eq('id', propertyId)
    .single();

  if (!property) return { success: false, error: 'Proprietà non trovata' };

  // 2. Get the coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .eq('host_id', property.host_id) // Match the host!
    .single();

  if (error || !coupon) {
    return { success: false, error: 'Codice sconto non valido per questo alloggio' };
  }

  // Check expiration
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { success: false, error: 'Codice sconto scaduto' };
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { success: false, error: 'Limite utilizzi raggiunto' };
  }

  return { 
    success: true, 
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    }
  };
}

// Host management actions
export async function createCoupon(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autorizzato' };

  const { error } = await supabase
    .from('coupons')
    .insert({
      ...formData,
      host_id: user.id
    });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/host/coupons');
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/host/coupons');
  return { success: true };
}
