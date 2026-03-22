-- 1. Create coupons table
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update bookings table
ALTER TABLE bookings ADD COLUMN coupon_id UUID REFERENCES coupons(id);
ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;

-- 3. RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can check a coupon" ON coupons FOR SELECT USING (active = true);

-- 4. Basic test coupon
INSERT INTO coupons (code, discount_type, discount_value, usage_limit)
VALUES ('BENVENUTO10', 'percentage', 10.00, 100);
