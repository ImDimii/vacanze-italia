import { getSiteSettings, updateSiteSettings, sendTestEmails } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Settings, Save, Mail, Send } from 'lucide-react';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-accent-gold" />
          Impostazioni Sito
        </h1>
        <p className="text-text-secondary mt-2">
          Gestisci le informazioni globali del sito mostrate in tutte le pagine.
        </p>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-6">
        <form action={updateSiteSettings} className="space-y-10">
          
          {/* Sezione Base */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-xl font-bold text-white">Informazioni Base</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="site_name" className="text-sm font-medium text-text-primary block">
                Nome del Sito
              </label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                defaultValue={settings?.site_name || 'VacanzeItalia'}
                className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                placeholder="Es. VacanzeItalia"
                required
              />
              <p className="text-xs text-text-secondary">
                Questo nome apparirà nel menu di navigazione, nel footer e nei titoli delle pagine.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact_email" className="text-sm font-medium text-text-primary block">
                Email di Supporto
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                defaultValue={settings?.contact_email || ''}
                className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                placeholder="info@vacanzeitalia.it"
              />
              <p className="text-xs text-text-secondary">
                Email mostrata nel footer per l'assistenza agli utenti.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact_phone" className="text-sm font-medium text-text-primary block">
                Numero di Telefono
              </label>
              <input
                type="text"
                id="contact_phone"
                name="contact_phone"
                defaultValue={settings?.contact_phone || ''}
                className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                placeholder="+39 0123 456789"
              />
              <p className="text-xs text-text-secondary">
                Telefono mostrato nel footer per l'assistenza.
              </p>
            </div>
          </div>
          </div>

          {/* Sezione Email / SMTP */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-2 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent-gold" /> Configurazione Protocollo Email
              </h2>
              <label className="flex items-center cursor-pointer gap-2">
                <span className="text-sm font-medium text-text-secondary">Attiva Email:</span>
                <div className="relative">
                  <input type="checkbox" name="email_enabled" defaultChecked={settings?.email_enabled !== false} className="sr-only peer" />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
                </div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email_provider" className="text-sm font-medium text-text-primary block">
                  Provider Email
                </label>
                <select
                  id="email_provider"
                  name="email_provider"
                  defaultValue={settings?.email_provider || 'resend'}
                  className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                >
                  <option value="resend">Resend API (Raccomandato)</option>
                  <option value="smtp">SMTP Server Personalizzato</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="smtp_from_email" className="text-sm font-medium text-text-primary block">
                  Email Mittente (Da mostrare)
                </label>
                <input
                  type="email"
                  id="smtp_from_email"
                  name="smtp_from_email"
                  defaultValue={settings?.smtp_from_email || 'noreply@vacanzeitalia.it'}
                  className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                  placeholder="noreply@vacanzeitalia.it"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="resend_api_key" className="text-sm font-medium text-text-primary block">
                  Resend API Key
                </label>
                <input
                  type="password"
                  id="resend_api_key"
                  name="resend_api_key"
                  defaultValue={settings?.resend_api_key || ''}
                  className="w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                  placeholder="re_xxxxxxxxxxxxxx"
                />
                <p className="text-xs text-text-secondary">Necessario solo se usi Resend come provider.</p>
              </div>

              <div className="bg-bg-primary/50 border border-border rounded-xl p-4 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 border-b border-border/50 pb-2 mb-2">
                  <h3 className="text-sm font-bold text-white">Opzioni server SMTP</h3>
                  <p className="text-xs text-text-secondary">Compila solo se hai selezionato "SMTP Server Personalizzato".</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="smtp_host" className="text-sm font-medium text-text-primary block">SMTP Host</label>
                  <input type="text" id="smtp_host" name="smtp_host" defaultValue={settings?.smtp_host || ''} placeholder="smtp.gmail.com" className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2 text-white" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="smtp_port" className="text-sm font-medium text-text-primary block">SMTP Port</label>
                  <input type="number" id="smtp_port" name="smtp_port" defaultValue={settings?.smtp_port || 587} className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2 text-white" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="smtp_user" className="text-sm font-medium text-text-primary block">SMTP User / Email</label>
                  <input type="text" id="smtp_user" name="smtp_user" defaultValue={settings?.smtp_user || ''} className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2 text-white" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="smtp_password" className="text-sm font-medium text-text-primary block">SMTP Password</label>
                  <input type="password" id="smtp_password" name="smtp_password" defaultValue={settings?.smtp_password || ''} className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2 text-white" />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-accent-gold text-black hover:bg-[#d4b568] flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salva Impostazioni
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white border-b border-border pb-2 mb-6">Invia Sample di Test</h2>
        <p className="text-sm text-text-secondary mb-4">Manda un file campione di ciascun template (Request, Uploaded, Status) in prova.</p>
        <form action={sendTestEmails} className="flex gap-4 max-w-md">
          <input
            type="email"
            name="test_email"
            className="flex-1 bg-bg-primary border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-gold"
            placeholder="latua@email.com"
            required
          />
          <Button type="submit" className="bg-black text-white border border-accent-gold hover:bg-accent-gold hover:text-black">
            <Send className="w-4 h-4 mr-2" /> Test
          </Button>
        </form>
      </div>
    </div>
  );
}
