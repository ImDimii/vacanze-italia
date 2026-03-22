import { createClient } from '@/lib/supabase/server';
import { Ticket, Plus, Tag, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CouponForm } from '@/components/host/CouponForm';
import { DeleteCouponButton } from '@/components/host/DeleteCouponButton';
import Link from 'next/link';

export default async function HostCouponsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .eq('host_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-gold">
            <Ticket className="w-5 h-5" />
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">I Miei Coupon</h1>
          </div>
          <p className="text-text-secondary text-sm font-medium">Gestisci i codici sconto per i tuoi alloggi</p>
        </div>
        
        {/* We use a search param or local state toggle if client, but here it's easier to just have a button that links to same page with ?new=true or handle via client component wrapper */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coupons List */}
        <div className="lg:col-span-2 space-y-4">
          {!coupons || coupons.length === 0 ? (
            <div className="p-12 border border-dashed border-border rounded-3xl text-center bg-bg-surface/50">
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-6 h-6 text-text-secondary" />
               </div>
               <h3 className="text-white font-bold mb-2">Nessun Coupon Attivo</h3>
               <p className="text-text-secondary text-sm mb-6 max-w-xs mx-auto">Inizia creando un codice sconto per incentivare le prenotazioni sui tuoi alloggi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
               {coupons.map((coupon) => (
                  <div key={coupon.id} className="group relative bg-bg-surface border border-border p-6 rounded-2xl flex items-center justify-between hover:border-accent-gold/30 transition-all shadow-lg hover:shadow-accent-gold/5">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-accent-gold/10 rounded-xl flex items-center justify-center">
                           <Ticket className="w-6 h-6 text-accent-gold" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-lg font-bold text-white tracking-widest">{coupon.code}</h4>
                           <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                              <span className="text-success">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`} SCONTO
                              </span>
                              <span className="flex items-center gap-1">
                                 <Users className="w-3 h-3" /> {coupon.used_count} / {coupon.usage_limit || '∞'} UTILIZZI
                              </span>
                           </div>
                        </div>
                     </div>
                     <DeleteCouponButton id={coupon.id} />
                  </div>
               ))}
            </div>
          )}
        </div>

        {/* Sidebar Creation (Dummy/Wrapper approach) */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Guida Coupon</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-text-secondary">
                <div className="w-1 h-1 bg-accent-gold rounded-full mt-1.5 shrink-0" />
                <span>I coupon creati qui valgono per <strong>tutti</strong> i tuoi annunci.</span>
              </li>
              <li className="flex gap-3 text-xs text-text-secondary">
                <div className="w-1 h-1 bg-accent-gold rounded-full mt-1.5 shrink-0" />
                <span>Puoi creare sconti in percentuale (es. 10%) o fissi (es. 20€).</span>
              </li>
              <li className="flex gap-3 text-xs text-text-secondary">
                <div className="w-1 h-1 bg-accent-gold rounded-full mt-1.5 shrink-0" />
                <span>Imposta un limite di utilizzi per proteggere il tuo guadagno.</span>
              </li>
            </ul>
          </div>
          
          {/* Form directly visible here or as Client Wrapper */}
          <CouponFormWrapper />
        </div>
      </div>
    </div>
  );
}

// Small client wrapper to handle the "Show Form" toggle if needed, or just show it
function CouponFormWrapper() {
  return (
    <div className="space-y-4">
       <CouponForm onCancel={() => {}} />
    </div>
  );
}
