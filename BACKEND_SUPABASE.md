# Backend Supabase - Auto Discount B2B

Le backend utilise **Supabase** pour l'authentification et la base de données.

## Configuration

1. Copiez `.env.example` vers `.env` dans le dossier `frontend/` :
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Renseignez les variables Supabase dans `frontend/.env` :
   ```env
   REACT_APP_SUPABASE_URL=https://dtlmmbptmjmwjxgzfmyu.supabase.co
   # L'URL ci-dessus correspond au projet Supabase connecté via MCP
   REACT_APP_SUPABASE_ANON_KEY=<votre_anon_key>
   ```

   L’anon key est disponible dans le dashboard Supabase : **Project Settings → API → anon public**.

3. (Optionnel) Désactivez la confirmation par email pour les tests :  
   Supabase Dashboard → **Authentication → Providers → Email** → désactiver **Confirm email**.

## Schéma créé

- **adl_profiles** : profils utilisateurs (rôle, prénom, nom, téléphone)
- **adl_vehicle_categories** : catégories de véhicules (tourisme, utilitaire)
- **adl_vehicles** : véhicules
- **adl_agencies** : agences
- **adl_reservations** : réservations
- **adl_seasons**, **adl_pricing** : tarifs

## Rôles

- `admin` : accès complet
- `agent` : dashboard agent
- `company` : entreprise
- `influencer` : influenceur

Pour créer un compte admin de test : `/register?role=admin`

## Comportement

- Si Supabase est configuré : auth et données via Supabase
- Sinon : fallback sur l’API backend (`REACT_APP_BACKEND_URL`) si disponible
