# Books Frontend

Frontend rakendus raamatute haldamiseks

## Demo video
[![Demo video](https://img.youtube.com/vi/W4QkLSo0W84/maxresdefault.jpg)](https://www.youtube.com/watch?v=W4QkLSo0W84)



## Autorid
- Madis (individuaaltoo)

## Eeldused
- Node.js 20+ 
- Töötab koos selle repositooriumi backendiga

## Keskkonnamuutujad
Loo fail `frontend/.env` (või kopeeri `frontend/.env.example`) ja sea API aadress:

```
VITE_API_URL=http://localhost:3001/api/v1
```

## Käivitamine (arendus)
### 1) Käivita backend (repositooriumi juurkaustas)
Backend vajab `JWT_SECRET` muutujat, muidu ta ei käivitu.

npm install

.env failis:
```
JWT_SECRET="dev_secret"
DATA_SOURCE_MODE="mock"
PORT="3001"
```
npm run dev


Kontroll:
- `http://localhost:3001/health` → `{ "status": "ok" }`

### 2) Käivita frontend (kaustas `frontend/`)

```powershell
cd frontend
npm install
npm run dev
```

Avaneb:
- `http://localhost:5173`

## Build (tootmisversioon)

```powershell
cd frontend
npm run build
npm run preview
```

## Funktsionaalsus (UI)
- `/books` — nimekiri + filtrid (pealkiri/aasta/keel) + sort + pagination + lisamine + kustutamine
- `/books/:id` — detail + keskmine hinnang + arvustused + arvustuse lisamine + muutmine + kustutamine

## Levinud probleemid
### “API: ühendatud”, aga lisamine/muutmine/kustutamine annab Network Error
Põhjus on tavaliselt CORS preflight (OPTIONS) või Authorization headeri lubamine.

Kontrolli, et backendis oleks CORS lubatud meetoditele ja headeritele:
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`

Ja taaskäivita backend peale muudatusi.
