'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCoupon } from '@/app/actions/coupon';
import { Loader2, Ticket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CouponForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    usage_limit: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started', formData);
    
    // Basic validation
    const val = parseFloat(formData.discount_value);
    if (isNaN(val) || val <= 0) {
      alert('Inserisci un valore di sconto valido superiore a 0');
      return;
    }

    setLoading(true);
    try {
      const res = await createCoupon({
        discount_type: formData.discount_type,
        discount_value: val,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        code: formData.code.toUpperCase().trim()
      });
      
      console.log('Server response:', res);
      
      if (res.success) {
        setFormData({
          code: '',
          discount_type: 'percentage',
          discount_value: '',
          usage_limit: '',
        });
        router.refresh(); 
        alert('Coupon creato con successo!');
        if (onCancel) onCancel();
      } else {
        alert(res.error || 'Errore nella creazione del coupon');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      alert('Errore imprevisto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-border p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-accent-gold flex items-center gap-2">
          <Ticket className="w-4 h-4" /> Nuovo Coupon
        </h3>
        <button type="button" onClick={onCancel} className="text-text-secondary hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Codice</label>
          <input 
            required
            type="text" 
            placeholder="E.G. ESTATE2026"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
            className="w-full h-12 px-4 bg-bg-primary border border-border rounded-xl text-sm font-bold placeholder:text-text-secondary/30 focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Tipo Sconto</label>
          <select 
            value={formData.discount_type}
            onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
            className="w-full h-12 px-4 bg-bg-primary border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
          >
            <option value="percentage">Percentuale (%)</option>
            <option value="fixed">Fisso (€)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Valore</label>
          <input 
            required
            type="number" 
            placeholder="Es: 10"
            value={formData.discount_value}
            onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
            className="w-full h-12 px-4 bg-bg-primary border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Limite Utilizzi (Opzionale)</label>
          <input 
            type="number" 
            placeholder="Es: 100"
            value={formData.usage_limit}
            onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
            className="w-full h-12 px-4 bg-bg-primary border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
          />
        </div>
      </div>

      <Button 
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-accent-gold text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white transition-all shadow-lg shadow-accent-gold/10"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Crea Coupon'}
      </Button>
    </form>
  );
}
