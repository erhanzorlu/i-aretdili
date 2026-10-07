// Türk İşaret Dili (TİD) Veritabanı
// 1. Hafta (Aile, Akrabalar, Çevre) ve 2. Hafta (Zaman, Günler, Aylar, Mevsimler)

export const initialCategories = [
  { id: 'aile', name: 'Aile', color: '#be185d' },
  { id: 'akrabalar', name: 'Akrabalar', color: '#8b5cf6' },
  { id: 'cevre', name: 'Çevre & İlişkiler', color: '#059669' },
  { id: 'zaman', name: 'Zaman Kavramları', color: '#2563eb' },
  { id: 'gunler', name: 'Günler', color: '#475569' },
  { id: 'aylar', name: 'Aylar', color: '#0284c7' },
  { id: 'mevsimler', name: 'Mevsimler', color: '#ca8a04' },
  { id: 'gunluk_terimler', name: 'Günlük Terimler', color: '#0891b2' },
  { id: 'fiiller', name: 'Önemli Fiiller', color: '#dc2626' },
  { id: 'ozel_gunler', name: 'Özel Günler', color: '#9333ea' },
  { id: 'tanisma', name: 'Tanışma & Selam', color: '#10b981' },
  { id: 'sayilar', name: 'Sayılar', color: '#7c3aed' },
  { id: 'diger', name: 'Genel', color: '#64748b' }
];

