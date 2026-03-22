import { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSiteSettings } from '@/app/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || 'VacanzeItalia';
  return {
    title: `Chi Siamo | ${siteName}`,
    description: `Scopri chi siamo e perché ${siteName} è la scelta migliore per le tue vacanze.`,
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || 'VacanzeItalia';
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
          Chi Siamo
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          In {siteName} ci dedichiamo a offrirti l'esperienza più autentica e indimenticabile 
          nell'affitto di case vacanze in tutto il bel paese. Il nostro obiettivo è connettere viaggiatori e host con trasperenza e affidabilità.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fHZpbGxhfGVufDB8fHx8MTY5OTUxODYwOQ&ixlib=rb-4.0.3&q=80&w=1080" 
            alt="La nostra missione" 
            fill
            className="object-cover"
            priority /* Added priority since it's the main LCP element */
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-heading text-3xl font-bold text-white">La Nostra Missione</h2>
          <p className="text-text-secondary">
            Crediamo che il viaggio trasformativo inizi da dove scegliamo di posare le valigie. Lavoriamo
            instancabilmente per selezionare le migliori ville, appartamenti e dimore storiche in Italia.
          </p>
          <ul className="space-y-4 text-text-primary">
             <li className="flex items-start">
               <span className="text-accent-gold mr-3 mt-1">✓</span>
               <span>Selezione rigorosa delle migliori proprietà in tutta Italia.</span>
             </li>
             <li className="flex items-start">
               <span className="text-accent-gold mr-3 mt-1">✓</span>
               <span>Supporto diretto e contatti esclusivi con i proprietari.</span>
             </li>
             <li className="flex items-start">
               <span className="text-accent-gold mr-3 mt-1">✓</span>
               <span>Esperienza di prenotazione sicura, trasparente e senza commissioni nascoste.</span>
             </li>
          </ul>
        </div>
      </div>

      <div className="bg-bg-surface/50 border border-border p-8 md:p-12 rounded-3xl text-center">
        <h2 className="font-heading text-3xl font-bold text-white mb-6">Pronto per il tuo prossimo viaggio?</h2>
        <p className="text-text-secondary mb-8 max-w-xl mx-auto">
          Inizia oggi a esplorare le migliaia di proprietà presenti su {siteName}. La tua prossima avventura è a solo un click di distanza.
        </p>
        <Link href="/search">
          <Button className="bg-accent-gold text-black hover:bg-[#d4b568] px-8 py-6 text-lg font-bold">
            Esplora tutte le proprietà
          </Button>
        </Link>
      </div>
    </div>
  );
}
