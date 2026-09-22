# 🚀 Vela Agencies - Complete Vercel Deployment Guide (A to Z)

Indha guide ungaloda **Vela Agencies (Full Stack Crackers Store)**-ah Vercel-la **100% Free, Secure & Lightning-Fast** ah deploy panna use aagum.

---

## 🏗️ Architecture Overview

- **Frontend:** React + Vite (Fast SPA, Responsive, SEO Optimized)
- **Admin Panel:** React + Vite + Tailwind (Billing, CMS, WhatsApp Enquiries, Product Catalog)
- **Backend:** Node.js + Express (Serverless APIs on Vercel)
- **Cache Layer:** Upstash Redis (Mumbai Region - Sub-50ms Response)
- **Database:** TiDB Serverless Cloud (MySQL Compatible, Auto Scaling)
- **Media Storage:** Cloudinary CDN (Image Optimization & Storage)

---

## ⚖️ Pros & Cons of this Architecture

### ✅ Pros (Advantages)
1. **Zero Hosting Cost ($0.00 / Month):**
   - Vercel, TiDB Cloud, Upstash Redis, and Cloudinary ellaame generous **Free Tiers** tharudhu. Lifetime-ku monthly server bill varadhu.
2. **Lightning-Fast Performance (Sub-50ms Response):**
   - Upstash Redis Mumbai server-la irukiradhaala, products & categories database query panna vendam — RAM-la irundhu instant-ah load aagum.
3. **Auto Scaling & High Traffic Ready:**
   - Diwali season-la 10,000+ visitors ore nerathula vandhalum server crash aagadhu (Serverless architecture automatically scales up).
4. **Independent Deployments:**
   - Frontend, Backend, and Admin thani thani projects-ah irukuradhala, Frontend-la oru chinna design change panna Backend build aaga vendam.
5. **Instant Global CDN & Free SSL:**
   - HTTPS / SSL certificates automatically issue and renew aagidum.

### ⚠️ Cons (Points to Keep in Mind)
1. **Serverless Cold Start (Backend):**
   - Backend-ku konja neram traffic illama irundhu pudhusa first request varum bothu ~1-2 seconds delay irukalam (Cold Start). But Redis caching adhoda effect-a romba reduce pannidum.
2. **Free Tier Limits (Monitoring Needed during peak Diwali):**
   - Upstash Redis: 500k commands/month (~16,000 req/day). Excess aana fallback to direct database (crash aagadhu).
   - Cloudinary: 25GB monthly bandwidth.

---

## 📋 Pre-requisites Checklist

- [x] Code pushed to GitHub repo: `https://github.com/Rishidevlx/Vela-Agencies.git`
- [x] TiDB Cloud Database credentials ready
- [x] Upstash Redis credentials ready
- [x] Cloudinary credentials ready

---

## 🛠️ Step-by-Step Deployment Instructions

### 🔵 PHASE 1: Backend Deployment (`backend`)
> **Note:** Backend-a mudhalla deploy pannanum, yen-na adhu kudukura URL thaan Frontend & Admin-ku theva.

