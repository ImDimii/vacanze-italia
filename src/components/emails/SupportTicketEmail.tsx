import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Hr } from '@react-email/components';
import * as React from 'react';

interface SupportTicketEmailProps {
  userName: string;
  ticketSubject: string;
  isAdminAlert?: boolean;
  siteName?: string;
}

export default function SupportTicketEmail({
  userName = "Utente",
  ticketSubject = "Richiesta di supporto",
  isAdminAlert = false,
  siteName = "VacanzeItalia"
}: SupportTicketEmailProps) {

  const title = isAdminAlert ? 'Nuovo Ticket!' : 'Abbiamo ricevuto la tua richiesta';
  const message = isAdminAlert
    ? `L'utente ${userName} ha aperto un nuovo ticket di supporto con oggetto: "${ticketSubject}". Controlla il pannello admin.`
    : `Ciao ${userName},\n\nAbbiamo ricevuto correttamente la tua richiesta relativa a "${ticketSubject}".\n\nIl nostro team di supporto ti risponderà il prima possibile.`;

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>{siteName.toUpperCase()}</Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>
              {message.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </Text>
            
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
const heading = { fontSize: '24px', color: '#111827', margin: '0 0 20px', fontWeight: '300', textAlign: 'center' as const };
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#374151', margin: '0 0 30px', textAlign: 'center' as const };
const footer = { backgroundColor: '#111827', padding: '30px', textAlign: 'center' as const };
const footerText = { color: '#9ca3af', fontSize: '12px', lineHeight: '1.5', margin: '0' };
