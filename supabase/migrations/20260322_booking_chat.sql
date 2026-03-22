-- 1. Abilita Realtime per la tabella messages (se non già abilitato)
-- Nota: Questo comando di solito si lancia una volta sola.
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Policy per consentire l'inserimento di messaggi ai partecipanti
CREATE POLICY "Partecipanti possono inviare messaggi"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT guest_id FROM bookings WHERE id = booking_id
      UNION
      SELECT host_id FROM bookings WHERE id = booking_id
    )
  );

-- 3. Policy per consentire la lettura (già presente ma assicuriamoci sia corretta)
-- DROP POLICY IF EXISTS "Partecipanti prenotazione vedono messaggi" ON messages;
-- CREATE POLICY "Partecipanti prenotazione vedono messaggi"
--   ON messages FOR SELECT USING (
--     auth.uid() IN (
--       SELECT guest_id FROM bookings WHERE id = booking_id
--       UNION
--       SELECT host_id FROM bookings WHERE id = booking_id
--     )
--   );
