'use client';

import { Menu, LogOut, LayoutDashboard, Search, Info, User as UserIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileNavProps {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => void;
}

export function MobileNav({ user, profile, loading, signOut }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    setOpen(false);
    signOut();
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger 
          render={
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-primary hover:bg-white/10 hover:text-accent-gold transition-colors"
            />
          }
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Apri menu</span>
        </SheetTrigger>
        <SheetContent side="right" className="bg-bg-surface/95 backdrop-blur-xl border-l-border w-[300px] p-0 flex flex-col">
          <div className="p-6 border-b border-border">
            <SheetHeader className="text-left">
              <SheetTitle className="text-gradient-gold font-heading text-2xl tracking-tight">VacanzeItalia</SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!loading && user && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm">
                <Avatar className="h-12 w-12 border border-accent-gold/20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-bg-primary text-accent-gold text-lg">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-bold truncate">{profile?.full_name || 'Ospite'}</span>
                  <span className="text-sm text-text-secondary truncate">{user.email}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Link href="/search" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-text-primary hover:bg-accent-gold/10 hover:text-accent-gold transition-all font-medium">
                <Search className="w-5 h-5" /> Esplora
              </Link>
              <Link href="/about" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-text-primary hover:bg-accent-gold/10 hover:text-accent-gold transition-all font-medium">
                <Info className="w-5 h-5" /> Chi Siamo
              </Link>
              
              <div className="h-px w-full bg-border/50 my-4" />
              
              {!loading && !user && (
                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center p-3 rounded-lg text-white font-medium bg-white/5 hover:bg-white/10 transition-colors">
                    Accedi
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center p-3 rounded-lg text-black font-bold bg-accent-gold hover:bg-[#d4b568] transition-colors shadow-lg shadow-accent-gold/20">
                    Registrati
                  </Link>
                </div>
              )}
              
              {!loading && user && (
                <div className="flex flex-col space-y-2">
                  {profile?.role === 'admin' && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-accent-gold hover:bg-accent-gold/10 transition-all font-bold">
                      <Settings className="w-5 h-5" /> Pannello Admin
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-text-primary hover:bg-white/5 transition-all font-medium">
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link href="/dashboard?view=profile" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-text-primary hover:bg-white/5 transition-all font-medium">
                    <UserIcon className="w-5 h-5" /> Il mio Profilo
                  </Link>
                </div>
              )}
            </div>
          </div>

          {!loading && user && (
            <div className="p-4 border-t border-border mt-auto">
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-error hover:bg-error/10 transition-all font-bold"
              >
                <LogOut className="w-5 h-5" /> Esci
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
