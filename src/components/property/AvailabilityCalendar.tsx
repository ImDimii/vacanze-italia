'use client';

import { Calendar } from '@/components/ui/calendar';
import { it } from 'date-fns/locale';
import { isWithinInterval, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface SeasonalPrice {
  start_date: string;
  end_date: string;
  price: number;
}

interface AvailabilityCalendarProps {
  blockedDates: Date[];
  seasonalPrices: SeasonalPrice[];
  basePrice: number;
  className?: string;
  numberOfMonths?: number;
}

export function AvailabilityCalendar({ 
  blockedDates = [], 
  seasonalPrices = [], 
  basePrice,
  className,
  numberOfMonths = 1
}: AvailabilityCalendarProps) {
  
  const getDayPrice = (date: Date): number => {
    try {
      const d = startOfDay(new Date(date));
      const seasonal = (seasonalPrices || []).find(p => {
        const start = startOfDay(new Date(p.start_date));
        const end = startOfDay(new Date(p.end_date));
        return isWithinInterval(d, { start, end });
      });
      return seasonal ? seasonal.price : (basePrice || 0);
    } catch (e) {
      return basePrice || 0;
    }
  };

  return (
    <div className={cn("w-full relative", className)}>
      <Calendar
        locale={it}
        className="bg-transparent border-none p-0 text-white w-full shadow-none"
        classNames={{
          months: "flex flex-col gap-8 w-full",
          month: "w-full space-y-4",
          month_caption: "flex justify-center items-center h-10 mb-2 relative",
          caption_label: "text-lg font-bold text-white uppercase tracking-widest",
          month_grid: "w-full border-collapse table-fixed",
          weekdays: "border-b border-border/10",
          weekday: "text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] text-center pt-2 pb-4",
          week: "mt-2",
          day: "p-0 relative h-14",
          selected: "bg-accent-gold text-black rounded-2xl",
          today: "rounded-2xl ring-2 ring-accent-gold/30 bg-accent-gold/5",
          // Preserve navigation styles explicitly
          nav: "absolute top-0 right-0 left-0 flex items-center justify-between z-40 pointer-events-none",
          button_previous: "pointer-events-auto h-8 w-8 p-0 rounded-lg hover:bg-white/10 border border-white/10 bg-bg-surface flex items-center justify-center transition-all",
          button_next: "pointer-events-auto h-8 w-8 p-0 rounded-lg hover:bg-white/10 border border-white/10 bg-bg-surface flex items-center justify-center transition-all",
        }}
        disabled={(date) => {
          const d = startOfDay(new Date(date));
          const today = startOfDay(new Date());
          return d < today || (blockedDates || []).some(bd => startOfDay(new Date(bd)).getTime() === d.getTime());
        }}
        numberOfMonths={numberOfMonths}
        components={{
          Day: ({ day, modifiers, ...props }) => {
            const date = day.date;
            if (!date) return <td />;
            
            const d = startOfDay(new Date(date));
            const today = startOfDay(new Date());
            const isBlocked = (blockedDates || []).some(bd => startOfDay(new Date(bd)).getTime() === d.getTime());
            const isPast = d < today;
            const isSelected = modifiers.selected;
            const isToday = modifiers.today;
            const price = getDayPrice(date);
            const isOutside = modifiers.outside;

            if (isOutside && !modifiers.selected) {
              return (
                <td className="opacity-10 pointer-events-none text-center py-4 text-xs font-bold">
                  {date.getDate()}
                </td>
              );
            }

            return (
              <td className="p-0.5">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center aspect-square w-full rounded-xl transition-all duration-300 border",
                    isSelected 
                      ? "bg-accent-gold border-accent-gold text-black shadow-lg shadow-accent-gold/20" 
                      : isToday 
                        ? "bg-accent-gold/10 border-accent-gold/30 text-white" 
                        : "bg-bg-primary/40 border-border/50 text-white hover:border-accent-gold/40 hover:bg-bg-primary",
                    (isBlocked || isPast) && "opacity-30 grayscale cursor-not-allowed border-transparent bg-transparent",
                  )}
                >
                  <span className={cn(
                    "text-sm font-bold",
                    isSelected ? "text-black" : "text-white"
                  )}>
                    {date.getDate()}
                  </span>
                  
                  {!isBlocked && !isPast && !isOutside && (
                    <span className={cn(
                      "text-[9px] font-bold mt-0.5 whitespace-nowrap",
                      isSelected ? "text-black/60" : "text-accent-gold"
                    )}>
                      €{price}
                    </span>
                  )}

                  {(isBlocked || isPast) && !isOutside && (
                    <span className="text-[8px] font-bold mt-0.5 text-text-secondary/40 uppercase tracking-tighter">
                      N/D
                    </span>
                  )}

                  {isToday && !isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-gold rounded-full" />
                  )}
                </div>
              </td>
            );
          }
        }}
      />
      
      {/* Legenda rapida sotto al calendario */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 overflow-hidden">
        <div className="flex items-center gap-2.5 group">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-gold shadow-[0_0_8px_rgba(232,201,125,0.4)] transition-transform group-hover:scale-110" />
          <span className="text-[9px] text-text-secondary uppercase font-bold tracking-[0.1em]">Scelto</span>
        </div>
        <div className="flex items-center gap-2.5 group">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/5 transition-transform group-hover:scale-110" />
          <span className="text-[9px] text-text-secondary uppercase font-bold tracking-[0.1em]">Libero</span>
        </div>
        <div className="flex items-center gap-2.5 group">
          <div className="w-2.5 h-2.5 rounded-full bg-bg-surface border border-white/5 opacity-30 transition-transform group-hover:scale-110" />
          <span className="text-[9px] text-text-secondary uppercase font-bold tracking-[0.1em]">Impegnato</span>
        </div>
      </div>
    </div>
  );
}
