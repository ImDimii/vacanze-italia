import { CheckCircle2, Clock, Upload, Banknote, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingTimelineProps {
  status: string;
}

export function BookingTimeline({ status }: BookingTimelineProps) {
  // Determine completed steps based on current status
  const steps = [
    {
      id: 'step1',
      title: 'Prenotazione Richiesta',
      description: 'Hai inviato la richiesta per le tue date.',
      icon: Clock,
      completed: true, // Always true if booking exists
      active: status === 'pending_payment'
    },
    {
      id: 'step2',
      title: 'Bonifico & Ricevuta',
      description: 'Caricamento della contabile del bonifico del 50%.',
      icon: Upload,
      completed: ['receipt_uploaded', 'confirmed', 'completed'].includes(status),
      active: status === 'receipt_uploaded'
    },
    {
      id: 'step3',
      title: 'Verifica Host',
      description: 'L\'host approva la ricevuta e conferma.',
      icon: CheckCircle2,
      completed: ['confirmed', 'completed'].includes(status),
      active: status === 'confirmed'
    },
    {
      id: 'step4',
      title: 'Check-in e Saldo',
      description: 'Arrivo alla struttura e pagamento in contanti.',
      icon: Banknote,
      completed: status === 'completed',
      active: status === 'completed'
    }
  ];

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-6 lg:p-8">
      <h3 className="font-heading text-xl font-bold text-white mb-6">Stato Prenotazione</h3>
      
      <div className="relative border-l-2 border-border ml-4 space-y-8 pb-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.completed;
          const isActive = step.active;

          return (
            <div key={step.id} className="relative pl-8">
              <div 
                className={cn(
                  "absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-bg-surface transition-colors",
                  isCompleted ? "bg-success text-white" : isActive ? "bg-warning text-black" : "bg-bg-primary text-text-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              
              <div>
                <h4 className={cn("font-bold", isCompleted || isActive ? "text-white" : "text-text-secondary")}>
                  {step.title}
                </h4>
                <p className="text-sm text-text-secondary mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
