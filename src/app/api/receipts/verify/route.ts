import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import BookingStatusEmail from '@/components/emails/BookingStatusEmail';
import { createInternalNotification } from '@/app/actions/notification';

export async function POST(req: Request) {
  try {
    const { booking_id, status, reason } = await req.json();

    if (!booking_id || !status || !['confirmed', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, host_id, guest_id, status, property_id')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: `Prenotazione non trovata: ${bookingError?.message || 'Nessun record'}` }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (booking.host_id !== user.id && !profile?.is_admin) {
       return NextResponse.json({ error: 'Non sei autorizzato a verificare questa ricevuta' }, { status: 403 });
    }

    if (status !== 'completed' && booking.status !== 'receipt_uploaded') {
      return NextResponse.json({ error: 'La ricevuta non è in stato di verifica' }, { status: 400 });
    }
    
    if (status === 'completed' && booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'La prenotazione deve essere confermata prima di essere completata' }, { status: 400 });
    }

    // Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status }) // 'confirmed' or 'rejected'
      .eq('id', booking_id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
    }

    // Send Email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
    const { data: guest } = await supabase.from('profiles').select('full_name, email').eq('id', booking.guest_id).single();
    const { data: property } = await supabase.from('properties').select('title').eq('id', booking.property_id).single();

    if (guest?.email) {
      if (status === 'confirmed') {
        await sendEmail({
          to: guest.email,
          subject: `Prenotazione Confermata - ${property?.title || 'la proprietà'}`,
          react: BookingStatusEmail({
            guestName: guest?.full_name || 'Ospite',
            propertyName: property?.title || 'la proprietà',
            status: 'confirmed',
            bookingUrl: `${baseUrl}/dashboard/bookings/${booking.id}`
          })
        });
      } else if (status === 'rejected') {
        await sendEmail({
          to: guest.email,
          subject: `Problema con la prenotazione - ${property?.title || 'la proprietà'}`,
          react: BookingStatusEmail({
            guestName: guest?.full_name || 'Ospite',
            propertyName: property?.title || 'la proprietà',
            status: 'cancelled',
            bookingUrl: `${baseUrl}/dashboard/bookings/${booking.id}`
          })
        });
      }
    }

    // Create Notification for the guest
    try {
      const notifyTitle = status === 'confirmed' ? 'Prenotazione Confermata!' : 
                          status === 'rejected' ? 'Problema con il pagamento' :
                          status === 'completed' ? 'Soggiorno completato' : 'Aggiornamento prenotazione';
      
      const notifyContent = status === 'confirmed' ? `La tua prenotazione per ${property?.title || 'la struttura'} è stata confermata. Ci vediamo presto!` :
                            status === 'rejected' ? `La ricevuta per ${property?.title || 'la struttura'} è stata rifiutata: ${reason || 'contatta l\'host per dettagli'}.` :
                            status === 'completed' ? `Speriamo che il tuo soggiorno a ${property?.title || 'la struttura'} sia stato fantastico!` : 'Stato aggiornato.';

      await createInternalNotification(
        booking.guest_id,
        'booking_update',
        notifyTitle,
        notifyContent,
        `/dashboard/bookings/${booking.id}`
      );
    } catch (err) {
      console.error('Notification error:', err);
    }

    return NextResponse.json({ success: true, new_status: status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
