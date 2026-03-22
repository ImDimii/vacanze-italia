import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, ShieldCheck, CreditCard, Home } from "lucide-react"
import Link from "next/link"

import { getSiteSettings } from '@/app/actions/settings';

export default async function FAQPage() {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || 'VacanzeItalia';
  const categories = [
    {
      title: "Prenotazioni",
      icon: <Home className="w-5 h-5 text-accent-gold" />,
      items: [
        {
          q: "Come posso prenotare una casa?",
          a: "Scegli la casa che preferisci, seleziona le date disponibili nel calendario e clicca su 'Richiedi Prenotazione'. Una volta che l'host avrà confermato la disponibilità, riceverai le istruzioni per il pagamento dell'acconto."
        },
        {
          q: "Posso cancellare una prenotazione?",
          a: "Sì, le politiche di cancellazione dipendono dal singolo host. Consigliamo di contattare direttamente l'host tramite la chat o il numero di telefono fornito dopo la richiesta per discutere le opzioni di rimborso."
        }
      ]
    },
    {
      title: "Pagamenti",
      icon: <CreditCard className="w-5 h-5 text-accent-gold" />,
      items: [
        {
          q: "Come funziona il pagamento?",
          a: `${siteName} utilizza un sistema di pagamento manuale sicuro. Pagherai una caparra (solitamente il 50%) tramite bonifico bancario direttamente all'host per bloccare le date. Il saldo verrà versato in contanti o secondo gli accordi al tuo arrivo in struttura.`
        },
        {
          q: "Perché devo caricare una ricevuta?",
          a: "Caricare la ricevuta del bonifico permette all'host di verificare il pagamento in modo rapido e sicuro, permettendogli di confermare la tua prenotazione nel sistema immediatamente."
        }
      ]
    },
    {
      title: "Sicurezza",
      icon: <ShieldCheck className="w-5 h-5 text-accent-gold" />,
      items: [
        {
          q: "Le case sono verificate?",
          a: `I nostri host sono professionisti o privati del settore. Monitoriamo costantemente le recensioni e i feedback degli utenti per garantire che ogni annuncio rispetti gli standard di qualità di ${siteName}.`
        },
        {
          q: "I miei dati sono al sicuro?",
          a: "Sì, utilizziamo protocolli crittografati per proteggere i tuoi dati personali. I tuoi recapiti telefonici vengono condivisi con l'host solo dopo che hai effettuato una richiesta di prenotazione per facilitare la comunicazione."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-accent-gold/10 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-accent-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">Domande Frequenti</h1>
          <p className="text-xl text-text-secondary">Tutto quello che devi sapere per viaggiare o ospitare con {siteName}</p>
        </div>

        <div className="space-y-12">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                {cat.icon}
                <h2 className="text-2xl font-bold text-white">{cat.title}</h2>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {cat.items.map((item, iIdx) => (
                  <AccordionItem key={iIdx} value={`${idx}-${iIdx}`} className="bg-bg-surface border border-border rounded-xl px-6 transition-all hover:border-accent-gold/50 data-[state=open]:border-accent-gold">
                    <AccordionTrigger className="text-left text-white font-semibold hover:no-underline py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-text-secondary leading-relaxed pb-6">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-accent-gold/20 to-transparent border border-accent-gold/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Hai ancora domande?</h3>
          <p className="text-text-secondary mb-6">Il nostro team di supporto è qui per aiutarti 24/7.</p>
          <Link 
            href="/contact"
            className="inline-block bg-accent-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-[#d4b568] transition-colors"
          >
            Contatta l'Assistenza
          </Link>
        </div>
      </div>
    </div>
  )
}
