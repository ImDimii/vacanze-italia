import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ShieldCheck } from 'lucide-react';

interface HostCardProps {
  host: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    created_at: string;
  };
  propertyTitle: string;
  propertyId: string;
}

export function HostCard({ host, propertyTitle, propertyId }: HostCardProps) {
  const hostYear = new Date(host.created_at).getFullYear();

  // Clean phone number for WhatsApp (remove spaces, +, etc. except numbers)
  const cleanPhone = host.phone?.replace(/\D/g, '');
  const propertyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/property/${propertyId}`;
  const whatsappMessage = encodeURIComponent(
    `Ciao ${host.full_name}, ho visto il tuo annuncio "${propertyTitle}" su VacanzeItalia e vorrei avere maggiori informazioni. Mi puoi aiutare?\n\nLink: ${propertyUrl}`
  );

  return (
    <div className="bg-bg-surface border border-border rounded-3xl overflow-hidden mt-12 shadow-xl shadow-black/10">
      <div className="p-10 border-b border-border bg-white/[0.01]">
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-16 h-16 border-2 border-accent-gold/20 p-1 rounded-full">
              <AvatarImage src={host.avatar_url} className="rounded-full object-cover" />
              <AvatarFallback className="text-xl bg-bg-primary text-accent-gold rounded-full font-bold">{host.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-white tracking-tight">Incontra {host.full_name}</h4>
              <p className="text-text-secondary text-sm font-medium">Host verificato • Membro dal {hostYear}</p>
            </div>
          </div>
          
          {host.phone && (
            <a 
              href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center bg-[#25D366] px-10 text-sm font-bold text-white transition-all hover:bg-white hover:text-black rounded-xl shadow-lg shadow-[#25D366]/10 active:scale-95 outline-none"
            >
              <MessageSquare className="w-4 h-4 mr-3" />
              Contatta su WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="p-10 space-y-10">
        <div className="text-text-secondary leading-relaxed text-lg font-medium whitespace-pre-line max-w-3xl">
          {host.bio || "Questo host non ha ancora aggiunto una biografia individuale, ma è a tua completa disposizione per ogni necessità legata al soggiorno."}
        </div>

        <div className="pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
            <div className="p-3 bg-bg-primary border border-border rounded-xl">
              <ShieldCheck className="w-5 h-5 text-success" />
            </div>
            Identità verificata con VacanzeItalia
          </div>
          <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold opacity-30">
             Privacy & Sicurezza Garantite
          </p>
        </div>
      </div>
    </div>
  );
}
