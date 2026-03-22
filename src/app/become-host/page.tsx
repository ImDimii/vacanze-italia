'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, ShieldCheck, Zap, Coins, CheckCircle2, ArrowRight, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { requestBecomeHost } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { getSiteSettings } from '@/app/actions/settings';

export default function BecomeHostPage() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [siteName, setSiteName] = useState('Vacanze Italia');
  const router = useRouter();

  useEffect(() => {
    getSiteSettings().then(s => {
      if(s?.site_name) setSiteName(s.site_name);
    });
  }, []);

  const handleRequest = async () => {
    setIsPending(true);
    setMessage(null);
    try {
      const result = await requestBecomeHost();
      if (result.success) {
        setMessage({ text: 'Richiesta inviata con successo! Benvenuto in community.', type: 'success' });
        setTimeout(() => router.push('/dashboard/host/new'), 2000);
      } else {
        setMessage({ text: result.error || 'Errore durante l\'invio.', type: 'error' });
        if (result.error?.includes('loggato')) {
            setTimeout(() => router.push('/login?returnTo=/become-host'), 2000);
        }
      }
    } catch (error) {
      setMessage({ text: 'Errore durante l\'invio della richiesta.', type: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-gold/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-[0.2em]">
              Nuovo Standard di Hosting
            </span>
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Diventa un Host su <span className="text-accent-gold">{siteName}</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Pubblica la tua struttura gratuitamente, mantieni il controllo totale e ricevi il 50% della caparra subito tramite bonifico bancario diretto.
            </p>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-4 rounded-2xl mb-8 flex items-center gap-3 justify-center max-w-md mx-auto border",
                  message.type === 'success' 
                    ? "bg-success/10 border-success/30 text-success" 
                    : "bg-error/10 border-error/30 text-error"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                <p className="font-semibold text-sm">{message.text}</p>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleRequest}
                disabled={isPending}
                size="lg" 
                className="bg-accent-gold text-black hover:bg-[#d4b568] px-10 rounded-full font-bold h-14 text-lg shadow-2xl shadow-accent-gold/20 min-w-[240px]"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Richiedi di diventare Host'}
              </Button>
              <Link href="#info">
                <Button variant="ghost" className="text-white hover:bg-white/5 rounded-full px-8 h-14 font-semibold">
                  Scopri di più
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="info" className="py-24 bg-bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading">Perché scegliere noi?</h2>
            <div className="w-20 h-1 bg-accent-gold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Coins,
                title: "Zero Commissioni",
                text: "Non tratteniamo commissioni sulle tue prenotazioni online. Quello che guadagni è interamente tuo."
              },
              {
                icon: Zap,
                title: "Pagamenti Immediati",
                text: "Ricevi il 50% di caparra direttamente sul tuo conto corrente tramite bonifico bancario al momento della conferma."
              },
              {
                icon: ShieldCheck,
                title: "Sicurezza e Controllo",
                text: "Scegli tu chi ospitare, imposta le tue regole della casa e gestisci le disponibilità in tempo reale."
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-bg-surface border border-white/5 hover:border-accent-gold/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-accent-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-text-secondary leading-relaxed">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 font-heading">Inizia a guadagnare in <span className="text-accent-gold">3 semplici passi</span></h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Richiedi lo Status", text: "Invia la tua richiesta cliccando sul bottone in questa pagina. Verremo notificati subito." },
                  { step: "02", title: "Pubblica l'Annuncio", text: "Carica foto, descrizioni e imposta i prezzi per la tua struttura." },
                  { step: "03", title: "Accogli i tuoi Ospiti", text: "Ricevi notifiche per le nuove prenotazioni e inizia a ospitare viaggiatori." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-4xl font-heading font-black text-white/10">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-text-secondary leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-accent-gold/5 group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full relative"
                  >
                    <Image 
                      src="/hosting_hero.png"
                      alt="Premium Italian Home"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-60" />
                  </motion.div>
                  
                  {/* Floating badge for extra premium feel */}
                  <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 z-20">
                    <p className="text-white font-bold text-lg mb-1">Qualità Garantita</p>
                    <p className="text-text-secondary text-xs leading-relaxed uppercase tracking-widest font-bold">Standard di Eccellenza {siteName}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials or Info Card */}
      <section className="py-24 bg-bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-12 rounded-[40px] bg-gradient-to-br from-accent-gold/20 to-bg-surface border border-accent-gold/30 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
             <Info className="w-12 h-12 text-accent-gold mx-auto mb-6" />
             <h3 className="text-3xl font-bold mb-6">Pronto per il salto di qualità?</h3>
             <p className="text-lg text-text-primary/80 mb-10 leading-relaxed">
               Oltre 1.000 host in tutta Italia hanno già scelto la nostra piattaforma per la trasparenza e la velocità dei pagamenti. Non aspettare che altri prendano il tuo posto.
             </p>
             {message && (
              <div className={cn(
                "p-4 rounded-xl mb-6 flex items-center gap-3 justify-center border",
                message.type === 'success' 
                  ? "bg-success/10 border-success/20 text-success" 
                  : "bg-error/10 border-error/20 text-error"
              )}>
                 <p className="font-bold text-sm tracking-wide">{message.text}</p>
              </div>
             )}
             
             <Button 
                onClick={handleRequest}
                disabled={isPending}
                size="lg" 
                className="bg-white text-black hover:bg-neutral-200 px-12 rounded-full font-bold h-16 text-xl shadow-2xl min-w-[300px]"
             >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sì, voglio diventare Host!'}
             </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
