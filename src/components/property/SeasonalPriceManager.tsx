'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Calendar, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SeasonalPrice {
  id?: string;
  start_date: string;
  end_date: string;
  price: number;
  label: string;
}

interface SeasonalPriceManagerProps {
  prices: SeasonalPrice[];
  onChange: (prices: SeasonalPrice[]) => void;
}

export function SeasonalPriceManager({ prices, onChange }: SeasonalPriceManagerProps) {
  const [newPrice, setNewPrice] = useState<Partial<SeasonalPrice>>({
    start_date: '',
    end_date: '',
    price: 0,
    label: ''
  });

  const handleAdd = () => {
    if (!newPrice.start_date || !newPrice.end_date || !newPrice.price) return;
    onChange([...prices, newPrice as SeasonalPrice]);
    setNewPrice({ start_date: '', end_date: '', price: 0, label: '' });
  };

  const handleRemove = (index: number) => {
    onChange(prices.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-primary/30 border border-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-gold" />
          Aggiungi Periodo Speciale
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-xs text-text-secondary uppercase">Inizio</Label>
            <Input 
              type="date" 
              value={newPrice.start_date} 
              onChange={e => setNewPrice(prev => ({ ...prev, start_date: e.target.value }))}
              className="bg-bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-text-secondary uppercase">Fine</Label>
            <Input 
              type="date" 
              value={newPrice.end_date} 
              onChange={e => setNewPrice(prev => ({ ...prev, end_date: e.target.value }))}
              className="bg-bg-surface border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-xs text-text-secondary uppercase">Prezzo per notte (€)</Label>
            <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input 
                type="number" 
                value={newPrice.price || ''} 
                onChange={e => setNewPrice(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="bg-bg-surface border-border pl-10"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-text-secondary uppercase">Etichetta (es. Agosto)</Label>
            <Input 
              type="text" 
              value={newPrice.label} 
              onChange={e => setNewPrice(prev => ({ ...prev, label: e.target.value }))}
              className="bg-bg-surface border-border"
              placeholder="Es. Alta Stagione"
            />
          </div>
        </div>

        <Button 
          type="button"
          onClick={handleAdd}
          disabled={!newPrice.start_date || !newPrice.end_date || !newPrice.price}
          className="w-full bg-accent-gold text-black hover:bg-[#d4b568] font-bold py-6 rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" /> Aggiungi Periodo
        </Button>
      </div>

      <div className="space-y-3">
        {prices.length === 0 ? (
          <p className="text-sm text-text-secondary italic text-center py-4">Nessun periodo speciale configurato.</p>
        ) : (
          prices.map((price, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-bg-surface border border-border rounded-xl group hover:border-accent-gold/50 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">€{price.price}</span>
                  {price.label && <span className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full font-bold uppercase">{price.label}</span>}
                </div>
                <p className="text-xs text-text-secondary">
                  Dal {format(new Date(price.start_date), 'dd MMM yyyy', { locale: it })} al {format(new Date(price.end_date), 'dd MMM yyyy', { locale: it })}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemove(index)}
                className="text-text-secondary hover:text-error hover:bg-error/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
