import Link from 'next/link';

interface FooterProps {
  siteName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export function Footer({ siteName = "VacanzeItalia", contactEmail = "info@vacanzeitalia.it", contactPhone = "+39 0123 456789" }: FooterProps) {
  return (
    <footer className="border-t border-border bg-bg-primary pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-bold text-accent-gold">{siteName}</h3>
          <p className="text-text-secondary text-sm">
            Case vacanze esclusive in tutta Italia. Prenota in totale sicurezza senza commissioni online.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-text-primary">Naviga</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><Link href="/search" className="hover:text-accent-gold transition-colors">Esplora Proprietà</Link></li>
            <li><Link href="/about" className="hover:text-accent-gold transition-colors">Chi Siamo</Link></li>
            <li><Link href="/dashboard/host/new" className="hover:text-accent-gold transition-colors">Diventa Host</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-text-primary">Supporto</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><Link href="/faq" className="hover:text-accent-gold transition-colors">FAQ e Aiuto</Link></li>
            <li><Link href="/terms" className="hover:text-accent-gold transition-colors">Termini e Condizioni</Link></li>
            <li><Link href="/privacy" className="hover:text-accent-gold transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-text-primary">Contatti</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>Email: {contactEmail}</li>
            <li>Assistenza: {contactPhone}</li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
        <p>&copy; {new Date().getFullYear()} {siteName}. Tutti i diritti riservati.</p>
        <p>Pagamenti sicuri manuali gestiti direttamente tramite IBAN.</p>
      </div>
    </footer>
  );
}
