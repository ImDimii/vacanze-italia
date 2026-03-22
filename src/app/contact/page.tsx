'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { submitSupportTicket } from '@/app/actions/support';
import { getSiteSettings } from '@/app/actions/settings';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [siteEmail, setSiteEmail] = useState('supporto@vacanzeitalia.it');

  useEffect(() => {
    getSiteSettings().then(s => {
      if(s?.contact_email) setSiteEmail(s.contact_email);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await submitSupportTicket(formData);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Errore durante l\'invio. Riprova più tardi.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-bg-surface border-border p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Messaggio Inviato!</h1>
          <p className="text-text-secondary mb-8">
            Grazie per averci contattato. Il nostro team prenderà in carico la tua richiesta e ti risponderà via email entro 24-48 ore.
          </p>
          <a 
            href="/" 
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gold px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[#d4b568]"
          >
            Torna alla Home
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Contatta l'Assistenza</h1>
              <p className="text-lg text-text-secondary leading-relaxed">
                Hai bisogno di aiuto con una prenotazione o vuoi segnalare un problema? Compila il form e il nostro team ti risponderà il prima possibile.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-accent-gold/10 p-3 rounded-xl border border-accent-gold/20">
                  <Mail className="w-6 h-6 text-accent-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Email Diretta</h3>
                  <p className="text-text-secondary text-sm">{siteEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent-gold/10 p-3 rounded-xl border border-accent-gold/20">
                  <MessageSquare className="w-6 h-6 text-accent-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Tempi di Risposta</h3>
                  <p className="text-text-secondary text-sm">Entro 24 ore lavorative</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-bg-surface border border-border rounded-2xl opacity-60">
              <p className="text-xs text-text-secondary mb-2 uppercase font-bold tracking-widest">Nota per gli Host</p>
              <p className="text-sm text-text-secondary">
                Se hai problemi con un pagamento specifico, includi sempre il Codice Prenotazione nel messaggio per velocizzare la pratica.
              </p>
            </div>
          </div>

          <Card className="bg-bg-surface border-border shadow-2xl">
            <CardHeader className="bg-bg-primary border-b border-border p-6">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Send className="w-5 h-5 text-accent-gold" /> Invia un Messaggio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-error/10 border border-error/50 text-error rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Nome</Label>
                    <Input id="name" name="name" required placeholder="Mario Rossi" className="bg-bg-primary border-border text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="mario@esempio.it" className="bg-bg-primary border-border text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white">Oggetto (opzionale)</Label>
                  <Input id="subject" name="subject" placeholder="es. Problema con un pagamento" className="bg-bg-primary border-border text-white" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">Messaggio</Label>
                  <Textarea id="message" name="message" required placeholder="Descrivi qui la tua richiesta..." className="bg-bg-primary border-border text-white min-h-[150px]" />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-accent-gold text-black hover:bg-[#d4b568] h-12 font-bold text-lg">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Invio in corso...</>
                  ) : (
                    'Invia Richiesta'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
