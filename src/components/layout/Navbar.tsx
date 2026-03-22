'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MobileNav } from './MobileNav';
import { UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DesktopDrawer } from './DesktopDrawer';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  siteName?: string;
}

export function Navbar({ siteName = "VacanzeItalia" }: NavbarProps) {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-bg-surface/70 border-b border-border transition-all duration-300 shadow-sm">
      <div className="container mx-auto px-4 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading text-2xl font-bold text-gradient-gold tracking-tight hover:opacity-90 transition-opacity">
            {siteName}
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-text-secondary">
            <Link href="/search" className="hover:text-accent-gold transition-colors duration-200 py-2">Esplora</Link>
            <Link href="/about" className="hover:text-accent-gold transition-colors duration-200 py-2">Chi Siamo</Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-4">
            {loading && (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="h-9 w-20 bg-border/50 rounded-md"></div>
                <div className="h-10 w-10 bg-border/50 rounded-full"></div>
              </div>
            )}
            {!loading && !user && (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-text-primary hover:text-accent-gold font-medium rounded-full px-6 transition-all">Accedi</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-accent-gold text-black hover:bg-[#d4b568] font-bold rounded-full px-7 shadow-lg shadow-accent-gold/20 transition-all hover:scale-105">Registrati</Button>
                </Link>
              </>
            )}

            {!loading && user && (
              <div className="flex items-center gap-3">
                <NotificationBell userId={user.id} />
                <DesktopDrawer user={user} profile={profile} signOut={signOut} />
              </div>
            )}
          </div>
          <MobileNav user={user} profile={profile} loading={loading} signOut={signOut} />
        </div>
      </div>
    </header>
  );
}
