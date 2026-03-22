import { getSiteSettings } from '@/app/actions/settings';

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || 'VacanzeItalia';
  const contactEmail = settings?.contact_email || 'legales@vacanzeitalia.it';
  const sections = [
    {
      title: "1. Introduzione",
      content: `Benvenuti su ${siteName}. Utilizzando il nostro sito web e i nostri servizi, l'utente accetta di essere vincolato dai seguenti Termini e Condizioni. Si prega di leggerli attentamente prima di procedere con qualsiasi prenotazione o inserimento di annunci.`
    },
    {
      title: "2. Servizi Offerti",
      content: `${siteName} agisce come piattaforma di incontro tra Host (proprietari di immobili) e Ospiti (viaggiatori). Non siamo proprietari, gestori o agenti delle proprietà elencate sul sito. Non partecipiamo direttamente alle transazioni monetarie che avvengono via bonifico bancario tra le parti.`
    },
    {
      title: "3. Prenotazioni e Pagamenti",
      content: `Le prenotazioni vengono effettuate direttamente con l'Host. L'Ospite si impegna a versare l'acconto richiesto tramite bonifico bancario seguendo le coordinate fornite dall'Host. ${siteName} non è responsabile per eventuali dispute relative ai pagamenti effettuati al di fuori della piattaforma.`
    },
    {
      title: "4. Responsabilità dell'Host",
      content: "L'Host garantisce che le informazioni fornite nell'annuncio siano accurate e veritiere. È responsabilità dell'Host assicurarsi che la proprietà sia conforme a tutte le normative locali in materia di affitti brevi e turismo."
    },
    {
      title: "5. Recensioni",
      content: "Gli utenti possono pubblicare recensioni basate sulla loro esperienza reale. Ci riserviamo il diritto di rimuovere recensioni offensive, false o che non rispettano le nostre linee guida della community."
    },
    {
      title: "6. Modifiche ai Termini",
      content: `${siteName} si riserva il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno effettive non appena pubblicate sul sito web.`
    }
  ]

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-heading font-bold text-white mb-8">Termini e Condizioni d'Uso</h1>
        <p className="text-text-secondary mb-12 italic">Ultimo aggiornamento: 20 Marzo 2026</p>
        
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <section key={idx} className="bg-bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-xl font-bold text-accent-gold mb-4">{section.title}</h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-text-secondary italic">
          Per qualsiasi chiarimento legale, contattare {contactEmail}
        </div>
      </div>
    </div>
  )
}
