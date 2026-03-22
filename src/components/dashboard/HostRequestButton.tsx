'use client';

import { useState } from 'react';
import { requestHostStatus } from '@/app/actions/profile';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HostRequestButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequest = async () => {
    setLoading(true);
    const res = await requestHostStatus();
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Errore durante la richiesta');
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleRequest} 
      disabled={loading}
      className="group relative px-10 py-5 w-full md:w-auto text-lg font-black rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95 outline-none"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-accent-gold via-[#e3c78a] to-accent-gold opacity-100 group-hover:opacity-90 blur" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-gold via-[#e3c78a] to-accent-gold" />
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
      <span className="relative z-10 flex items-center justify-center gap-3 text-black">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-6 h-6" />
            <span className="tracking-tight">Richiedi Badge Host</span>
            <Sparkles className="w-5 h-5 text-black/50 group-hover:text-black/80 transition-colors" />
          </>
        )}
      </span>
    </button>
  );
}
