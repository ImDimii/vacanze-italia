-- ESTENSIONI
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- TABELLA: profiles
-- ======================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  is_host BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  iban TEXT,              -- IBAN host per bonifico
  bank_holder TEXT,       -- Intestatario conto host
  bank_name TEXT,         -- Nome banca host
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- TABELLA: categories
-- ======================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Mare', 'mare', 'Waves', 1),
  ('Montagna', 'montagna', 'Mountain', 2),
  ('Città', 'citta', 'Building2', 3),
  ('Villa', 'villa', 'Home', 4),
  ('Lago', 'lago', 'Droplets', 5),
  ('Campagna', 'campagna', 'TreePine', 6),
  ('Lusso', 'lusso', 'Crown', 7),
  ('Economico', 'economico', 'Tag', 8);

-- ======================
-- TABELLA: properties
-- ======================
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_province TEXT,
  location_country TEXT NOT NULL DEFAULT 'Italia',
  location_lat DECIMAL(9,6),
  location_lng DECIMAL(9,6),
  price_per_night DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  security_deposit DECIMAL(10,2) DEFAULT 0,  -- caparra danni (pagata in contanti all'arrivo)
  max_guests INTEGER NOT NULL DEFAULT 2,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  beds INTEGER NOT NULL DEFAULT 1,
  min_nights INTEGER DEFAULT 2,
  max_nights INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  cover_image TEXT,
  amenities TEXT[] DEFAULT '{}',
  rules TEXT,
  check_in_time TEXT DEFAULT '15:00',
  check_out_time TEXT DEFAULT '11:00',
  cancellation_policy TEXT DEFAULT 'moderate',  -- flexible / moderate / strict
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- TABELLA: bookings
-- ======================
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  host_id UUID REFERENCES profiles(id) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,     -- prezzo_notte × notti
  total_price DECIMAL(10,2) NOT NULL,  -- subtotal + cleaning_fee
  deposit_amount DECIMAL(10,2) NOT NULL, -- 50% del total_price (da pagare tramite bonifico)
  balance_amount DECIMAL(10,2) NOT NULL, -- 50% rimanente (da pagare in contanti all'arrivo)
  status TEXT DEFAULT 'pending_payment' CHECK (
    status IN ('pending_payment','receipt_uploaded','confirmed','cancelled','completed','refunded','cancellation_requested')
  ),
  special_requests TEXT,
  -- Dati bonifico
  receipt_url TEXT,                    -- URL ricevuta su Supabase Storage
  receipt_uploaded_at TIMESTAMPTZ,
  receipt_verified_at TIMESTAMPTZ,
  receipt_verified_by UUID REFERENCES profiles(id),
  receipt_rejection_reason TEXT,       -- motivo rifiuto ricevuta
  -- Dati pagamento saldo contanti
  balance_paid_at TIMESTAMPTZ,
  balance_confirmed_by UUID REFERENCES profiles(id),
  -- Cancellazione
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- TABELLA: reviews
-- ======================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_cleanliness INTEGER CHECK (rating_cleanliness BETWEEN 1 AND 5),
  rating_accuracy INTEGER CHECK (rating_accuracy BETWEEN 1 AND 5),
  rating_communication INTEGER CHECK (rating_communication BETWEEN 1 AND 5),
  rating_location INTEGER CHECK (rating_location BETWEEN 1 AND 5),
  rating_value INTEGER CHECK (rating_value BETWEEN 1 AND 5),
  comment TEXT,
  host_reply TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- TABELLA: favorites
-- ======================
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ======================
-- TABELLA: messages
-- ======================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- TABELLA: blocked_dates
-- ======================
CREATE TABLE blocked_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  reason TEXT,
  UNIQUE(property_id, date)
);

-- ======================
-- TABELLA: site_settings
-- ======================
-- Impostazioni globali del sito gestibili dall'admin
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,    -- riga unica
  site_name TEXT DEFAULT 'VacanzeItalia',
  site_tagline TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  -- Dati bancari DEFAULT (usati se host non ha IBAN proprio,
  --   oppure se il gestore vuole centralizzare tutti i bonifici)
  bank_holder TEXT DEFAULT 'Mario Rossi',
  bank_iban TEXT DEFAULT 'IT60 X054 2811 1010 0000 0123 456',
  bank_name TEXT DEFAULT 'Banca Intesa',
  bank_bic TEXT DEFAULT 'BCITITMM',
  -- Commissione piattaforma (%)
  platform_fee_pct DECIMAL(5,2) DEFAULT 0,
  -- Tempo massimo caricamento ricevuta (ore) prima che la prenotazione scada
  receipt_deadline_hours INTEGER DEFAULT 48,
  -- Testo policy cancellazione
  cancellation_policy_flexible TEXT,
  cancellation_policy_moderate TEXT,
  cancellation_policy_strict TEXT,
  
  -- Impostazioni Email Config
  email_provider TEXT DEFAULT 'resend',
  resend_api_key TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT DEFAULT 'noreply@vacanzeitalia.it',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings DEFAULT VALUES;

-- ======================
-- ROW LEVEL SECURITY
-- ======================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profilo pubblico leggibile"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Utente modifica proprio profilo"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- properties
CREATE POLICY "Proprietà pubblicate visibili a tutti"
  ON properties FOR SELECT USING (is_published = true);
CREATE POLICY "Host vede tutte le proprie proprietà"
  ON properties FOR SELECT USING (auth.uid() = host_id);
CREATE POLICY "Host gestisce proprie proprietà"
  ON properties FOR ALL USING (auth.uid() = host_id);

-- bookings
CREATE POLICY "Ospite vede proprie prenotazioni"
  ON bookings FOR SELECT USING (auth.uid() = guest_id);
CREATE POLICY "Host vede prenotazioni sulla propria proprietà"
  ON bookings FOR SELECT USING (auth.uid() = host_id);
CREATE POLICY "Ospite crea prenotazione"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "Ospite aggiorna propria prenotazione (solo receipt_url)"
  ON bookings FOR UPDATE USING (auth.uid() = guest_id);

-- reviews
CREATE POLICY "Recensioni visibili a tutti"
  ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Utente autenticato scrive recensione"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- favorites
CREATE POLICY "Utente gestisce propri preferiti"
  ON favorites FOR ALL USING (auth.uid() = user_id);

-- messages
CREATE POLICY "Partecipanti prenotazione vedono messaggi"
  ON messages FOR SELECT USING (
    auth.uid() IN (
      SELECT guest_id FROM bookings WHERE id = booking_id
      UNION
      SELECT host_id FROM bookings WHERE id = booking_id
    )
  );

-- site_settings
CREATE POLICY "Tutti possono leggere impostazioni sito"
  ON site_settings FOR SELECT USING (true);

-- ======================
-- TRIGGER: auto-crea profilo
-- ======================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ======================
-- TRIGGER: aggiorna rating proprietà
-- ======================
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE property_id = NEW.property_id AND is_visible = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id AND is_visible = true
    )
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_property_rating();

-- ======================
-- TRIGGER: aggiorna updated_at
-- ======================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
