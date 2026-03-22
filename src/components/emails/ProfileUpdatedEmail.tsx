import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Hr } from '@react-email/components';
import * as React from 'react';

interface ProfileUpdatedEmailProps {
  userName: string;
  updateTime: string;
  accountUrl: string;
  siteName?: string;
}

export default function ProfileUpdatedEmail({
  userName = "Utente",
  updateTime = "recentemente",
  accountUrl = "#",
  siteName = "VacanzeItalia"
}: ProfileUpdatedEmailProps) {

  return (
    <Html>
      <Head />
      <Preview>Avviso di sicurezza: aggiornamento profilo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>{siteName.toUpperCase()}</Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Profilo Aggiornato</Heading>
            <Text style={paragraph}>
              Ciao {userName},<br/><br/>
              Ti informiamo che i dati del tuo profilo sono stati aggiornati il {updateTime}.
            </Text>
            
            <Section style={alertBox}>
              <Text style={alertText}>
                Se sei stato tu a effettuare questa modifica, puoi ignorare questa email. In caso contrario, ti preghiamo di controllare subito il tuo account.
              </Text>
            </Section>

            <Section style={btnContainer}>
              <Button style={button} href={accountUrl}>
                Vedi il tuo Profilo
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
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#374151', margin: '0 0 30px', textAlign: 'left' as const };
const alertBox = { backgroundColor: '#f9fafb', borderLeft: '4px solid #D4AF37', padding: '16px 20px', marginBottom: '30px' };
const alertText = { color: '#4b5563', margin: '0', fontSize: '15px', lineHeight: '1.5' };
const btnContainer = { textAlign: 'center' as const };
const button = { backgroundColor: '#000000', color: '#D4AF37', padding: '16px 32px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textDecoration: 'none', textTransform: 'uppercase' as const, display: 'inline-block', border: '1px solid #D4AF37' };
const footer = { backgroundColor: '#111827', padding: '30px', textAlign: 'center' as const };
const footerText = { color: '#9ca3af', fontSize: '12px', lineHeight: '1.5', margin: '0' };
