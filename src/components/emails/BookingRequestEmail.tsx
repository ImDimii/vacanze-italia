import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Hr } from '@react-email/components';
import * as React from 'react';

interface BookingRequestEmailProps {
  guestName: string;
  hostName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  isToHost: boolean;
  bookingUrl: string;
  siteName?: string;
}

export default function BookingRequestEmail({
  guestName = "Ospite",
  hostName = "Host",
  propertyName = "Proprietà",
  checkIn = "10/08/2026",
  checkOut = "24/08/2026",
  totalPrice = "€ 1.200,00",
  isToHost = false,
  bookingUrl = "#",
  siteName = "VacanzeItalia"
}: BookingRequestEmailProps) {
  const mainText = isToHost
    ? `Ciao ${hostName}, hai ricevuto una nuova richiesta di prenotazione per la tua struttura da parte di ${guestName}.`
    : `Ciao ${guestName}, la tua richiesta di prenotazione è in attesa di conferma e pagamento dell'acconto.`;

  const btnText = isToHost ? 'Vedi Dettagli Prenotazione' : 'Istruzioni e Stato';

  return (
    <Html>
      <Head />
      <Preview>{isToHost ? 'Nuova richiesta di prenotazione su VacanzeItalia' : 'La tua richiesta di prenotazione è stata inviata'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>{siteName.toUpperCase()}</Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>{isToHost ? 'Nuova Richiesta' : 'Richiesta Inviata'}</Heading>
            <Text style={paragraph}>{mainText}</Text>
            
            <Section style={detailsBox}>
              <Text style={detailRow}><span style={detailLabel}>Proprietà:</span> <span style={detailValue}>{propertyName}</span></Text>
              <Hr style={innerHr} />
              <Text style={detailRow}><span style={detailLabel}>Check-in:</span> <span style={detailValue}>{checkIn}</span></Text>
              <Hr style={innerHr} />
              <Text style={detailRow}><span style={detailLabel}>Check-out:</span> <span style={detailValue}>{checkOut}</span></Text>
              <Hr style={innerHr} />
              <Text style={detailRow}><span style={detailLabel}>Totale:</span> <span style={detailValue}>{totalPrice}</span></Text>
            </Section>

            <Section style={btnContainer}>
              <Button style={button} href={bookingUrl}>
                {btnText}
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Il nuovo standard dell'ospitalità italiana.<br/>
              © {new Date().getFullYear()} {siteName}. Tutti i diritti riservati.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f4f4f5', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '40px auto', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', maxWidth: '600px' };
const header = { backgroundColor: '#000000', padding: '30px', textAlign: 'center' as const };
const logoText = { color: '#D4AF37', fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', margin: '0' };
const content = { padding: '40px' };
const heading = { fontSize: '28px', color: '#111827', margin: '0 0 20px', fontWeight: '300', textAlign: 'center' as const };
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#374151', margin: '0 0 30px', textAlign: 'center' as const };
const detailsBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '24px', marginBottom: '30px' };
const detailRow = { display: 'flex', justifyContent: 'space-between', margin: '12px 0', fontSize: '15px' };
const detailLabel = { color: '#6b7280', fontWeight: '500' };
const detailValue = { color: '#111827', fontWeight: '600', textAlign: 'right' as const };
const innerHr = { borderColor: '#f3f4f6', margin: '8px 0' };
const btnContainer = { textAlign: 'center' as const };
const button = { backgroundColor: '#D4AF37', color: '#000000', padding: '16px 32px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textDecoration: 'none', textTransform: 'uppercase' as const, display: 'inline-block' };
const footer = { backgroundColor: '#111827', padding: '30px', textAlign: 'center' as const };
const footerText = { color: '#9ca3af', fontSize: '12px', lineHeight: '1.5', margin: '0' };
