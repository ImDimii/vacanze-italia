'use client';

import { useState, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  CalendarIcon, 
  User, 
  Info, 
  Loader2, 
  Plus,
  Minus,
  Star,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { calculateBookingPrice } from '@/lib/booking-utils';
import { DateRange } from 'react-day-picker';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validateCoupon } from '@/app/actions/coupon';
import { Ticket } from 'lucide-react';

interface BookingWidgetProps {
  property: any;
  blockedDates: Date[];
  avgRating: number;
  totalReviews: number;
}

export function BookingWidget({ property, blockedDates, avgRating, totalReviews }: BookingWidgetProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const priceBreakdown = useMemo(() => {
    if (!date?.from || !date?.to) return null;
    const baseBreakdown = calculateBookingPrice(
      property.price_per_night,
      property.cleaning_fee || 0,
      property.security_deposit || 0,
      date.from,
      date.to,
      property.seasonal_prices || []
    );

    if (appliedCoupon) {
      let discount = 0;
      if (appliedCoupon.discount_type === 'percentage') {
        discount = (baseBreakdown.subtotal * appliedCoupon.discount_value) / 100;
      } else {
        discount = appliedCoupon.discount_value;
      }
      return {
        ...baseBreakdown,
        discount,
        totalPrice: Math.max(0, baseBreakdown.totalPrice - discount),
        deposit_amount: Math.max(0, (baseBreakdown.totalPrice - discount) * 0.5),
        balance_amount: Math.max(0, (baseBreakdown.totalPrice - discount) * 0.5)
      };
    }

    return baseBreakdown;
  }, [date, property, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    const res = await validateCoupon(couponCode.trim().toUpperCase(), property.id);
    if (res.success) {
      setAppliedCoupon(res.coupon);
    } else {
      setCouponError(res.error || 'Errore');
    }
    setValidatingCoupon(false);
  };

  const isMinNightsMet = useMemo(() => {
    if (!date?.from || !date?.to) return true;
    const nights = differenceInDays(date.to, date.from);
    return nights >= (property.min_nights || 1);
  }, [date, property.min_nights]);

  const handleBookingRequest = async () => {
    if (!date?.from || !date?.to || !priceBreakdown) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.push('/login');
        return;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: property.id,
          check_in: date.from.toISOString(),
          check_out: date.to.toISOString(),
          num_guests: guests,
          coupon_code: appliedCoupon?.code
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setLoading(false);
      setSuccess(true);
      if (data.redirect) {
        router.push(data.redirect);
      } else if (data.booking_id) {
        router.push(`/dashboard/bookings/${data.booking_id}`);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl sticky top-28 transition-all hover:border-accent-gold/20">
      
      {/* Dashboard-Style Header */}
      <div className="p-8 border-b border-border space-y-4">
         <div className="flex items-start justify-between">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">Prezzo</p>
               <h4 className="text-3xl font-bold text-white tracking-tight">
                  €{property.price_per_night} 
                  <span className="text-xs text-text-secondary font-medium lowercase ml-1">/ notte</span>
               </h4>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-border px-4 py-2 rounded-xl">
               <Star className="w-4 h-4 fill-accent-gold text-accent-gold" />
               <span className="text-lg font-bold text-white">{avgRating.toFixed(1)}</span>
            </div>
         </div>
         <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">
            {totalReviews} Recensioni Verificate
         </p>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Selectors Group */}
        <div className="space-y-4">
          
          {/* Date Selector Popover */}
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger
                className={cn(
                  "w-full flex items-center justify-between text-left h-16 px-6 bg-bg-primary border border-border rounded-xl hover:bg-white/5 transition-all outline-none cursor-pointer group/trigger",
                  !date && "text-text-secondary"
                )}
              >
                <div className="flex items-center gap-4 pointer-events-none w-full justify-between">
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="h-4 w-4 text-accent-gold group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                      {date?.from ? (
                        date.to ? (
                          <>{format(date.from, "dd MMM", { locale: it })} — {format(date.to, "dd MMM", { locale: it })}</>
                        ) : format(date.from, "dd MMM", { locale: it })
                      ) : "Seleziona Date"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || blockedDates.some(bd => bd.toDateString() === d.toDateString())}
                  className="p-6 border-none"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guest Count Selector */}
          <div className="flex items-center justify-between h-16 px-6 bg-bg-primary border border-border rounded-xl">
             <div className="flex items-center gap-4">
                <User className="w-4 h-4 text-accent-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                   {guests} {guests === 1 ? 'Ospite' : 'Ospiti'}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-all outline-none"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setGuests(Math.min(property.max_guests, guests + 1))}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-all outline-none"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Coupon Input */}
          <div className="space-y-2">
            <div className="relative">
              <input 
                type="text"
                placeholder="CODICE SCONTO"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full h-16 px-6 bg-bg-primary border border-border rounded-xl text-xs font-bold uppercase tracking-widest text-white/90 focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode || !!appliedCoupon}
                className="absolute right-2 top-2 bottom-2 px-4 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
              >
                {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedCoupon ? 'Applicato' : 'Applica'}
              </button>
            </div>
            {couponError && <p className="text-[9px] text-error font-bold uppercase ml-2">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-[9px] text-success font-bold uppercase ml-2 flex items-center gap-1">
                <Ticket className="w-3 h-3" /> Sconto {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `€${appliedCoupon.discount_value}`} applicato!
              </p>
            )}
          </div>
        </div>

        {/* Price Summary Breakdown */}
        {priceBreakdown ? (
          <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {!isMinNightsMet && (
              <div className="bg-error/10 border border-error/50 text-error text-[11px] font-bold p-4 rounded-xl text-center flex items-center justify-center gap-3 uppercase tracking-widest animate-pulse shadow-lg shadow-error/10">
                <Info className="w-5 h-5 shrink-0" /> Errore: Prenotazione minima {property.min_nights} notti!
              </div>
            )}
            
            <div className="space-y-4 text-xs font-medium text-text-secondary">
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="font-bold">Costo Soggiorno ({priceBreakdown.nights} notti)</span>
                <span className="text-white font-bold">€{priceBreakdown.subtotal}</span>
              </div>
              {priceBreakdown.cleaningFee > 0 && (
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span>Spese di pulizia</span>
                  <span className="text-white font-bold">€{priceBreakdown.cleaningFee}</span>
                </div>
              )}
              {priceBreakdown.discount > 0 && (
                <div className="flex justify-between border-b border-border/20 pb-2 text-success">
                  <span className="font-bold uppercase tracking-widest text-[9px]">Sconto coupon</span>
                  <span className="font-bold">- €{priceBreakdown.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 flex items-baseline justify-between">
                 <span className="text-white font-bold text-base tracking-tight uppercase">Totale</span>
                 <span className="text-3xl font-bold text-accent-gold tracking-tighter">€{priceBreakdown.totalPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-border rounded-xl text-center bg-bg-primary/50">
             <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-loose">
                Seleziona le date per il costo esatto
             </p>
          </div>
        )}

        {/* Primary Booking Call to Action */}
        <div className="space-y-4">
          <Button 
            onClick={handleBookingRequest} 
            disabled={!date?.from || !date?.to || !isMinNightsMet || loading || success}
            className={cn(
               "w-full h-16 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center shadow-xl shadow-accent-gold/10 active:scale-95 outline-none transition-all duration-300",
               success ? "bg-success text-black border-success" : "bg-accent-gold text-black hover:bg-white border-transparent"
            )}
          >
            {loading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
               <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Richiesta Inviata
               </div>
            ) : (
               'Prenota Soggiorno'
            )}
          </Button>
          
          {success && (
            <motion.p 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="text-[10px] text-success font-bold text-center uppercase tracking-widest"
            >
               Controlla la tua dashboard per i dettagli
            </motion.p>
          )}
        </div>

        {/* Quick Availability Footer Block */}
        <div className="pt-8 border-t border-border mt-4">
           <div className="flex items-center justify-between mb-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Disponibilità Rapida</h5>
              <Link href="#availability" className="text-[10px] font-bold uppercase text-accent-gold hover:underline underline-offset-4">Vedi Calendario</Link>
           </div>
           <AvailabilityCalendar 
             blockedDates={blockedDates} 
             seasonalPrices={property.seasonal_prices} 
             basePrice={property.price_per_night}
             numberOfMonths={1}
             className="mt-4"
           />
        </div>
      </div>
    </div>
  );
}
