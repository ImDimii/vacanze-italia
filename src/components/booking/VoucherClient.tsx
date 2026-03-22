'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

export const DownloadVoucherButton = dynamic(
  () => import('./DownloadVoucherButton').then(mod => mod.DownloadVoucherButton),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-12 bg-bg-primary border border-border rounded-xl flex items-center justify-center animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-accent-gold/50" />
      </div>
    )
  }
);
