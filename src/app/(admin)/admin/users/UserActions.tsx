'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserX, Loader2, CheckCircle, XCircle, Home } from 'lucide-react';
import { toggleAdminRole, deleteUser, approveHost, rejectHost } from '@/app/actions/admin';

interface UserActionsProps {
  userId: string;
  role: string;
  hostStatus?: string;
}

export function UserActions({ userId, role, hostStatus }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleRole = async () => {
    setLoading('role');
    const result = await toggleAdminRole(userId, role);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo utente? L\'operazione rimuoverà il profilo dal database.')) return;
    
    setLoading('delete');
    const result = await deleteUser(userId);
    if (!result.success) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  const handleApproveHost = async () => {
    setLoading('approve');
    const res = await approveHost(userId);
    if (res.success) router.refresh();
    else alert(res.error);
    setLoading(null);
  };

  const handleRejectHost = async () => {
    setLoading('reject');
    const res = await rejectHost(userId);
    if (res.success) router.refresh();
    else alert(res.error);
    setLoading(null);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {hostStatus === 'pending' && (
        <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
          <button 
            onClick={handleApproveHost}
            disabled={loading !== null}
            className="p-2 hover:bg-success/10 rounded-lg text-success transition-colors"
            title="Approva come Host"
          >
            {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleRejectHost}
            disabled={loading !== null}
            className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors"
            title="Rifiuta Richiesta"
          >
            {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
          </button>
        </div>
      )}

      {hostStatus === 'approved' && (
        <div className="p-2 text-success opacity-50" title="Host Approvato">
          <Home className="w-5 h-5" />
        </div>
      )}

      <button 
        onClick={handleToggleRole}
        disabled={loading !== null}
        className="p-2 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors disabled:opacity-50"
        title={role === 'admin' ? "Rendi Utente Semplice" : "Promuovi ad Admin"}
      >
        {loading === 'role' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShieldCheck className={cn("w-5 h-5", role === 'admin' ? "text-accent-gold" : "")} />
        )}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={loading !== null}
        className="p-2 hover:bg-error/10 rounded-lg text-text-secondary hover:text-error transition-colors disabled:opacity-50"
        title="Elimina Utente"
      >
        {loading === 'delete' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <UserX className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
