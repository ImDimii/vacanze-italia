'use client';

import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DownloadVoucherButtonProps {
  booking: any;
}

export function DownloadVoucherButton({ booking }: DownloadVoucherButtonProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(31, 31, 31); // Dark background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('VACANZE ITALIA', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Voucher di Conferma Prenotazione', 20, 32);

    // Booking ID & Info
    doc.setTextColor(31, 31, 31);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Codice Prenotazione: ${booking.id.split('-')[0].toUpperCase()}`, 20, 55);
    doc.text(`Data Emissione: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 70, 55);

    // Tables
    autoTable(doc, {
      startY: 65,
      head: [['Dettagli Alloggio', '']],
      body: [
        ['Proprietà', booking.property.title],
        ['Indirizzo', `${booking.property.location_address}, ${booking.property.location_city}`],
        ['Host', booking.property.host?.full_name || 'Host Vacanze Italia'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [196, 161, 107], textColor: 255 }, // Accent Gold
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Dettagli Soggiorno', '']],
      body: [
        ['Check-in', format(new Date(booking.check_in), 'dd MMMM yyyy', { locale: it })],
        ['Check-out', format(new Date(booking.check_out), 'dd MMMM yyyy', { locale: it })],
        ['Notti', `${booking.nights}`],
        ['Ospiti', `${booking.num_guests}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [196, 161, 107], textColor: 255 },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Riepilogo Economico', '']],
      body: [
        ['Totale Soggiorno', `EUR ${booking.total_price.toFixed(2)}`],
        ['Caparra Versata', `EUR ${booking.deposit_amount.toFixed(2)}`],
        ['Saldo da pagare all\'arrivo', `EUR ${booking.balance_amount.toFixed(2)}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Grazie per aver scelto Vacanze Italia. Ti auguriamo un piacevole soggiorno!', pageWidth / 2, finalY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Questo documento è un voucher di conferma. Presentalo all\'host al momento del check-in.', pageWidth / 2, finalY + 10, { align: 'center' });

    // Save
    doc.save(`Voucher_${booking.id.split('-')[0]}.pdf`);
  };

  return (
    <Button 
      onClick={generatePDF}
      variant="outline" 
      className="w-full h-12 border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-black transition-all flex items-center gap-2 rounded-xl group"
    >
      <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
      <span className="font-bold uppercase tracking-widest text-[10px]">Scarica Voucher PDF</span>
    </Button>
  );
}
