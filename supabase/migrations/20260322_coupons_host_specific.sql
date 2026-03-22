-- 1. Add host_id to coupons
ALTER TABLE coupons ADD COLUMN host_id UUID REFERENCES profiles(id);

-- 2. Update RLS for coupons
-- Hosts can manage their own coupons
CREATE POLICY "Hosts can manage their coupons" 
  ON coupons FOR ALL 
  USING (auth.uid() = host_id);

-- 3. Update existing coupon (if any) to a real user or just delete for clean state
DELETE FROM coupons;

-- 4. Ensure RLS is active
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
