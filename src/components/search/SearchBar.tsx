'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar as CalendarIcon, Users, ChevronRight, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

export function SearchBar({ initialParams }: { initialParams: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(initialParams.city || '');
  const [guests, setGuests] = useState(initialParams.guests || '1');
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: initialParams.check_in ? new Date(initialParams.check_in) : undefined,
    to: initialParams.check_out ? new Date(initialParams.check_out) : undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (city) params.set('city', city);
    else params.delete('city');
    
    if (guests && guests !== '1') params.set('guests', guests);
    else params.delete('guests');

    if (date?.from) params.set('check_in', date.from.toISOString());
    else params.delete('check_in');

    if (date?.to) params.set('check_out', date.to.toISOString());
    else params.delete('check_out');

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-bg-surface border border-border rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto shadow-2xl relative z-50">
      {/* City Input */}
      <div className="flex-1 flex items-center px-6 w-full md:w-auto md:border-r border-border group">
        <MapPin className="w-5 h-5 text-accent-gold mr-3 shrink-0 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col text-left w-full">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none mb-1">Destinazione</span>
          <Input 
            className="bg-transparent border-none text-white focus-visible:ring-0 px-0 h-6 text-sm font-bold placeholder:text-text-secondary w-full" 
            placeholder="Dove vuoi andare?" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        {city && (
          <button type="button" onClick={() => setCity('')} className="p-1 hover:bg-white/10 rounded-full text-text-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Date Picker */}
      <div className="flex-1 w-full md:w-auto md:border-r border-border">
        <Popover>
          <PopoverTrigger
            render={
              <button type="button" className="w-full flex items-center px-6 h-12 cursor-pointer hover:bg-white/5 rounded-2xl md:rounded-full transition-all group">
                <CalendarIcon className="w-5 h-5 text-accent-gold mr-3 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none mb-1">Date</span>
                  <span className={cn(
                    "text-xs font-bold truncate",
                    date?.from ? "text-white" : "text-text-secondary"
                  )}>
                    {date?.from ? (
                      date.to ? (
                        <>{format(date.from, "dd MMM", { locale: it })} — {format(date.to, "dd MMM", { locale: it })}</>
                      ) : format(date.from, "dd MMM", { locale: it })
                    ) : "Aggiungi date"}
                  </span>
                </div>
              </button>
            }
          />
          <PopoverContent className="w-auto p-0 bg-bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden sm:max-w-none" align="center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from || new Date()}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className="p-6"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests Input */}
      <div className="flex-1 flex items-center px-6 w-full md:w-auto group">
        <Users className="w-5 h-5 text-accent-gold mr-3 shrink-0 group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none mb-1">Ospiti</span>
            <span className="text-xs font-bold text-white tracking-wide">{guests} {Number(guests) === 1 ? 'Persona' : 'Persone'}</span>
          </div>
          <div className="flex items-center gap-3">
             <button type="button" onClick={() => setGuests((g: string) => Math.max(1, Number(g) - 1).toString())} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-white/5 text-white transition-colors">-</button>
             <button type="button" onClick={() => setGuests((g: string) => (Number(g) + 1).toString())} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-white/5 text-white transition-colors">+</button>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <Button type="submit" className="w-full md:w-auto rounded-2xl md:rounded-full bg-accent-gold text-black hover:bg-white px-10 h-14 font-bold uppercase tracking-[0.2em] shadow-xl shadow-accent-gold/10 transition-all active:scale-95 shrink-0 ml-0 md:ml-4">
        <Search className="w-4 h-4 mr-2" />
        Cerca
      </Button>
    </form>
  );
}
