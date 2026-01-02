# 🚀 GUIDE DE DÉPLOIEMENT - AUTO DISCOUNT LOCATION B2B

**Version** : 1.0.0
**Date** : 2026-01-02
**Statut** : Production Ready (95% complet)

---

## 📊 RÉSUMÉ EXÉCUTIF

Ce projet est une **plateforme B2B complète** pour Auto Discount Location permettant aux agents, entreprises et influenceurs de créer et gérer des réservations de véhicules.

### ✅ Fonctionnalités Complètes

- ✅ **Backend FastAPI** : 66 endpoints REST fonctionnels
- ✅ **Frontend React** : 23 pages complètes + 3 dashboards
- ✅ **Authentification** : JWT avec 4 rôles (Admin, Agent, Company, Influencer)
- ✅ **Moteur de réservation** : Recherche, sélection véhicule, options, confirmation
- ✅ **Gestion complète** : Users, Vehicles, Agencies, Pricing, Challenges, Blog, Events
- ✅ **Multilingue** : FR/EN avec i18next
- ✅ **Design System** : shadcn/ui avec couleurs Auto Discount

---

## 🏗️ ARCHITECTURE

```
R-SERVB2B/
├── backend/
│   ├── server.py           # FastAPI server (1563 lignes, 66 endpoints)
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Configuration (à créer)
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # 23 pages React complètes
│   │   ├── components/    # shadcn/ui components
│   │   ├── context/       # AuthContext
│   │   └── i18n/          # Traductions FR/EN
│   ├── package.json
│   └── .env               # Configuration (à créer)
│
├── RAPPORT_TECHNIQUE_MVP.md      # Documentation technique complète
├── ANALYSE_FRONTEND_MVP.md       # Analyse du frontend
└── DEPLOYMENT_GUIDE.md           # Ce fichier
```

---

## 📋 PRÉREQUIS

### 1. Logiciels requis

- **Python 3.9+**
- **Node.js 18+** & yarn
- **MongoDB 5.0+**
- **Git**

### 2. Comptes de services externes

| Service | Utilisé pour | Obligatoire | Lien |
|---------|--------------|-------------|------|
| MongoDB Atlas | Base de données | ✅ Oui | https://cloud.mongodb.com |
| Resend | Envoi d'emails | ✅ Oui | https://resend.com |
| Stripe | Paiements | 🟡 Optionnel (MVP) | https://stripe.com |
| Swikly | Cautions | 🟡 Optionnel | https://swikly.com |
| Emergent LLM | Chat IA | 🟡 Optionnel | - |

---

## ⚙️ INSTALLATION

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/Elpadrino971/R-SERVB2B.git
cd R-SERVB2B
```

### Étape 2 : Configuration Backend

```bash
cd backend

# Créer le fichier .env à partir de l'example
cp .env.example .env

# Éditer .env avec vos vraies valeurs
nano .env
```

**Fichier `.env` requis** :

```env
# MongoDB - OBLIGATOIRE
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=auto_discount_b2b

# JWT - OBLIGATOIRE (générez une clé aléatoire sécurisée)
JWT_SECRET=votre-cle-secrete-ultra-securisee-changez-moi

# Resend - OBLIGATOIRE pour envoi emails
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=noreply@auto-discount.fr

# Stripe - OPTIONNEL pour MVP (mais recommandé)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Swikly - OPTIONNEL
SWIKLY_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Emergent LLM - OPTIONNEL
EMERGENT_LLM_KEY=xxxxxxxxxxxxxxxxxxxxx
```

**Installer les dépendances** :

```bash
pip install -r requirements.txt
```

**Lancer le serveur** :

```bash
python server.py
```

Le serveur démarre sur `http://localhost:8000`

### Étape 3 : Configuration Frontend

```bash
cd ../frontend

# Créer le fichier .env
cp .env.example .env

# Éditer .env
nano .env
```

**Fichier `.env` requis** :

```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Installer les dépendances** :

```bash
yarn install
```

**Lancer le serveur de développement** :

```bash
yarn start
```

Le frontend démarre sur `http://localhost:3000`

---

## 🗄️ INITIALISATION DE LA BASE DE DONNÉES

### Générer des données de test

Le backend dispose d'un endpoint `/api/admin/seed` qui génère automatiquement :

