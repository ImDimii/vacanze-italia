import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Hr } from '@react-email/components';
import * as React from 'react';

interface PropertyStatusEmailProps {
  hostName: string;
  propertyName: string;
  status: 'published' | 'hidden';
  dashboardUrl: string;
  siteName?: string;
}

export default function PropertyStatusEmail({
  hostName = "Host",
  propertyName = "La tua struttura",
  status = 'published',
  dashboardUrl = "#",
  siteName = "VacanzeItalia"
}: PropertyStatusEmailProps) {

  const isPublished = status === 'published';
  const title = isPublished ? 'Struttura Pubblicata' : 'Struttura Sospesa';
  const preview = isPublished ? 'La tua proprietà è ora visibile' : 'Aggiornamento sullo stato della tua proprietà';
  const message = isPublished
    ? `Complimenti ${hostName}! La tua proprietà "${propertyName}" è stata esaminata ed è ora ufficialmente PUBBLICATA e visibile a tutti i nostri ospiti.`
    : `Gentile ${hostName}, ti informiamo che la tua proprietà "${propertyName}" è stata temporaneamente nascosta dai risultati di ricerca.`;

  const btnColor = isPublished ? '#D4AF37' : '#000000';
  const btnTextColor = isPublished ? '#000000' : '#FFFFFF';

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>{siteName.toUpperCase()}</Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>
              {message}
            </Text>
            
            <Section style={btnContainer}>
              <Button style={{...button, backgroundColor: btnColor, color: btnTextColor}} href={dashboardUrl}>
                Gestisci Strutture
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
const btnContainer = { textAlign: 'center' as const };
const button = { padding: '16px 32px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textDecoration: 'none', textTransform: 'uppercase' as const, display: 'inline-block', border: '1px solid #D4AF37' };
const footer = { backgroundColor: '#111827', padding: '30px', textAlign: 'center' as const };
const footerText = { color: '#9ca3af', fontSize: '12px', lineHeight: '1.5', margin: '0' };
