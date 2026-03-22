'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email o password non validi.');
      setLoading(false);
    } else {
      router.refresh();
      router.push(redirectTo);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <div className="w-full max-w-md bg-bg-surface border border-border p-8 rounded-2xl shadow-2xl">
        <h1 className="font-heading text-3xl font-bold text-white mb-2 text-center">Bentornato</h1>
        <p className="text-text-secondary text-center mb-8">Accedi al tuo account per gestire le tue prenotazioni.</p>

        {error && (
          <Alert variant="destructive" className="mb-6 border-error/50 bg-error/10 text-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Non hai un account?{' '}
          <Link href={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="text-accent-gold hover:underline">
            Registrati
          </Link>
        </div>
      </div>
    </div>
  );
}
