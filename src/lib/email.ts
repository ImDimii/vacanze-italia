import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { getSiteSettings } from '@/app/actions/settings';
import { render } from '@react-email/components';
import React from 'react';

export async function sendEmail({ to, subject, react }: { to: string | string[], subject: string, react: React.ReactElement }) {
  const settings = await getSiteSettings();
  
  if (settings && settings.email_enabled === false) {
    console.log('[Mock Email - Emails Disabled globally in Settings] To:', to, 'Subject:', subject);
    return { success: true, mock: true, reason: 'emails_disabled' };
  }

  const provider = settings?.email_provider || 'resend';
  const siteName = settings?.site_name || 'VacanzeItalia';
  const fromEmail = settings?.smtp_from_email || 'noreply@vacanzeitalia.it';
  const senderString = `${siteName} <${fromEmail}>`;

  if (provider === 'smtp') {
    if (!settings?.smtp_host || !settings?.smtp_user) {
      console.log('[Mock Email - SMTP Missing Credentials] To:', to, 'Subject:', subject);
      return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port || 587,
      secure: settings.smtp_port === 465,
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password,
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    try {
      const html = await render(React.cloneElement(react as React.ReactElement<any>, { siteName }));
      const info = await transporter.sendMail({
        from: senderString,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });
      return { success: true, data: info };
    } catch (error) {
      console.error('SMTP Error:', error);
      return { success: false, error };
    }
  } else {
    // Protocollo Resend
    const apiKey = settings?.resend_api_key || process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log('[Mock Email - Resend Key Missing] To:', to, 'Subject:', subject);
      return { success: true, mock: true };
    }

    const resend = new Resend(apiKey);
    try {
      const data = await resend.emails.send({
        from: senderString,
        to: Array.isArray(to) ? to : [to],
        subject,
        react: React.cloneElement(react as React.ReactElement<any>, { siteName }),
      });
      return { success: true, data };
    } catch (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
  }
}
