# 🇮🇹 Vacanze Italia - Premium Vacation Rental Platform

Vacanze Italia è una piattaforma di prenotazione alloggi di lusso focalizzata sul mercato italiano. Progettata per offrire un'esperienza utente premium simile ad Airbnb, ma con un tocco tipicamente italiano e un sistema di gestione pagamenti sicuro tramite bonifico bancario.

![Vacanze Italia]
## 🚀 Caratteristiche Principali

### 🏨 Per gli Ospiti
- **Ricerca Intuitiva**: Filtra gli alloggi per categoria e località.
- **Mappa Interattiva**: Visualizza la posizione esatta degli alloggi tramite integrazione Mapbox.
- **Sistema di Prenotazione Real-time**: Ricevi aggiornamenti istantanei sullo stato della tua prenotazione (richiesta, pagamento in verifica, confermata).
- **Gestione Ricevute**: Carica la ricevuta del bonifico direttamente nella piattaforma per una validazione veloce.
- **Dashboard Personale**: Visualizza i tuoi viaggi passati e futuri con dettagli su indirizzi e contatti host.

### 🏠 Per gli Host
- **Host Dashboard Completa**: Monitora guadagni netti, commissioni e statistiche di occupazione.
- **Gestione Prenotazioni**: Approva o rifiuta richieste, verifica le ricevute di pagamento caricate dagli ospiti.
- **Pubblicazione Alloggi**: Processo guidato per caricare foto, descrizioni, servizi e prezzi stagionali.
- **Calendario Disponibilità**: Blocca date manualmente o gestisci le prenotazioni in arrivo.

### 🛡️ Pannello Amministratore
- **Gestione Utenti**: Gestione ruoli (Admin/Ospite/Host) e possibilità di eliminare account in modo sicuro.
- **Approvazione Host**: Sistema di verifica per i nuovi utenti che desiderano diventare host.
- **Impostazioni Sito**: Configurazione globale delle commissioni della piattaforma.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
- **Email**: [Resend](https://resend.com/) con [React Email](https://react.email/)
- **Mappe**: [Mapbox GL JS](https://www.mapbox.com/)
- **Animazioni**: [Framer Motion](https://www.framer.com/motion/)
- **Icone**: [Lucide React](https://lucide.dev/)

## 📦 Installazione

1. **Clona il repository**:
```bash
git clone https://github.com/Imdimii/vacanze-italia.git
cd vacanze-italia
```

2. **Installa le dipendenze**:
```bash
npm install
```

3. **Configura le variabili d'ambiente**:
Crea un file `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=tuo_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua_anon_key
SUPABASE_SERVICE_ROLE_KEY=tua_service_role_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tuo_token_mapbox
RESEND_API_KEY=tua_key_resend
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Avvia il server di sviluppo**:
```bash
npm run dev
```

## 🌐 Distribuzione

Il progetto è ottimizzato per essere distribuito su **Vercel**. Assicurati di configurare le stesse variabili d'ambiente nel pannello di controllo di Vercel.

---

Sviluppato con ❤️ per il turismo italiano.
