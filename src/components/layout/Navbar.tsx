'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MobileNav } from './MobileNav';
import { UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none focus:ring-2 focus:ring-accent-gold overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                    <AvatarFallback className="bg-bg-surface text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {profile?.role === 'admin' && (
                    <>
                      <DropdownMenuItem>
                        <Link href="/admin" className="w-full cursor-pointer font-bold text-accent-gold">Pannello Admin</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard?view=profile" className="w-full cursor-pointer">Il mio Profilo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      signOut();
                    }} 
                    className="cursor-pointer text-error focus:text-error font-medium"
                  >
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <MobileNav user={user} profile={profile} loading={loading} signOut={signOut} />
        </div>
      </div>
    </header>
  );
}