1. **Vercel Dashboard** ponga: [https://vercel.com/dashboard](https://vercel.com/dashboard).
2. Top right-la **"Add New"** ➔ **"Project"** click pannunga.
3. Ungaloda **`Vela-Agencies`** GitHub repo-va **"Import"** pannunga.
4. **Configure Project Settings:**
   - **Project Name:** `vela-agencies-backend`
   - **Framework Preset:** `Other` (leave as default)
   - **Root Directory:** Click **Edit** ➔ **`backend`** select panni Save/Continue kudunga.
5. **Environment Variables:**
   Keezha irukura variables-a copy panni add pannunga:

   | Key | Value |
   | :--- | :--- |
   | `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
   | `DB_PORT` | `4000` |
   | `DB_USER` | `3RqbkmgrUpBjAke.root` |
   | `DB_PASSWORD` | `STwHB0RtMRjw6MMq` |
   | `DB_NAME` | `Velaagencies` |
   | `ADMIN_EMAIL` | `admin@akcrackers.com` |
   | `ADMIN_PASSWORD` | `admin` |
   | `JWT_SECRET` | `supersecret_akcrackers_jwt_key_2026` |
   | `PORT` | `5000` |
   | `CLOUDINARY_CLOUD_NAME` | `bvxyuenn` |
   | `CLOUDINARY_API_KEY` | `434812783928861` |
   | `CLOUDINARY_API_SECRET` | `6yhwbxsIRZ6ua5MATNtmh5eBEm8` |
   | `EMAIL_USER` | `genzdevoff@gmail.com` |
   | `EMAIL_PASS` | `hfusmqkriguzklxg` |
   | `UPSTASH_REDIS_REST_URL` | `https://robust-ringtail-290933.upstash.io` |
   | `UPSTASH_REDIS_REST_TOKEN` | `gQAAAAAABHB1AAIgcDE0YzY4NThiMjNmZDk0NTdmOGQyNDQxYTc5MWY4ZjAyNw` |

6. **"Deploy"** click pannunga.
7. Deployment mudinjadhum, Vercel oru Live URL tharum (Eg: `https://vela-agencies-backend.vercel.app`).
   👉 **Indha Backend Live URL-a copy panni vechikonga!**

---

### 🟢 PHASE 2: Frontend Deployment (`Frontend`)

1. Thirumba **Vercel Dashboard** ➔ **"Add New"** ➔ **"Project"**.
2. Adhe **`Vela-Agencies`** repo-va **"Import"** pannunga.
3. **Configure Project Settings:**
   - **Project Name:** `vela-agencies` (or `vela-agencies-shop`)
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** ➔ **`Frontend`** select panni Save/Continue kudunga.
4. **Environment Variables:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://vela-agencies-backend.vercel.app` *(Phase 1-la kedaicha Backend URL - Kadasila `/` poda koodadhu)*
5. **"Deploy"** click pannunga.
6. Frontend Live aagidum! 🎉

---

### 🟡 PHASE 3: Admin Panel Deployment (`admin`)

1. Thirumba **Vercel Dashboard** ➔ **"Add New"** ➔ **"Project"**.
2. Adhe **`Vela-Agencies`** repo-va **"Import"** pannunga.
3. **Configure Project Settings:**
   - **Project Name:** `vela-agencies-admin`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** ➔ **`admin`** select panni Save/Continue kudunga.
4. **Environment Variables:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://vela-agencies-backend.vercel.app` *(Phase 1-la kedaicha Backend URL)*
5. **"Deploy"** click pannunga.
6. Admin Panel Live aagidum! 🎉

---

## 🌐 Custom Domain Setup (Optional / Production)

Ungalukku sontha domain (`velaagencies.com`) irundha:
1. **Frontend Project** (Vercel) ➔ **Settings** ➔ **Domains** ➔ `velaagencies.com` & `www.velaagencies.com` add pannunga.
2. **Admin Project** ➔ **Settings** ➔ **Domains** ➔ `admin.velaagencies.com` add pannunga.
3. **Backend Project** ➔ **Settings** ➔ **Domains** ➔ `api.velaagencies.com` add pannunga.
4. Ungaloda DNS Provider-la (GoDaddy/Cloudflare/Hostinger) Vercel kaatura CNAME / A Records-a add panna 5 mins-la domain active aagidum.

---

## 🔍 Verification & Testing After Deployment

1. **Backend Health Check:**
   - Browser-la `https://vela-agencies-backend.vercel.app/api/products` open pannunga. JSON product list load aaganum.
2. **Admin Panel:**
   - `https://vela-agencies-admin.vercel.app` open panni login pannunga (`admin@akcrackers.com` / `admin`).
   - Products list, categories, Outward billing check pannunga.
3. **Customer Frontend:**
   - `https://vela-agencies.vercel.app` open panni product browse, cart, quick WhatsApp enquiry test pannunga.

---
**Deployment 100% Ready to go Live! 🚀**
