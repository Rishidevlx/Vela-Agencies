# Vercel Deployment Guide (A - Z)
**Vela Agencies - Full Stack Application**

Ungaloda code ippo single GitHub repo-la (Monorepo) iruku. Vercel-la idha 3 thani thani projects ah deploy pannanum (Backend, Frontend, Admin). Keezha iruka steps-a order maaramal exactly follow pannunga.

---

## Phase 1: Backend Deployment (First Step)
Backend-a thaan mudhalla deploy pannanum, yen-na adhu kudukura URL thaan Frontend & Admin-ku theva.

1. **Vercel Dashboard** ponga (https://vercel.com/dashboard).
2. **"Add New"** -> **"Project"** click pannunga.
3. Ungaloda `VelaAgencies-crackers` GitHub repo-va **"Import"** pannunga.
4. **Configure Project Details:**
   - **Project Name:** `vela-backend` (illa ungalukku pudicha peru).
   - **Framework Preset:** `Other` nu automatically select aagidum (leave it as it is).
   - **Root Directory:** Edit icon click panni `backend` nu select panni save pannunga. 
   - **Build and Output Settings:** Leave it as default.
   - **Environment Variables:** Idhu romba mukkiyam! Unga local `backend/.env` file-la iruka ellathayum inga copy-paste pannunga. (e.g., `KV_URL`, `CLOUDINARY_URL`, `JWT_SECRET`, database keys).
5. **Deploy** button-a click pannunga.
6. Deployment mudinjadhum, Vercel oru pudhu URL kudukum (eg: `https://vela-backend.vercel.app`). **Indha URL-a copy panni vachikonga!**

---

## Phase 2: Frontend Deployment
1. Thirumba Vercel Dashboard poyi **"Add New"** -> **"Project"** click pannunga.
2. Adhe `VelaAgencies-crackers` repo-va **"Import"** pannunga.
3. **Configure Project Details:**
   - **Project Name:** `vela-shop` (ungalukku pudicha peru).
   - **Framework Preset:** `Vite` nu automatic ah select aagidum (Appadi illana `Vite` nu select pannunga).
   - **Root Directory:** Edit icon click panni `Frontend` nu select panni save pannunga.
   - **Environment Variables:** 
     - Name: `VITE_API_URL`
     - Value: *(Neenga Phase 1-la copy panna Backend URL)* -> e.g., `https://vela-backend.vercel.app` (kadasila `/` poda vendam).
4. **Deploy** button-a click pannunga.

---

## Phase 3: Admin Panel Deployment
1. Vercel Dashboard poyi **"Add New"** -> **"Project"** click pannunga.
2. Adhe `VelaAgencies-crackers` repo-va **"Import"** pannunga.
3. **Configure Project Details:**
   - **Project Name:** `vela-admin` (ungalukku pudicha peru).
   - **Framework Preset:** `Vite` nu select aagirukum.
   - **Root Directory:** Edit icon click panni `admin` nu select panni save pannunga.
   - **Environment Variables:**
     - Name: `VITE_API_URL`
     - Value: *(Phase 1-la copy panna Backend URL)*.
4. **Deploy** button-a click pannunga.

---

## Final Checklist
- [ ] Backend deploy aagiducha?
- [ ] Frontend deploy aagiducha? Adhoda `.env` la Backend URL iruka?
- [ ] Admin deploy aagiducha? Adhoda `.env` la Backend URL iruka?

Yellam live aana udane, Admin pannel login panni Whatsapp Enquiries check panni parunga. Code ippo perfectly set aagiruku! 🎉
