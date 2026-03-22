import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateBookingPrice } from '@/lib/booking-utils';
import { sendEmail } from '@/lib/email';
import BookingRequestEmail from '@/components/emails/BookingRequestEmail';
import { z } from 'zod';

const bookingSchema = z.object({
  property_id: z.string().uuid(),
  check_in: z.string(),
  check_out: z.string(),
  num_guests: z.number().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = bookingSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
    }

    const { property_id, check_in, check_out, num_guests } = result.data;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // 1. Get property details
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .single();

    if (propError || !property) {
      return NextResponse.json({ error: 'Proprietà non trovata' }, { status: 404 });
    }

    // Fetch host details separately to avoid FK joining issues
    const { data: hostProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', property.host_id)
      .single();

    if (property.status === 'deleted' || !property.is_published) {
      return NextResponse.json({ error: 'Questa proprietà non è attualmente prenotabile' }, { status: 400 });
    }

    // 2. Check availability (simplified for now: no overlapping confirmed/uploaded bookings)
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', property_id)
      .in('status', ['confirmed', 'receipt_uploaded', 'pending_payment'])
      .or(`and(check_in.lt.${check_out},check_out.gt.${check_in})`);

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json({ error: 'Date non disponibili' }, { status: 400 });
    }

    // 3. Calculate price
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const prices = calculateBookingPrice(
      property.price_per_night,
      property.cleaning_fee,
      property.security_deposit,
      checkInDate,
      checkOutDate,
      property.seasonal_prices || []
    );

    // 4. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id,
        guest_id: user.id,
        host_id: property.host_id,
        check_in,
        check_out,
        num_guests,
        nights: prices.nights,
        price_per_night: property.price_per_night,
        cleaning_fee: property.cleaning_fee,
        security_deposit: property.security_deposit,
        subtotal: prices.subtotal,
        total_price: prices.totalPrice,
        deposit_amount: prices.depositAmount,
        balance_amount: prices.balanceAmount,
        status: 'pending_payment'
      })
      .select()
      .single();

    if (bookingError) {
      console.error(bookingError);
      return NextResponse.json({ error: 'Errore durante la creazione della prenotazione' }, { status: 500 });
    }

    // 5. Send emails
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vacanzeitalia.it';
    
    // To Guest
    await sendEmail({
      to: user.email!,
      subject: `Richiesta Inviata: ${property.title}`,
      react: BookingRequestEmail({
        guestName: user.user_metadata?.full_name || 'Ospite',
        hostName: hostProfile?.full_name || 'Host',
        propertyName: property.title,
        checkIn: checkInDate.toLocaleDateString('it-IT'),
        checkOut: checkOutDate.toLocaleDateString('it-IT'),
        totalPrice: `€${prices.totalPrice.toFixed(2)}`,
        isToHost: false,
        bookingUrl: `${baseUrl}/dashboard/bookings/${booking.id}`
      })
    });

    // To Host
    if (hostProfile?.email) {
      await sendEmail({
        to: hostProfile.email,
        subject: `Nuova Richiesta per ${property.title}`,
        react: BookingRequestEmail({
          guestName: user.user_metadata?.full_name || 'Ospite',
          hostName: hostProfile.full_name || 'Host',
          propertyName: property.title,
          checkIn: checkInDate.toLocaleDateString('it-IT'),
          checkOut: checkOutDate.toLocaleDateString('it-IT'),
          totalPrice: `€${prices.totalPrice.toFixed(2)}`,
          isToHost: true,
          bookingUrl: `${baseUrl}/dashboard/host/bookings/${booking.id}`
        })
      });
    }

    return NextResponse.json({ 
      booking_id: booking.id,
      redirect: `/dashboard/bookings/${booking.id}` 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
