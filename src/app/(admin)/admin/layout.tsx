import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  MessageSquare, 
  Home,
  LogOut,
  Settings,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utenti', icon: Users },
  { href: '/admin/properties', label: 'Proprietà', icon: Building2 },
  { href: '/admin/bookings', label: 'Prenotazioni', icon: CalendarCheck },
  { href: '/admin/tickets', label: 'Supporto', icon: MessageSquare },
  { href: '/admin/settings', label: 'Impostazioni', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 border-r border-border bg-bg-surface/50 backdrop-blur-xl sticky top-0 h-screen flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-accent-gold">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all group"
            >
              <link.icon className="w-5 h-5 group-hover:text-accent-gold transition-colors" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Torna al Sito</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full min-w-0">
        <header className="h-16 border-b border-border bg-bg-surface/30 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger 
                render={
                  <button className="md:hidden p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
                    <Menu className="w-6 h-6" />
                  </button>
                }
              />
              <SheetContent side="left" className="w-[280px] bg-bg-surface p-0 border-r-border flex flex-col">
                <SheetHeader className="p-6 text-left border-b border-border">
                  <SheetTitle className="font-heading text-xl font-bold text-accent-gold">Admin Panel</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                  {ADMIN_LINKS.map((link) => (
                    <Link
                      key={`mobile-${link.href}`}
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 mt-auto border-t border-border">
                  <Link href="/" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-medium">Torna al Sito</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-text-secondary truncate">VacanzeItalia Admin</h2>
          </div>
          <div className="flex items-center gap-4">
             {/* Admin Profile/Logout could go here */}
          </div>
        </header>
        <div className="p-4 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
