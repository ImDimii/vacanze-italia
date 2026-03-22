import { 
  Wifi, Car, Waves, Snowflake, Tv, Wind, UtensilsCrossed, Coffee, WashingMachine, Flame, Check,
  TreePine, PawPrint, Baby, Dumbbell, Briefcase, Sun, ShieldAlert, Bell, Lock, Shirt, Sunset
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'wifi': Wifi,
  'kitchen': UtensilsCrossed,
  'cucina': UtensilsCrossed,
  'parking': Car,
  'parcheggio': Car,
  'pool': Waves,
  'piscina': Waves,
  'ac': Snowflake,
  'air conditioning': Snowflake,
  'aria condizionata': Snowflake,
  'tv': Tv,
  'heating': Flame,
  'riscaldamento': Flame,
  'coffee maker': Coffee,
  'macchina caffè': Coffee,
  'washer': WashingMachine,
  'lavatrice': WashingMachine,
  'hair dryer': Wind,
  'asciugacapelli': Wind,
  'phon': Wind,
  'garden': TreePine,
  'giardino': TreePine,
  'pets allowed': PawPrint,
  'animali': PawPrint,
  'crib': Baby,
  'culla': Baby,
  'gym': Dumbbell,
  'palestra': Dumbbell,
  'workspace': Briefcase,
  'scrivania': Briefcase,
  'lavoro': Briefcase,
  'sea_view': Sunset,
  'sea view': Sunset,
  'vista mare': Sunset,
  'fire extinguisher': ShieldAlert,
  'estintore': ShieldAlert,
  'alarm': Bell,
  'allarme': Bell,
  'safe': Lock,
  'cassaforte': Lock,
  'iron': Shirt,
  'ferro da stiro': Shirt
};

const labelMap: Record<string, string> = {
  'wifi': 'WiFi Veloce',
  'kitchen': 'Cucina Attrezzata',
  'parking': 'Parcheggio Gratuito',
  'pool': 'Piscina Privata',
  'ac': 'Aria Condizionata',
  'tv': 'Smart TV',
  'washer': 'Lavatrice',
  'workspace': 'Zona Lavoro',
  'sea_view': 'Vista Mare',
  'garden': 'Giardino',
  'pets_allowed': 'Animali Ammessi',
  'heating': 'Riscaldamento'
};

export function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  if (!amenities || amenities.length === 0) {
    return <p className="text-text-secondary italic text-sm">Servizi non specificati</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {amenities.map((item, i) => {
        const normalized = item.toLowerCase().trim().replace(/ /g, '_');
        const searchKey = item.toLowerCase().trim();
        
        let Icon = Check;
        let label = labelMap[normalized] || labelMap[searchKey] || item;
        
        // Match Icon
        if (iconMap[searchKey]) {
          Icon = iconMap[searchKey];
        } else if (iconMap[normalized]) {
          Icon = iconMap[normalized];
        } else {
          const partialMatch = Object.keys(iconMap).find(key => key.length > 3 && searchKey.includes(key));
          if (partialMatch) Icon = iconMap[partialMatch];
        }

        return (
          <div key={i} className="flex items-center gap-4 bg-bg-primary/50 border border-border p-4 rounded-xl group hover:border-accent-gold/40 transition-all">
            <div className="p-3 bg-bg-surface border border-border rounded-lg group-hover:bg-accent-gold/10 group-hover:border-accent-gold/30 transition-all">
               <Icon className="w-5 h-5 text-accent-gold shrink-0" />
            </div>
            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
               {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
