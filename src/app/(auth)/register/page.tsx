'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (signUpData.user) {
      // Manual update to profiles to ensure phone and name are saved
      // The trigger might only handle metadata it knows about
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone: phone 
        })
        .eq('id', signUpData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // We don't block registration for this, but log it
      }

      setSuccess(true);
      setLoading(false);
      // Automatically redirect after a short delay or let them click
      setTimeout(() => {
        router.refresh();
        router.push(redirectTo);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <div className="w-full max-w-md bg-bg-surface border border-border p-8 rounded-2xl shadow-2xl">
        <h1 className="font-heading text-3xl font-bold text-white mb-2 text-center">Crea Account</h1>
        <p className="text-text-secondary text-center mb-8">Unisciti a VacanzeItalia per prenotare soggiorni esclusivi.</p>

        {error && (
          <Alert variant="destructive" className="mb-6 border-error/50 bg-error/10 text-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert className="mb-6 border-success/50 bg-success/10 text-success">
            <AlertDescription>Registrazione completata! Reindirizzamento in corso...</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-text-primary">Nome Completo</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Mario Rossi" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-bg-primary text-white border-border focus:border-accent-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-text-primary">Telefono</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+39 333 1234567" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-bg-primary text-white border-border focus:border-accent-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="mario@esempio.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bg-primary text-white border-border focus:border-accent-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bg-primary text-white border-border focus:border-accent-gold"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent-gold text-black hover:bg-[#d4b568] h-12 text-lg font-bold"
            >
              {loading ? 'Registrazione...' : 'Registrati'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-text-secondary">
          Hai già un account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-accent-gold hover:underline">
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
}
