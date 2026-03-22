import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
  Users, 
  Search, 
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserActions } from './UserActions';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestione Utenti</h1>
          <p className="text-text-secondary mt-1">Sola lista degli utenti iscritti alla piattaforma.</p>
        </div>
        <div className="bg-bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-2">
          <Search className="w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Cerca utente..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-text-secondary/50 w-64"
          />
        </div>
      </div>

      <Card className="bg-bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Utente</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Email</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Ruolo</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest">Creato il</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest text-center">Host Status</th>
                <th className="p-4 text-xs font-black uppercase text-text-secondary tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-bg-primary text-white">
                          <UserIcon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-white tracking-tight">{user.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">{user.email || 'N/A'}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                      user.role === 'admin' 
                        ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20" 
                        : "bg-white/5 text-text-secondary border border-white/10"
                    )}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                    {user.host_status === 'pending' ? (
                      <span className="bg-warning/10 text-warning border border-warning/20 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">PENDING</span>
                    ) : user.host_status === 'approved' ? (
                      <span className="bg-success/10 text-success border border-success/20 text-[10px] font-bold px-2 py-0.5 rounded-full">APPROVED</span>
                    ) : (
                      <span className="text-[10px] text-text-secondary/30">-</span>
                    )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <UserActions userId={user.id} role={user.role} hostStatus={user.host_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!users || users.length === 0) && (
            <div className="p-12 text-center text-text-secondary">
              Nessun utente trovato.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Utility function duplicated for simplicity in this specific file if needed or imported
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
