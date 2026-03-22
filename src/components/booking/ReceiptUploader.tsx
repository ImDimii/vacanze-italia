'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface ReceiptUploaderProps {
  bookingId: string;
  expectedAmount: number;
}

export function ReceiptUploader({ bookingId, expectedAmount }: ReceiptUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState(expectedAmount.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('receipt_file', file);
      formData.append('declared_amount', amount);
      formData.append('transfer_date', date);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 20, 90));
      }, 500);

      const res = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      
      if (res.ok) {
        setProgress(100);
        setTimeout(() => setSuccess(true), 500);
      } else {
        alert("Errore durante l'upload");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-2xl p-8 text-center flex flex-col items-center">
        <CheckCircle className="w-16 h-16 text-success mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Ricevuta inviata con successo!</h3>
        <p className="text-text-secondary">L'host verificherà il pagamento a breve e confermerà la prenotazione.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-6 lg:p-8">
      <h3 className="font-heading text-2xl font-bold text-white mb-6">Carica la Ricevuta</h3>
      
      <div className="space-y-6">
        <div 
          className="border-2 border-dashed border-accent-gold/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-accent-gold/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <>
              <File className="w-12 h-12 text-accent-gold mb-4" />
              <p className="text-white font-medium text-center truncate w-full max-w-xs">{file.name}</p>
              <p className="text-text-secondary text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-accent-gold mb-4" />
              <p className="text-white font-medium mb-1">Clicca per selezionare il file</p>
              <p className="text-text-secondary text-sm">Supportati: PDF, JPG, PNG (Max 10MB)</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-text-primary">Importo effettivo bonifico (€)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="bg-bg-primary text-white border-border" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-primary">Data bonifico</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="bg-bg-primary text-white border-border dark:[color-scheme:dark]" 
            />
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Caricamento in corso...</span>
              <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-bg-primary [&>div]:bg-accent-gold" />
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          className="w-full bg-accent-gold text-black hover:bg-[#d4b568] h-12 text-base font-bold"
        >
          {uploading ? 'Caricamento...' : 'Invia Ricevuta'}
        </Button>
      </div>
    </div>
  );
}
