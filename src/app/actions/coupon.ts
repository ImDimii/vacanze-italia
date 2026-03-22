'use server';

import { createClient } from '@/lib/supabase/server';

export async function validateCoupon(code: string) {
  const supabase = await createClient();
  
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .single();

  if (error || !coupon) {
    return { success: false, error: 'Codice sconto non valido o scaduto' };
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
