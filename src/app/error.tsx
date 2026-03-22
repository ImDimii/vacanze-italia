'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-bg-primary">
      <div className="w-24 h-24 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
        <AlertOctagon className="w-12 h-12" />
      </div>
      <h2 className="font-heading text-3xl font-bold text-white mb-4">Qualcosa è andato storto!</h2>
      <p className="text-text-secondary max-w-md mb-8">
        Ci scusiamo, si è verificato un errore imprevisto durante il caricamento di questa pagina.
      </p>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-accent-gold text-black hover:bg-[#d4b568]"
        >
          Riprova
        </Button>
        <Link href="/">
          <Button variant="outline" className="border-border text-white hover:bg-white/5">
            Torna alla Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
