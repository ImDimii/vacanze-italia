'use client';

import { 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Settings, 
  User as UserIcon, 
  Home, 
  CreditCard, 
  MessageSquare, 
  Ticket,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DesktopDrawerProps {
  user: User | null;
  profile: any | null;
  signOut: () => void;
}

export function DesktopDrawer({ user, profile, signOut }: DesktopDrawerProps) {
  if (!user) return null;

  const isAdmin = profile?.role === 'admin';
  const isHost = profile?.role === 'host' || profile?.role === 'admin';

  return (
    <Sheet>
      <SheetTrigger className="outline-none group">
        <div className="flex items-center gap-3 pr-2 pl-1 py-1 rounded-full border border-border bg-white/5 hover:bg-white/10 hover:border-accent-gold/30 transition-all">
          <Avatar className="h-8 w-8 border border-accent-gold/20">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-bg-primary text-accent-gold text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start pr-2">
            <span className="text-[10px] font-bold text-white leading-none truncate max-w-[80px]">
              {profile?.full_name?.split(' ')[0] || 'Ospite'}
            </span>
            <span className="text-[8px] font-medium text-text-secondary uppercase tracking-widest mt-0.5">
              {profile?.role || 'User'}
            </span>
          </div>
        </div>
      </SheetTrigger>
      
      <SheetContent side="right" className="bg-bg-surface/95 backdrop-blur-2xl border-l-border w-[400px] p-0 flex flex-col shadow-2xl">
        {/* Header / Profile Section */}
        <div className="p-10 border-b border-border bg-gradient-to-br from-white/[0.03] to-transparent">
          <SheetHeader className="text-left space-y-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-accent-gold/30 shadow-xl shadow-accent-gold/5">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-bg-primary text-accent-gold text-2xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <SheetTitle className="text-white font-heading text-2xl tracking-tight leading-none">
                  {profile?.full_name || 'Il mio Profilo'}
                </SheetTitle>
                <p className="text-text-secondary text-sm font-medium">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/20">
                  <span className="w-1 h-1 rounded-full bg-accent-gold animate-pulse" />
                  <span className="text-[9px] font-bold text-accent-gold uppercase tracking-[0.1em]">{profile?.role || 'Ospite'}</span>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Section: Main Dashboards */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary ml-2">Navigazione</h3>
            <div className="grid gap-2">
              {isAdmin && (
                <DrawerLink href="/admin" icon={ShieldCheck} label="Pannello Amministrazione" highlight />
              )}
              <DrawerLink href="/dashboard" icon={LayoutDashboard} label="Dashboard Ospite" />
              {isHost && (
                <DrawerLink href="/dashboard/host" icon={Home} label="Dashboard Host" />
              )}
            </div>
          </div>

          {/* Section: My Account */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary ml-2">Account & Impostazioni</h3>
            <div className="grid gap-2">
              <DrawerLink href="/dashboard?view=profile" icon={UserIcon} label="Profilo Personale" />
              <DrawerLink href="/dashboard/bookings" icon={CreditCard} label="Le mie Prenotazioni" />
              <DrawerLink href="/dashboard/messages" icon={MessageSquare} label="Messaggi" />
              {isHost && (
                <DrawerLink href="/dashboard/host/coupons" icon={Ticket} label="Gestisci coupon" />
              )}
            </div>
          </div>
          
          {/* Section: Quick Access */}
          <div className="space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary ml-2">Esplora</h3>
             <div className="grid gap-2">
                <DrawerLink href="/search" icon={Search} label="Cerca Alloggi" />
                <DrawerLink href="/about" icon={Settings} label="Chi Siamo" />
             </div>
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-8 border-t border-border mt-auto bg-white/2">
          <button 
            onClick={signOut}
            className="flex items-center justify-between w-full p-4 rounded-xl text-error bg-error/5 hover:bg-error/10 border border-error/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-xs">Esci dalla sessione</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerLink({ href, icon: Icon, label, highlight }: { href: string; icon: any; label: string; highlight?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center justify-between p-4 rounded-xl transition-all group border border-transparent",
        highlight ? "bg-accent-gold/5 border-accent-gold/20" : "hover:bg-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          highlight ? "bg-accent-gold text-black" : "bg-white/5 text-text-secondary group-hover:text-accent-gold group-hover:bg-accent-gold/10"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn(
          "text-sm font-bold tracking-tight transition-colors",
          highlight ? "text-accent-gold" : "text-white/90 group-hover:text-white"
        )}>
          {label}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
