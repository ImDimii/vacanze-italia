import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function BookingStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string, color: string }> = {
    'pending_payment': { label: 'In attesa di pagamento', color: 'bg-warning text-black' },
    'receipt_uploaded': { label: 'Ricevuta in verifica', color: 'bg-orange-500 text-white' },
    'confirmed': { label: 'Confermata ✓', color: 'bg-success text-white' },
    'cancelled': { label: 'Cancellata', color: 'bg-error text-white' },
    'cancellation_requested': { label: 'Richiesta Annullamento', color: 'bg-amber-600 text-white' },
    'completed': { label: 'Completata', color: 'bg-blue-500 text-white' },
    'refunded': { label: 'Rimborsata', color: 'bg-purple-500 text-white' },
  };

  const { label, color } = statusMap[status] || { label: status, color: 'bg-border text-white' };

  return (
    <Badge className={cn('font-semibold hover:bg-opacity-80', color)}>
      {label}
    </Badge>
  );
}
