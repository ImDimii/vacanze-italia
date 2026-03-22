import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import ReceiptUploadedEmail from '@/components/emails/ReceiptUploadedEmail';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const booking_id = formData.get('booking_id') as string;
    const file = formData.get('receipt_file') as File;
    const declared_amount = formData.get('declared_amount') as string;
    const transfer_date = formData.get('transfer_date') as string;

    if (!booking_id || !file) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // 1. Verify booking belongs to user and get basic details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, guest_id, host_id, property_id')
      .eq('id', booking_id)
      .single();

    if (bookingError || booking?.guest_id !== user.id) {
      return NextResponse.json({ error: 'Prenotazione non trovata o non autorizzato' }, { status: 403 });
    }

    // 2. Upload file to Supabase Storage (receipts bucket)
    const fileExt = file.name.split('.').pop();
    const fileName = `${booking_id}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('receipts')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Errore durante il caricamento del file' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);

    // 3. Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'receipt_uploaded',
        receipt_url: publicUrlData.publicUrl,
        // we might save the declared_amount and date if we added those to DB, 
        // for now we just change status and URL
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('DB update error:', updateError);
      return NextResponse.json({ error: 'Errore aggiornamento prenotazione' }, { status: 500 });
    }

    // 4. Trigger Email to Host
    // Fetch necessary details to avoid Foreign Key naming issues
    const { data: host } = await supabase.from('profiles').select('full_name, email').eq('id', booking.host_id).single();
    const { data: guest } = await supabase.from('profiles').select('full_name').eq('id', booking.guest_id).single();
    const { data: property } = await supabase.from('properties').select('title').eq('id', booking.property_id).single();

    if (host?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
      await sendEmail({
        to: host.email,
        subject: `Ricevuta caricata per ${property?.title || 'la proprietà'}`,
        react: ReceiptUploadedEmail({
          guestName: guest?.full_name || 'L\'Ospite',
          hostName: host?.full_name || 'Host',
          propertyName: property?.title || 'la proprietà',
          bookingUrl: `${baseUrl}/dashboard/host/bookings/${booking.id}`
        })
      });
    }

    return NextResponse.json({ success: true, receipt_url: publicUrlData.publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
