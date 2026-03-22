'use client';

import { CouponForm } from './CouponForm';

export function HostCouponSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-border p-6 rounded-2xl space-y-4 shadow-lg shadow-black/20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Guida Coupon</h3>
        <ul className="space-y-3">
          <li className="flex gap-3 text-xs text-text-secondary leading-relaxed">
            <div className="w-1 h-1 bg-accent-gold rounded-full mt-1.5 shrink-0" />
            <span>I coupon creati qui valgono per <strong>tutti</strong> i tuoi annunci.</span>
          </li>
          <li className="flex gap-3 text-xs text-text-secondary leading-relaxed">
            <div className="w-1 h-1 bg-accent-gold rounded-full mt-1.5 shrink-0" />
            <span>Puoi creare sconti in percentuale (es. 10%) o fissi (es. 20€).</span>
          </li>
          <li className="flex gap-3 text-xs text-text-secondary leading-relaxed">
            <div className="w-1 h-1 bg-accent-gold rounded-full mt-1.5 shrink-0" />
            <span>Imposta un limite di utilizzi per proteggere il tuo guadagno.</span>
          </li>
        </ul>
      </div>
      
      <div className="space-y-4">
         <CouponForm onCancel={() => {}} />
      </div>
    </div>
  );
}
