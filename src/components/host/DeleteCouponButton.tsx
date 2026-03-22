'use client';

import { deleteCoupon } from '@/app/actions/coupon';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function DeleteCouponButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo coupon?')) return;
    setLoading(true);
    const res = await deleteCoupon(id);
    if (!res.success) {
      alert(res.error || 'Errore');
    }
    setLoading(false);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={loading}
      className="text-text-secondary hover:text-error hover:bg-error/10 transition-all rounded-lg"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}
