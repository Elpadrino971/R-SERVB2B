# Backend FastAPI - Auto Discount B2B

Le backend complet (66 endpoints) provient de la branche `conflict_010126_1924n` du dépôt [R-SERVB2B](https://github.com/Elpadrino971/R-SERVB2B).

## Stack

- **FastAPI** + **Motor** (MongoDB async)
- **JWT** + **Bcrypt** (auth)
- **Resend** (emails), **Stripe** (paiements) - optionnels

## Configuration

1. **Créer `backend/.env`** à partir de `.env.example` :
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **MongoDB** : URL de connexion (local ou Atlas) :
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=auto_discount_b2b
   ```

3. **CORS** : autoriser le frontend (port 2000 ou 3000) :
   ```env
   CORS_ORIGINS=http://localhost:2000,http://127.0.0.1:2000
   ```

## Lancer le backend

```bash
cd backend
pip install -r requirements.txt
# ou pip install fastapi motor python-dotenv pydantic bcrypt pyjwt uvicorn email-validator resend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

## Première utilisation

1. Démarrer MongoDB et le backend
2. Créer un compte admin : aller sur `/register?role=admin`
3. Se connecter puis appeler `POST /api/admin/seed` (avec Bearer token) pour remplir les données de test (agences, véhicules, catégories, etc.)

## Frontend

Dans `frontend/.env` :
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Choix du backend (FastAPI vs Supabase)

- **FastAPI + MongoDB** : définir `REACT_APP_BACKEND_URL=http://localhost:8000` et ne pas définir les variables Supabase.
- **Supabase** : définir `REACT_APP_SUPABASE_URL` et `REACT_APP_SUPABASE_ANON_KEY` (voir `BACKEND_SUPABASE.md`).

Si les deux sont configurés, Supabase a la priorité pour l'auth.

