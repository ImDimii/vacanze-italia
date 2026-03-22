import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export function BecomeHostBanner() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-accent-gold/10 border border-accent-gold/20 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Sei un host? Pubblica la tua casa gratuitamente
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Unisciti alla nostra community. Guadagna di più con zero commissioni online 
            e ricevi il 50% subito tramite bonifico bancario diretto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/become-host">
              <Button size="lg" className="bg-accent-gold text-black hover:bg-[#d4b568] px-8 rounded-full h-12">
                <Home className="w-5 h-5 mr-2" />
                Inizia a ospitare
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
