import { createClient } from '@/lib/supabase/server';
import { Ticket, Tag, Users } from 'lucide-react';
import { DeleteCouponButton } from '@/components/host/DeleteCouponButton';
import { HostCouponSidebar } from '@/components/host/HostCouponSidebar';

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coupons List */}
        <div className="lg:col-span-2 space-y-4">
          {!coupons || coupons.length === 0 ? (
            <div className="p-12 border border-dashed border-border rounded-3xl text-center bg-bg-surface/50 shadow-inner">
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-6 h-6 text-text-secondary" />
               </div>
               <h3 className="text-white font-bold mb-2">Nessun Coupon Attivo</h3>
               <p className="text-text-secondary text-sm mb-6 max-w-xs mx-auto leading-relaxed">Inizia creando un codice sconto per incentivare le prenotazioni sui tuoi alloggi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
               {coupons.map((coupon) => (
                  <div key={coupon.id} className="group relative bg-bg-surface border border-border p-6 rounded-2xl flex items-center justify-between hover:border-accent-gold/30 transition-all shadow-lg hover:shadow-accent-gold/5">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-accent-gold/10 rounded-xl flex items-center justify-center border border-accent-gold/20">
                           <Ticket className="w-6 h-6 text-accent-gold" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-lg font-bold text-white tracking-widest">{coupon.code}</h4>
                           <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                              <span className="text-success bg-success/5 px-2 py-0.5 rounded border border-success/10">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `€${coupon.discount_value}`} SCONTO
                              </span>
                              <span className="flex items-center gap-1 opacity-70">
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

        {/* Sidebar Creation (Client Component) */}
        <HostCouponSidebar />
      </div>
    </div>
  );
}