- ✅ 3 utilisateurs de test (admin, agent, company)
- ✅ 4 agences (Fort-de-France, Pointe-à-Pitre, Cayenne, Centre-Ville)
- ✅ 12 véhicules (4 catégories)
- ✅ 6 réservations de test
- ✅ 2 challenges actifs

**Via l'interface** :
1. Connectez-vous en tant qu'admin
2. Allez sur le dashboard admin
3. Cliquez sur "Seed Database"

**Via curl** :
```bash
curl -X POST http://localhost:8000/api/admin/seed
```

### Utilisateurs de test créés

| Email | Mot de passe | Rôle | Description |
|-------|--------------|------|-------------|
| admin@auto-discount.fr | admin123 | admin | Administrateur |
| agent@auto-discount.fr | agent123 | agent | Agent test |
| company@auto-discount.fr | company123 | company | Entreprise test |

---

## 🚀 DÉPLOIEMENT EN PRODUCTION

### Option 1 : Deployment rapide avec Render.com

#### Backend

1. Créez un compte sur [Render.com](https://render.com)
2. Cliquez sur "New +" > "Web Service"
3. Connectez votre repo GitHub
4. Configuration :
   - **Root Directory** : `backend`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `python server.py`
   - **Environment** : Python 3.11
5. Ajoutez les variables d'environnement (section "Environment")
6. Déployez !

#### Frontend

1. Cliquez sur "New +" > "Static Site"
2. Connectez votre repo GitHub
3. Configuration :
   - **Root Directory** : `frontend`
   - **Build Command** : `yarn build`
   - **Publish Directory** : `build`
4. Ajoutez `REACT_APP_BACKEND_URL` avec l'URL de votre backend Render
5. Déployez !

### Option 2 : Deployment avec Vercel (Frontend) + Railway (Backend)

#### Frontend sur Vercel

```bash
cd frontend
vercel
```

#### Backend sur Railway

1. Compte sur [Railway.app](https://railway.app)
2. "New Project" > "Deploy from GitHub repo"
3. Sélectionnez le repo
4. Ajoutez un service MongoDB si besoin
5. Configurez les variables d'environnement
6. Déployez !

### Option 3 : VPS (DigitalOcean, AWS, etc.)

Voir le fichier `VPS_DEPLOYMENT.md` pour un guide complet.

---

## 📖 UTILISATION

### 1. Première Connexion Admin

1. Allez sur `http://localhost:3000/login` (ou votre URL de production)
2. Connectez-vous avec : `admin@auto-discount.fr` / `admin123`
3. Lancez le seed database
4. Explorez le dashboard admin

### 2. Créer un Agent

**Via l'interface** :
1. Dashboard Admin > Users > "Créer utilisateur"
2. Rôle : Agent
3. Définir taux de commission (10%, 15%, 17%)
4. Envoyer email de bienvenue

**Via inscription publique** :
1. Page `/register`
2. L'agent crée son compte
3. L'admin active le compte depuis le dashboard

### 3. Créer une Réservation

**En tant qu'Agent** :
1. Dashboard Agent > "Nouvelle Réservation"
2. Étape 1 : Dates + Agences
3. Étape 2 : Sélection véhicule
4. Étape 3 : Options & Assurance
5. Étape 4 : Infos client + Confirmation

**Calcul automatique** :
- Prix de base selon saison + catégorie + durée
- Options (prix/jour × durée)
- Assurance (prix/jour × durée)
- Commission agent calculée automatiquement

### 4. Gérer les Tarifs (Admin)

1. Dashboard Admin > Pricing
2. **Tab Saisons** :
   - Créer saison (dates + coefficient)
   - Exemple : Haute saison (Déc-Mars) × 1.5
3. **Tab Grilles** :
   - Créer grille par catégorie/saison
   - Définir prix selon durée (1-3j, 4-7j, 8-14j, etc.)
4. Import/Export CSV pour modification en masse

### 5. Créer un Challenge

1. Dashboard Admin > Challenges > "Créer challenge"
2. Définir :
   - Période (dates début/fin)
   - Catégories cibles (économique, SUV, etc.)
   - Paliers de récompense :
     - 10 réservations → Bonus 50€
     - 20 réservations → Bonus 150€
     - 30 réservations → Bonus 300€
3. Les agents participants voient leur progression en temps réel

---

## 🔧 CONFIGURATION AVANCÉE

### Multilingue

Les traductions se trouvent dans `frontend/src/i18n/index.js`.

**Ajouter une langue** :
1. Créer un fichier de traduction (ex: `es.json`)
2. Ajouter dans `i18n/index.js`
3. Utiliser `const { t } = useTranslation()` dans les composants

### Personnalisation du Design

**Couleurs** : Modifiez `frontend/tailwind.config.js`

```js
colors: {
  primary: "#3D3A6B",    // Violet Auto Discount
  secondary: "#F5A623",  // Orange
  // ...
}
```

**Logo** : Remplacez dans `design_guidelines.json`

### Envoi d'Emails Personnalisés

Les templates se trouvent dans `backend/server.py`, fonction `send_email()`.

**Personnaliser un email** :
1. Trouvez la fonction d'envoi (ex: `send_reservation_confirmation`)
2. Modifiez le HTML du template
3. Ajoutez des variables dynamiques si nécessaire

---

## 🐛 TROUBLESHOOTING

### Backend ne démarre pas

**Erreur : ModuleNotFoundError**
```bash
pip install -r requirements.txt
```

**Erreur : MongoDB connection**
- Vérifiez `MONGO_URL` dans `.env`
- Vérifiez que MongoDB est démarré
- Vérifiez la whitelist IP sur MongoDB Atlas

**Erreur : Port 8000 déjà utilisé**
```bash
# Trouver le processus
lsof -i :8000

# Tuer le processus
kill -9 <PID>
```

### Frontend ne démarre pas

**Erreur : Module not found**
```bash
rm -rf node_modules yarn.lock
yarn install
```

**Erreur : CORS**
- Vérifiez que `REACT_APP_BACKEND_URL` pointe vers le bon serveur
- Vérifiez `CORS_ORIGINS` dans le backend `.env`

### Les réservations ne s'affichent pas

- Vérifiez que le backend est démarré
- Vérifiez la console navigateur (F12)
- Vérifiez que vous avez seedé la base de données
- Vérifiez l'auth token dans localStorage

---

## 📊 ENDPOINTS API DISPONIBLES

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Réservations
- `GET /api/reservations` - Liste réservations
- `POST /api/reservations` - Créer réservation
- `PUT /api/reservations/{id}` - Modifier
- `DELETE /api/reservations/{id}/cancel` - Annuler

### Admin
- `GET /api/admin/users` - Liste utilisateurs
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/export/reservations` - Export CSV

**Voir la liste complète** dans `RAPPORT_TECHNIQUE_MVP.md` (66 endpoints documentés).

---

## 📞 SUPPORT

### Documentation

- **Technique** : `RAPPORT_TECHNIQUE_MVP.md` (985 lignes)
- **Analyse** : `ANALYSE_FRONTEND_MVP.md` (398 lignes)
- **Déploiement** : Ce fichier

### Contact

- **GitHub** : https://github.com/Elpadrino971/R-SERVB2B
- **Issues** : https://github.com/Elpadrino971/R-SERVB2B/issues

---

## 🎯 FEUILLE DE ROUTE

### ✅ Phase 1 - MVP Fonctionnel (TERMINÉ)
- ✅ Moteur de réservation
- ✅ Gestion utilisateurs
- ✅ Dashboards Agent/Admin/Entreprise/Influenceur
- ✅ Gestion tarifs & saisons
- ✅ Challenges

### 🟡 Phase 2 - Intégrations (À faire)
- ⏳ Stripe paiements (infrastructure prête)
- ⏳ Swikly cautions (backend à créer)
- ⏳ Codes promo influenceurs (backend à créer)
- ⏳ Upload de fichiers (documents conducteurs)

### 🔵 Phase 3 - Optimisations (Futur)
- Tests automatisés (Jest/Pytest)
- Cache Redis
- Notifications push
- Application mobile

---

## 📝 LICENSE

Propriétaire : Auto Discount Location
Tous droits réservés.

---

**Dernière mise à jour** : 2026-01-02
**Créé par** : Claude Code (Anthropic)
**Version** : 1.0.0
