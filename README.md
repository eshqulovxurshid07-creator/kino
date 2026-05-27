# NEXUS — Moliyaviy Ilova 💙

> Gap, To'yona, Pul o'tkazma, Inflyatsiya tracker — O'zbek madaniyatiga mos fintech ilova

---

## 🚀 5 QADAMDA ISHGA TUSHIRISH

### 1-QADAM: Supabase yaratish (5 daqiqa, BEPUL)

1. [supabase.com](https://supabase.com) ga kiring
2. "New Project" bosing
3. Nom: `nexus-app`, parol yozing, region: `Singapore`
4. Yaratilgandan keyin:
   - **Settings → API** ga boring
   - `Project URL` ni ko'chiring → `.env` ga `REACT_APP_SUPABASE_URL` ga
   - `anon public` key ni ko'chiring → `REACT_APP_SUPABASE_ANON_KEY` ga

### 2-QADAM: Database yaratish (2 daqiqa)

1. Supabase dashboardda **SQL Editor** ga boring
2. `supabase_schema.sql` faylini oching
3. Hamma kodni ko'chiring va **Run** bosing
4. ✅ Jadvallar tayyor!

### 3-QADAM: Auth sozlash

1. Supabase **Authentication → Settings** ga boring
2. **Email** yoqing (default yoqiq)
3. **Phone** yoqing (SMS uchun, ixtiyoriy)
4. **Site URL**: `https://nexus-app.vercel.app`

### 4-QADAM: Loyihani o'rnatish

```bash
# 1. Ko'chiring
git clone https://github.com/siz/nexus-app.git
cd nexus-app

# 2. O'rnatish
npm install

# 3. .env yaratish
cp .env.example .env
# .env faylini oching va Supabase ma'lumotlarini kiriting

# 4. Ishga tushirish
npm start
```

### 5-QADAM: Vercel ga deploy (3 daqiqa, BEPUL)

1. [vercel.com](https://vercel.com) ga kiring (GitHub bilan)
2. "New Project" → GitHub repo ni tanlang
3. **Environment Variables** ga qo'shing:
   ```
   REACT_APP_SUPABASE_URL = https://xxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOi...
   ```
4. "Deploy" bosing
5. ✅ Ilova jonli!

---

## 📁 FAYL TUZILMASI

```
nexus/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/          Login, Register
│   │   ├── dashboard/     Bosh sahifa
│   │   ├── gap/           Gap moduli
│   │   ├── toyona/        To'yona moduli
│   │   ├── transfer/      Pul o'tkazma
│   │   ├── finance/       Moliya va grafiklar
│   │   └── profile/       Profil
│   ├── hooks/
│   │   └── useAuth.js     Auth holatini boshqarish
│   ├── lib/
│   │   └── supabase.js    Barcha API funksiyalar
│   ├── pages/             Sahifalar
│   ├── styles/
│   │   └── global.css     Global stillar
│   └── App.js             Asosiy fayl
├── supabase_schema.sql     Database strukturasi
├── .env.example            Muhit o'zgaruvchilari namunasi
└── package.json
```

---

## 💾 DATABASE JADVALLARI

| Jadval | Nima saqlaydi |
|--------|--------------|
| `profiles` | Foydalanuvchilar profili |
| `gap_groups` | Gap guruhlar |
| `gap_members` | Gap a'zolar |
| `gap_payments` | Gap to'lovlar |
| `toyona_events` | To'yona tadbirlar |
| `toyona_entries` | Daftar yozuvlar |
| `toyona_history` | To'yona tarix |
| `transactions` | Barcha tranzaksiyalar |
| `savings_goals` | Tejamkorlik maqsadlar |
| `notifications` | Bildirishnomalar |

---

## ⚡ XUSUSIYATLAR

### ✅ Hozir ishlaydi
- [x] Register / Login (Email + parol)
- [x] Profil yaratish (avtomatik)
- [x] Gap guruh yaratish
- [x] A'zolar qo'shish
- [x] To'yona tadbir yaratish
- [x] Daftarga yozuv qo'shish (ovozli)
- [x] Inflyatsiya hisoblash
- [x] Tranzaksiya tarixi
- [x] Tejamkorlik maqsadlari
- [x] Bildirishnomalar (real-time)
- [x] Ko'p til (O'zbek, Rus, Ingliz)
- [x] Responsive (mobil + desktop)
- [x] Dark mode

### 🔄 Keyingi versiyada
- [ ] SMS orqali kirish (Twilio)
- [ ] Payme API integratsiya
- [ ] Click API integratsiya
- [ ] Push bildirishnomalar (FCM)
- [ ] Mobil ilova (React Native)
- [ ] QR kod skanerlash

---

## 💰 XARAJATLAR

| Xizmat | Bepul limit | Pullik |
|--------|------------|--------|
| Supabase | 500 foydalanuvchi, 500MB | $25/oy (cheksiz) |
| Vercel | Cheksiz deploy | $20/oy (ko'p traffic) |
| **Jami boshlash** | **$0** | **$45/oy** |

---

## 👥 NECHA KISHINI KO'TARA OLADI?

| Tarif | Foydalanuvchi | Xarajat |
|-------|--------------|---------|
| Bepul (Supabase Free) | ~500 | $0/oy |
| Supabase Pro + Vercel | ~50,000 | $45/oy |
| AWS/GCP (katta miqyos) | Cheksiz | $200+/oy |

---

## 🛠️ TEXNIK STACK

```
Frontend:   React 18 + React Router
Styling:    Custom CSS (Tailwind emas — tezroq)
Database:   Supabase (PostgreSQL)
Auth:       Supabase Auth
Deploy:     Vercel
AI:         Claude API (optional)
Charts:     Recharts
i18n:       i18next
```

---

## 📞 YORDAM

Muammo bo'lsa:
1. [Supabase Docs](https://supabase.com/docs)
2. [Vercel Docs](https://vercel.com/docs)
3. [React Router Docs](https://reactrouter.com)

---

*NEXUS — O'zbek fintech loyihasi 🇺🇿*