export const initialWords = [
  // ==========================================
  // 1. HAFTA: AİLE (12 Kelime)
  // ==========================================
  { id: 'w-101', word: 'Anne', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-102', word: 'Baba', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-103', word: 'Kardeş', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-104', word: 'Kız', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-105', word: 'Erkek', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-106', word: 'Adam', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-107', word: 'Kız kardeş', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-108', word: 'Erkek kardeş', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-109', word: 'Abla', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-110', word: 'Abi', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-111', word: 'Bebek', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-112', word: 'Çocuk', category: 'aile', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 1. HAFTA: AKRABALAR (21 Kelime)
  // ==========================================
  { id: 'w-113', word: 'Dede', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-114', word: 'Nine', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-115', word: 'Amca', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-116', word: 'Hala', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-117', word: 'Dayı', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-118', word: 'Teyze', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-119', word: 'Yenge', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-120', word: 'Enişte', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-121', word: 'Bacanak', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-122', word: 'Elti', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-123', word: 'Görümce', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-124', word: 'Kayınvalide', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-125', word: 'Kayınpeder', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-126', word: 'Gelin', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-127', word: 'Damat', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-128', word: 'Torun', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-129', word: 'Kuzen', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-130', word: 'Yeğen', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-131', word: 'Öz', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-132', word: 'Üvey', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-133', word: 'Süt kardeş', category: 'akrabalar', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 1. HAFTA: ÇEVRE & İLİŞKİLER (19 Kelime)
  // ==========================================
  { id: 'w-134', word: 'Arkadaş', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-135', word: 'Dost', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-136', word: 'Komşu', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-137', word: 'Misafir', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-138', word: 'Bekar', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-139', word: 'Sevgili', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-140', word: 'Sözlü', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-141', word: 'Nişanlı', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-142', word: 'Evli - Eş', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-143', word: 'Nikah', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-144', word: 'Resmi Nikah', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-145', word: 'Kına gecesi', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-146', word: 'Düğün', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-147', word: 'Boşanmak', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-148', word: 'Memleket', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-149', word: 'Millet', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-150', word: 'Sünnet', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-151', word: 'Sünnet Düğünü', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-152', word: 'Beraber', category: 'cevre', week: 1, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 2. HAFTA: ZAMAN KAVRAMLARI (27 Kelime)
  // ==========================================
  { id: 'w-1', word: 'Tarih', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-2', word: 'Takvim', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-3', word: 'Sabah', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-4', word: 'Öğlen', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-5', word: 'İkindi', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-6', word: 'Akşam', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-7', word: 'Gece', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-8', word: 'Gündüz', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-9', word: 'Gün', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-10', word: 'Bugün', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-11', word: 'Dün', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-12', word: 'Yarın', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-13', word: 'Hergün', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-14', word: 'Günlük', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-15', word: 'Hafta', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-16', word: 'Hafta İçi', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-17', word: 'Hafta Sonu', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-18', word: 'Erken', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-19', word: 'Geç', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-20', word: 'Önce', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-21', word: 'Sonra', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-22', word: 'Saat', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-23', word: 'Saniye', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-24', word: 'Dakika', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-25', word: 'Ay', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-26', word: 'Yıl - Sene', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-27', word: 'Hemen - Aniden', category: 'zaman', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 2. HAFTA: GÜNLER (7 Kelime)
  // ==========================================
  { id: 'w-28', word: 'Pazartesi', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-29', word: 'Salı', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-30', word: 'Çarşamba', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-31', word: 'Perşembe', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-32', word: 'Cuma', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-33', word: 'Cumartesi', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-34', word: 'Pazar', category: 'gunler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 2. HAFTA: AYLAR (12 Kelime)
  // ==========================================
  { id: 'w-35', word: 'Ocak', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-36', word: 'Şubat', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-37', word: 'Mart', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-38', word: 'Nisan', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-39', word: 'Mayıs', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-40', word: 'Haziran', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-41', word: 'Temmuz', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-42', word: 'Ağustos', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-43', word: 'Eylül', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-44', word: 'Ekim', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-45', word: 'Kasım', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-46', word: 'Aralık', category: 'aylar', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 2. HAFTA: MEVSİMLER (4 Kelime)
  // ==========================================
  { id: 'w-47', word: 'İlkbahar', category: 'mevsimler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-48', word: 'Yaz', category: 'mevsimler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-49', word: 'Sonbahar', category: 'mevsimler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-50', word: 'Kış', category: 'mevsimler', week: 2, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 3. HAFTA: GÜNLÜK TERİMLER (33 Kelime)
  // ==========================================
  { id: 'w-301', word: 'Tebrik ederim', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-302', word: 'Kutlu olsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-303', word: 'Hayırlı olsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-304', word: 'Gözün aydın', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-305', word: 'Hoş geldin', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-306', word: 'Hoş bulduk', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-307', word: 'Afiyet olsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-308', word: 'Sağol', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-309', word: 'Teşekkür ederim', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-310', word: 'Sağlık olsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-311', word: 'Eline sağlık', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-312', word: 'Başın sağolsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-313', word: 'Günaydın', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-314', word: 'Geçmiş olsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-315', word: 'Allah korusun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-316', word: 'Allah\'a emanet ol', category: 'gunluk_terimler', week: 3, ytUrl: 'https://isaretce.com/wp-content/uploads/2017/03/allaha-emanet-ol.gif', notes: 'İşaretçe TİD Hareketli GIF', clickCount: 0, status: 'learning' },
  { id: 'w-317', word: 'Allah razı olsun', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-318', word: 'Allah rızası için', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-319', word: 'Lütfen', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-320', word: 'Rica ederim', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-321', word: 'Özür dilerim', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-322', word: 'Memnun oldum', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-323', word: 'Başarılar dilerim', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-324', word: 'Kusura bakma', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-325', word: 'Önemli değil', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-326', word: 'İyi günler', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-327', word: 'İyi akşamlar', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-328', word: 'İyi geceler', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-329', word: 'İyi uykular', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-330', word: 'İyi yolculuklar', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-331', word: 'İyi çalışmalar', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-332', word: 'İyi bayramlar', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-333', word: 'Kolay gelsin', category: 'gunluk_terimler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 3. HAFTA: ÖNEMLİ FİİLLER (10 Kelime)
  // ==========================================
  { id: 'w-334', word: 'Var - Yok', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-335', word: 'Evet - Hayır', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-336', word: 'İstemek - İstememek', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-337', word: 'Olur - Olmaz', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-338', word: 'Bilmek - Bilmemek', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-339', word: 'Anlamak', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-340', word: 'Konuşmak', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-341', word: 'Söylemek', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-342', word: 'Bakmak', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-343', word: 'Görmek', category: 'fiiller', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },

  // ==========================================
  // 3. HAFTA: ÖZEL GÜNLER (12 Kelime)
  // ==========================================
  { id: 'w-344', word: 'Evlilik Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-345', word: 'Sevgililer Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-346', word: 'Kadınlar Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-347', word: 'Anneler Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-348', word: 'Babalar Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-349', word: 'Doğum Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-350', word: 'Öğretmenler Günü', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-351', word: 'Yılbaşı', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-352', word: 'Ramazan Bayramı', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-353', word: 'Kurban Bayramı', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-354', word: 'Milli-Resmi Bayramlar', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' },
  { id: 'w-355', word: 'Kandil', category: 'ozel_gunler', week: 3, ytUrl: '', notes: '', clickCount: 0, status: 'learning' }
];

export const initialSentences = [];
