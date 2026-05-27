-- =============================================
-- NEXUS APP — Supabase Database Schema
-- Supabase SQL Editor ga ko'chiring va ishga tushiring
-- =============================================

-- 1. FOYDALANUVCHILAR (profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  nexus_id TEXT UNIQUE, -- @username
  nexus_score INTEGER DEFAULT 100,
  streak_days INTEGER DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  plan TEXT DEFAULT 'free', -- free, standard, pro
  language TEXT DEFAULT 'uz',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GAP GURUHLAR
CREATE TABLE gap_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  monthly_amount BIGINT NOT NULL, -- so'mda
  total_members INTEGER DEFAULT 0,
  current_turn INTEGER DEFAULT 0,
  turn_order TEXT DEFAULT 'random', -- random, order, agreement
  status TEXT DEFAULT 'active', -- active, paused, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GAP A'ZOLAR
CREATE TABLE gap_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES gap_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  turn_number INTEGER NOT NULL,
  has_received BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 4. GAP TO'LOVLAR
CREATE TABLE gap_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES gap_groups(id) ON DELETE CASCADE,
  from_user UUID REFERENCES profiles(id),
  to_user UUID REFERENCES profiles(id),
  amount BIGINT NOT NULL,
  month_year TEXT NOT NULL, -- '2025-06'
  status TEXT DEFAULT 'pending', -- pending, confirmed, late
  payment_method TEXT DEFAULT 'manual', -- manual, payme, click
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TO'YONA TADBIRLAR
CREATE TABLE toyona_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id),
  owner_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- toy, xatna, tugma, yangi_uy, bitiruv, motam
  event_date DATE NOT NULL,
  target_amount BIGINT,
  collected_amount BIGINT DEFAULT 0,
  description TEXT,
  share_link TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  status TEXT DEFAULT 'active', -- active, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TO'YONA YOZUVLAR (daftar)
CREATE TABLE toyona_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES toyona_events(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES profiles(id),
  guest_name TEXT NOT NULL,
  amount BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TO'YONA TARIX (kim kimga qancha bergan)
CREATE TABLE toyona_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user UUID REFERENCES profiles(id),
  to_user UUID REFERENCES profiles(id),
  event_id UUID REFERENCES toyona_events(id),
  amount BIGINT NOT NULL,
  year INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANZAKSIYALAR
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user UUID REFERENCES profiles(id),
  to_user UUID REFERENCES profiles(id),
  amount BIGINT NOT NULL,
  currency TEXT DEFAULT 'UZS',
  type TEXT NOT NULL, -- gap, toyona, transfer, income, expense
  category TEXT, -- ovqat, transport, toyona, boshqa
  description TEXT,
  status TEXT DEFAULT 'completed',
  payment_method TEXT DEFAULT 'nexus',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEJAMKORLIK MAQSADLARI
CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🎯',
  target_amount BIGINT NOT NULL,
  current_amount BIGINT DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BILDIRISHNOMALAR
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- gap, toyona, transfer, ai, system
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) — Xavfsizlik
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE toyona_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE toyona_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE toyona_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Foydalanuvchi faqat o'z ma'lumotini ko'radi
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own transactions" ON transactions FOR ALL USING (auth.uid() = from_user OR auth.uid() = to_user);
CREATE POLICY "Own goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Gap — a'zolar o'z guruhlarini ko'radi
CREATE POLICY "Gap member access" ON gap_groups FOR SELECT USING (
  id IN (SELECT group_id FROM gap_members WHERE user_id = auth.uid())
  OR created_by = auth.uid()
);
CREATE POLICY "Gap creator manage" ON gap_groups FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Gap member view" ON gap_members FOR SELECT USING (
  group_id IN (SELECT group_id FROM gap_members WHERE user_id = auth.uid())
);

-- To'yona — hamma ko'rishi mumkin (link bilan)
CREATE POLICY "Toyona public read" ON toyona_events FOR SELECT USING (true);
CREATE POLICY "Toyona creator manage" ON toyona_events FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Toyona entries read" ON toyona_entries FOR SELECT USING (true);
CREATE POLICY "Toyona entries write" ON toyona_entries FOR INSERT WITH CHECK (auth.uid() = recorded_by);

-- =============================================
-- TRIGGER: Profile avtomatik yaratish
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, nexus_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Foydalanuvchi'),
    'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER: To'yona yozuv qo'shilganda yig'ilgan summani yangilash
-- =============================================
CREATE OR REPLACE FUNCTION update_collected_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE toyona_events
  SET collected_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM toyona_entries
    WHERE event_id = NEW.event_id
  )
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_toyona_entry
  AFTER INSERT ON toyona_entries
  FOR EACH ROW EXECUTE FUNCTION update_collected_amount();

-- =============================================
-- NAMUNA MA'LUMOTLAR (test uchun)
-- =============================================
-- Bu qatorni Auth orqali foydalanuvchi yaratgandan keyin ishlatish mumkin
