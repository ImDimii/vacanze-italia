'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, Send } from 'lucide-react';
import { submitReview } from '@/app/actions/review';

interface LeaveReviewFormProps {
  bookingId: string;
  propertyId: string;
}

export function LeaveReviewForm({ bookingId, propertyId }: LeaveReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Seleziona almeno una stella per il voto.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('rating', rating.toString());
      
      const result = await submitReview(formData);
      
      if (result?.success) {
        setSuccess(true);
      } else {
        setError(result?.error || 'Errore durante l\'invio della recensione.');
      }
    } catch (err: any) {
      setError('Errore di sistema.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center text-success space-y-4 py-8">
        <Star className="w-12 h-12 mx-auto mb-4 fill-success" />
        <h3 className="font-bold text-xl mb-2">Grazie per la recensione!</h3>
        <p className="text-sm">Il tuo feedback aiuta la community e i futuri ospiti.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
           <Star className="text-accent-gold w-5 h-5" /> Lascia una Recensione
        </h3>
        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
          Raccontaci com'è andato il tuo soggiorno. Il tuo feedback è prezioso per noi e per i futuri viaggiatori.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="booking_id" value={bookingId} />
        <input type="hidden" name="property_id" value={propertyId} />
        
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="bg-bg-primary/30 border border-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-6">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">Valutazione</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-all hover:scale-125 hover:-translate-y-1 active:scale-95 duration-200"
              >
                <Star 
                  className={`w-12 h-12 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-accent-gold text-accent-gold drop-shadow-[0_0_8px_rgba(232,201,125,0.4)]' 
                      : 'text-white/10 hover:text-white/30'
                  } transition-all`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="comment" className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
             Messaggio <span className="text-[10px] font-normal lowercase">(opzionale)</span>
          </label>
          <Textarea
            id="comment"
            name="comment"
            placeholder="Cosa ti è piaciuto di più? L'host è stato accogliente?"
            className="bg-bg-primary/50 border-white/10 text-white min-h-[150px] rounded-2xl focus:ring-accent-gold/30 placeholder:text-text-secondary/30 p-6 leading-relaxed"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || rating === 0} 
          className="w-full h-16 bg-accent-gold text-black hover:bg-white font-bold uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl shadow-accent-gold/10 active:scale-95 transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
               <Send className="w-4 h-4" /> Pubblica Recensione
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
