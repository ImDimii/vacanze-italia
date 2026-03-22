import { getSiteSettings } from '@/app/actions/settings';

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || 'VacanzeItalia';
  const contactEmail = settings?.contact_email || 'privacy@vacanzeitalia.it';
  const sections = [
    {
      title: "Raccolta dei Dati",
      content: "Raccogliamo informazioni personali fornite volontariamente dagli utenti, quali nome, indirizzo email, numero di telefono e preferenze di viaggio. Questi dati sono necessari per il corretto funzionamento del processo di prenotazione."
    },
    {
      title: "Utilizzo delle Informazioni",
      content: "Le tue informazioni vengono utilizzate per facilitare la comunicazione tra Host e Ospiti, processare le richieste di prenotazione e inviare aggiornamenti sullo stato del servizio. Non vendiamo MAI i tuoi dati a terze parti per scopi di marketing."
    },
    {
      title: "Condivisione dei Dati",
      content: "Il tuo numero di telefono viene condiviso con l'Host della proprietà che hai richiesto di prenotare SOLO nel momento in cui la richiesta viene inviata, per permettere il coordinamento dell'arrivo."
    },
    {
      title: "Cookie e Tecnologie di Tracciamento",
      content: "Utilizziamo cookie tecnici per mantenere la tua sessione attiva e cookie analitici (Mapbox, Supabase) per migliorare le prestazioni del sito e la precisione delle mappe."
    },
    {
      title: "I tuoi Diritti",
      content: `Hai il diritto di accedere ai tuoi dati, chiederne la rettifica o la cancellazione definitiva dai nostri server contattando il nostro DPO all'indirizzo ${contactEmail} o tramite le impostazioni del tuo profilo.`
    }
  ]

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-heading font-bold text-white mb-8">Informativa sulla Privacy</h1>
        <p className="text-text-secondary mb-12 italic">Trasparenza e rispetto per i tuoi dati personali.</p>
        
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="border-l-2 border-accent-gold pl-6 py-2">
              <h2 className="text-lg font-bold text-white mb-2">{section.title}</h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-bg-surface rounded-2xl text-sm text-text-secondary leading-relaxed border border-border">
          <p>
            {siteName} si impegna a proteggere la tua privacy in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR) dell'Unione Europea. Utilizzando il nostro servizio, acconsenti alla raccolta e all'uso delle informazioni in conformità con questa informativa.
          </p>
        </div>
      </div>
    </div>
  )
}
