-- ================================================================
-- TÜRK İŞARET DİLİ (TİD) DEFTERİ - SUPABASE VERİTABANI KURULUMU
-- ================================================================

-- 1. TABLOLARI OLUŞTUR
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.words (
    id TEXT PRIMARY KEY,
    word TEXT NOT NULL,
    category TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    week INT DEFAULT 1,
    yt_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_word_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    word_id TEXT REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    click_count INT DEFAULT 0,
    status TEXT DEFAULT 'learning',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, word_id)
);

-- 2. ROW LEVEL SECURITY (RLS) AKTİF ET
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;

-- 3. GÜVENLİK POLİTİKALARI (POLICIES)

-- Categories: Herkes genel kategorileri okur (user_id IS NULL) veya kendi eklediklerini görür
-- Categories: Herkes okuyabilir, üyeler ekleyip güncelleyip silebilir
DROP POLICY IF EXISTS "Categories Okuma" ON public.categories;
CREATE POLICY "Categories Okuma" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories Ekleme" ON public.categories;
CREATE POLICY "Categories Ekleme" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories Güncelleme" ON public.categories;
CREATE POLICY "Categories Güncelleme" ON public.categories
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Categories Silme" ON public.categories;
CREATE POLICY "Categories Silme" ON public.categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Words: Herkes okuyabilir, üyeler ekleyip güncelleyip silebilir
DROP POLICY IF EXISTS "Words Okuma" ON public.words;
CREATE POLICY "Words Okuma" ON public.words
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Words Ekleme" ON public.words;
CREATE POLICY "Words Ekleme" ON public.words
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Words Güncelleme" ON public.words;
CREATE POLICY "Words Güncelleme" ON public.words
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Words Silme" ON public.words;
CREATE POLICY "Words Silme" ON public.words
    FOR DELETE USING (auth.role() = 'authenticated');

-- User Word Progress: Her kullanıcı sadece kendi ilerlemesini görebilir ve güncelleyebilir
DROP POLICY IF EXISTS "Progress Okuma" ON public.user_word_progress;
CREATE POLICY "Progress Okuma" ON public.user_word_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Progress Ekleme" ON public.user_word_progress;
CREATE POLICY "Progress Ekleme" ON public.user_word_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Progress Güncelleme" ON public.user_word_progress;
CREATE POLICY "Progress Güncelleme" ON public.user_word_progress
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Progress Silme" ON public.user_word_progress;
CREATE POLICY "Progress Silme" ON public.user_word_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 4. HAZIR 13 KATEGORİYİ EKLE (user_id = NULL -> Genel Kategori)
INSERT INTO public.categories (id, name, color, user_id)
VALUES
  ('aile', 'Aile', '#be185d', NULL),
  ('akrabalar', 'Akrabalar', '#8b5cf6', NULL),
  ('cevre', 'Çevre & İlişkiler', '#059669', NULL),
  ('zaman', 'Zaman Kavramları', '#2563eb', NULL),
  ('gunler', 'Günler', '#475569', NULL),
  ('aylar', 'Aylar', '#0284c7', NULL),
  ('mevsimler', 'Mevsimler', '#ca8a04', NULL),
  ('gunluk_terimler', 'Günlük Terimler', '#0891b2', NULL),
  ('fiiller', 'Önemli Fiiller', '#dc2626', NULL),
  ('ozel_gunler', 'Özel Günler', '#9333ea', NULL),
  ('tanisma', 'Tanışma & Selam', '#10b981', NULL),
  ('sayilar', 'Sayılar', '#7c3aed', NULL),
  ('diger', 'Genel', '#64748b', NULL)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  color = EXCLUDED.color;

-- 5. HAZIR 157 KELİMEYİ EKLE (user_id = NULL -> Genel Kelime)
INSERT INTO public.words (id, word, category, week, yt_url, notes, user_id)
VALUES
  ('w-101', 'Anne', 'aile', 1, '', '', NULL),
  ('w-102', 'Baba', 'aile', 1, '', '', NULL),
  ('w-103', 'Kardeş', 'aile', 1, '', '', NULL),
  ('w-104', 'Kız', 'aile', 1, '', '', NULL),
  ('w-105', 'Erkek', 'aile', 1, '', '', NULL),
  ('w-106', 'Adam', 'aile', 1, '', '', NULL),
  ('w-107', 'Kız kardeş', 'aile', 1, '', '', NULL),
  ('w-108', 'Erkek kardeş', 'aile', 1, '', '', NULL),
  ('w-109', 'Abla', 'aile', 1, '', '', NULL),
  ('w-110', 'Abi', 'aile', 1, '', '', NULL),
  ('w-111', 'Bebek', 'aile', 1, '', '', NULL),
  ('w-112', 'Çocuk', 'aile', 1, '', '', NULL),
  ('w-113', 'Dede', 'akrabalar', 1, '', '', NULL),
  ('w-114', 'Nine', 'akrabalar', 1, '', '', NULL),
  ('w-115', 'Amca', 'akrabalar', 1, '', '', NULL),
  ('w-116', 'Hala', 'akrabalar', 1, '', '', NULL),
  ('w-117', 'Dayı', 'akrabalar', 1, '', '', NULL),
  ('w-118', 'Teyze', 'akrabalar', 1, '', '', NULL),
  ('w-119', 'Yenge', 'akrabalar', 1, '', '', NULL),
  ('w-120', 'Enişte', 'akrabalar', 1, '', '', NULL),
  ('w-121', 'Bacanak', 'akrabalar', 1, '', '', NULL),
  ('w-122', 'Elti', 'akrabalar', 1, '', '', NULL),
  ('w-123', 'Görümce', 'akrabalar', 1, '', '', NULL),
  ('w-124', 'Kayınvalide', 'akrabalar', 1, '', '', NULL),
  ('w-125', 'Kayınpeder', 'akrabalar', 1, '', '', NULL),
  ('w-126', 'Gelin', 'akrabalar', 1, '', '', NULL),
  ('w-127', 'Damat', 'akrabalar', 1, '', '', NULL),
  ('w-128', 'Torun', 'akrabalar', 1, '', '', NULL),
  ('w-129', 'Kuzen', 'akrabalar', 1, '', '', NULL),
  ('w-130', 'Yeğen', 'akrabalar', 1, '', '', NULL),
  ('w-131', 'Öz', 'akrabalar', 1, '', '', NULL),
  ('w-132', 'Üvey', 'akrabalar', 1, '', '', NULL),
  ('w-133', 'Süt kardeş', 'akrabalar', 1, '', '', NULL),
  ('w-134', 'Arkadaş', 'cevre', 1, '', '', NULL),
  ('w-135', 'Dost', 'cevre', 1, '', '', NULL),
  ('w-136', 'Komşu', 'cevre', 1, '', '', NULL),
  ('w-137', 'Misafir', 'cevre', 1, '', '', NULL),
  ('w-138', 'Bekar', 'cevre', 1, '', '', NULL),
  ('w-139', 'Sevgili', 'cevre', 1, '', '', NULL),
  ('w-140', 'Sözlü', 'cevre', 1, '', '', NULL),
  ('w-141', 'Nişanlı', 'cevre', 1, '', '', NULL),
  ('w-142', 'Evli - Eş', 'cevre', 1, '', '', NULL),
  ('w-143', 'Nikah', 'cevre', 1, '', '', NULL),
  ('w-144', 'Resmi Nikah', 'cevre', 1, '', '', NULL),
  ('w-145', 'Kına gecesi', 'cevre', 1, '', '', NULL),
  ('w-146', 'Düğün', 'cevre', 1, '', '', NULL),
  ('w-147', 'Boşanmak', 'cevre', 1, '', '', NULL),
  ('w-148', 'Memleket', 'cevre', 1, '', '', NULL),
  ('w-149', 'Millet', 'cevre', 1, '', '', NULL),
  ('w-150', 'Sünnet', 'cevre', 1, '', '', NULL),
  ('w-151', 'Sünnet Düğünü', 'cevre', 1, '', '', NULL),
  ('w-152', 'Beraber', 'cevre', 1, '', '', NULL),
  ('w-1', 'Tarih', 'zaman', 2, '', '', NULL),
  ('w-2', 'Takvim', 'zaman', 2, '', '', NULL),
  ('w-3', 'Sabah', 'zaman', 2, '', '', NULL),
  ('w-4', 'Öğlen', 'zaman', 2, '', '', NULL),
  ('w-5', 'İkindi', 'zaman', 2, '', '', NULL),
  ('w-6', 'Akşam', 'zaman', 2, '', '', NULL),
  ('w-7', 'Gece', 'zaman', 2, '', '', NULL),
  ('w-8', 'Gündüz', 'zaman', 2, '', '', NULL),
  ('w-9', 'Gün', 'zaman', 2, '', '', NULL),
  ('w-10', 'Bugün', 'zaman', 2, '', '', NULL),
  ('w-11', 'Dün', 'zaman', 2, '', '', NULL),
  ('w-12', 'Yarın', 'zaman', 2, '', '', NULL),
  ('w-13', 'Hergün', 'zaman', 2, '', '', NULL),
  ('w-14', 'Günlük', 'zaman', 2, '', '', NULL),
  ('w-15', 'Hafta', 'zaman', 2, '', '', NULL),
  ('w-16', 'Hafta İçi', 'zaman', 2, '', '', NULL),
  ('w-17', 'Hafta Sonu', 'zaman', 2, '', '', NULL),
  ('w-18', 'Erken', 'zaman', 2, '', '', NULL),
  ('w-19', 'Geç', 'zaman', 2, '', '', NULL),
  ('w-20', 'Önce', 'zaman', 2, '', '', NULL),
  ('w-21', 'Sonra', 'zaman', 2, '', '', NULL),
  ('w-22', 'Saat', 'zaman', 2, '', '', NULL),
  ('w-23', 'Saniye', 'zaman', 2, '', '', NULL),
  ('w-24', 'Dakika', 'zaman', 2, '', '', NULL),
  ('w-25', 'Ay', 'zaman', 2, '', '', NULL),
  ('w-26', 'Yıl - Sene', 'zaman', 2, '', '', NULL),
  ('w-27', 'Hemen - Aniden', 'zaman', 2, '', '', NULL),
  ('w-28', 'Pazartesi', 'gunler', 2, '', '', NULL),
  ('w-29', 'Salı', 'gunler', 2, '', '', NULL),
  ('w-30', 'Çarşamba', 'gunler', 2, '', '', NULL),
  ('w-31', 'Perşembe', 'gunler', 2, '', '', NULL),
  ('w-32', 'Cuma', 'gunler', 2, '', '', NULL),
  ('w-33', 'Cumartesi', 'gunler', 2, '', '', NULL),
  ('w-34', 'Pazar', 'gunler', 2, '', '', NULL),
  ('w-35', 'Ocak', 'aylar', 2, '', '', NULL),
  ('w-36', 'Şubat', 'aylar', 2, '', '', NULL),
  ('w-37', 'Mart', 'aylar', 2, '', '', NULL),
  ('w-38', 'Nisan', 'aylar', 2, '', '', NULL),
  ('w-39', 'Mayıs', 'aylar', 2, '', '', NULL),
  ('w-40', 'Haziran', 'aylar', 2, '', '', NULL),
  ('w-41', 'Temmuz', 'aylar', 2, '', '', NULL),
  ('w-42', 'Ağustos', 'aylar', 2, '', '', NULL),
  ('w-43', 'Eylül', 'aylar', 2, '', '', NULL),
  ('w-44', 'Ekim', 'aylar', 2, '', '', NULL),
  ('w-45', 'Kasım', 'aylar', 2, '', '', NULL),
  ('w-46', 'Aralık', 'aylar', 2, '', '', NULL),
  ('w-47', 'İlkbahar', 'mevsimler', 2, '', '', NULL),
  ('w-48', 'Yaz', 'mevsimler', 2, '', '', NULL),
  ('w-49', 'Sonbahar', 'mevsimler', 2, '', '', NULL),
  ('w-50', 'Kış', 'mevsimler', 2, '', '', NULL),
  ('w-301', 'Tebrik ederim', 'gunluk_terimler', 3, '', '', NULL),
  ('w-302', 'Kutlu olsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-303', 'Hayırlı olsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-304', 'Gözün aydın', 'gunluk_terimler', 3, '', '', NULL),
  ('w-305', 'Hoş geldin', 'gunluk_terimler', 3, '', '', NULL),
  ('w-306', 'Hoş bulduk', 'gunluk_terimler', 3, '', '', NULL),
  ('w-307', 'Afiyet olsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-308', 'Sağol', 'gunluk_terimler', 3, '', '', NULL),
  ('w-309', 'Teşekkür ederim', 'gunluk_terimler', 3, '', '', NULL),
  ('w-310', 'Sağlık olsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-311', 'Eline sağlık', 'gunluk_terimler', 3, '', '', NULL),
  ('w-312', 'Başın sağolsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-313', 'Günaydın', 'gunluk_terimler', 3, '', '', NULL),
  ('w-314', 'Geçmiş olsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-315', 'Allah korusun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-316', 'Allah''a emanet ol', 'gunluk_terimler', 3, 'https://isaretce.com/wp-content/uploads/2017/03/allaha-emanet-ol.gif', 'İşaretçe TİD Hareketli GIF', NULL),
  ('w-317', 'Allah razı olsun', 'gunluk_terimler', 3, '', '', NULL),
  ('w-318', 'Allah rızası için', 'gunluk_terimler', 3, '', '', NULL),
  ('w-319', 'Lütfen', 'gunluk_terimler', 3, '', '', NULL),
  ('w-320', 'Rica ederim', 'gunluk_terimler', 3, '', '', NULL),
  ('w-321', 'Özür dilerim', 'gunluk_terimler', 3, '', '', NULL),
  ('w-322', 'Memnun oldum', 'gunluk_terimler', 3, '', '', NULL),
  ('w-323', 'Başarılar dilerim', 'gunluk_terimler', 3, '', '', NULL),
  ('w-324', 'Kusura bakma', 'gunluk_terimler', 3, '', '', NULL),
  ('w-325', 'Önemli değil', 'gunluk_terimler', 3, '', '', NULL),
  ('w-326', 'İyi günler', 'gunluk_terimler', 3, '', '', NULL),
  ('w-327', 'İyi akşamlar', 'gunluk_terimler', 3, '', '', NULL),
  ('w-328', 'İyi geceler', 'gunluk_terimler', 3, '', '', NULL),
  ('w-329', 'İyi uykular', 'gunluk_terimler', 3, '', '', NULL),
  ('w-330', 'İyi yolculuklar', 'gunluk_terimler', 3, '', '', NULL),
  ('w-331', 'İyi çalışmalar', 'gunluk_terimler', 3, '', '', NULL),
  ('w-332', 'İyi bayramlar', 'gunluk_terimler', 3, '', '', NULL),
  ('w-333', 'Kolay gelsin', 'gunluk_terimler', 3, '', '', NULL),
  ('w-334', 'Var - Yok', 'fiiller', 3, '', '', NULL),
  ('w-335', 'Evet - Hayır', 'fiiller', 3, '', '', NULL),
  ('w-336', 'İstemek - İstememek', 'fiiller', 3, '', '', NULL),
  ('w-337', 'Olur - Olmaz', 'fiiller', 3, '', '', NULL),
  ('w-338', 'Bilmek - Bilmemek', 'fiiller', 3, '', '', NULL),
  ('w-339', 'Anlamak', 'fiiller', 3, '', '', NULL),
  ('w-340', 'Konuşmak', 'fiiller', 3, '', '', NULL),
  ('w-341', 'Söylemek', 'fiiller', 3, '', '', NULL),
  ('w-342', 'Bakmak', 'fiiller', 3, '', '', NULL),
  ('w-343', 'Görmek', 'fiiller', 3, '', '', NULL),
  ('w-344', 'Evlilik Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-345', 'Sevgililer Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-346', 'Kadınlar Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-347', 'Anneler Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-348', 'Babalar Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-349', 'Doğum Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-350', 'Öğretmenler Günü', 'ozel_gunler', 3, '', '', NULL),
  ('w-351', 'Yılbaşı', 'ozel_gunler', 3, '', '', NULL),
  ('w-352', 'Ramazan Bayramı', 'ozel_gunler', 3, '', '', NULL),
  ('w-353', 'Kurban Bayramı', 'ozel_gunler', 3, '', '', NULL),
  ('w-354', 'Milli-Resmi Bayramlar', 'ozel_gunler', 3, '', '', NULL),
  ('w-355', 'Kandil', 'ozel_gunler', 3, '', '', NULL)
ON CONFLICT (id) DO UPDATE SET 
  word = EXCLUDED.word, 
  category = EXCLUDED.category, 
  week = EXCLUDED.week, 
  yt_url = EXCLUDED.yt_url, 
  notes = EXCLUDED.notes;

-- BİTTİ!
