# Configuration des APIs - Auto Discount Location B2B

## ✅ APIs Configurées

### 1. Resend (Emails) ✅
**API Key**: `re_RGZb1ZcP_Gj2hxij9DByviCuq57dmzJHT`

#### Procédure de vérification du domaine :
1. Aller sur https://resend.com/domains
2. Ajouter votre domaine `auto-discount.fr`
3. Ajouter les enregistrements DNS suivants chez votre hébergeur :

```
Type: TXT
Name: resend._domainkey
Value: [Fourni par Resend]

Type: MX
Name: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
```

4. Attendre la vérification (5-30 minutes)
5. Une fois vérifié, changer dans `.env` :
   ```
   SENDER_EMAIL=noreply@auto-discount.fr
   ```

**Utilisation actuelle** :
- Emails de confirmation de réservation
- Liens de paiement
- Notifications caution Swikly
- Récupération mot de passe

---

### 2. Stripe (Paiements) ✅
**Public Key**: `pk_test_51SmHKdLU7qXSCDJh...`
**Secret Key**: `sk_test_51SmHKdLU7qXSCDJh...`

#### 🔴 ACTION REQUISE : Configuration du Webhook

##### Étape 1 : Créer le webhook sur Stripe
1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer sur **"Add endpoint"**
3. Endpoint URL : `https://VOTRE_DOMAINE.com/api/webhook/stripe`
   - En dev : `http://localhost:8000/api/webhook/stripe`
   - En prod : `https://api.auto-discount.fr/api/webhook/stripe`

##### Étape 2 : Sélectionner les événements
Cocher les événements suivants :
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.succeeded`
- ✅ `charge.failed`

##### Étape 3 : Récupérer le Webhook Secret
1. Une fois créé, cliquer sur le webhook
2. Copier la clé **"Signing secret"** (commence par `whsec_...`)
3. Mettre à jour dans `backend/.env` :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
   ```

##### Étape 4 : Tester le webhook (en dev)
```bash
# Installer Stripe CLI
brew install stripe/stripe-brew/stripe  # Mac
# ou télécharger sur https://stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Écouter les webhooks en local
stripe listen --forward-to localhost:8000/api/webhook/stripe

# Dans un autre terminal, tester un paiement
stripe trigger checkout.session.completed
```

**Utilisation actuelle** :
- Page de paiement flexible (agence ou en ligne)
- Création de sessions Stripe Checkout
- Webhooks pour confirmation automatique

---

### 3. OpenAI (Chat IA) ✅
**API Key**: `sk-proj-mOF9ZX1i7tqN32sL...`
**Org ID**: `org-WKj5GM83kbXcYZuV85W575eF`

#### Configuration additionnelle :
1. Aller sur https://platform.openai.com/settings/organization/billing
2. Ajouter une carte bancaire (minimum 5$)
3. Définir une limite de dépense mensuelle (recommandé : 20-50$)

**Modèle utilisé** : GPT-4 ou GPT-3.5-turbo
**Utilisation actuelle** :
- ChatWidget avec assistance IA
- Réponses aux questions des clients

---

### 4. Swikly (Cautions) ✅
**API Key**: `api-zAOhseohw9RP69qiMuleC3TlkMDKeWt8URvsl4ve3a647641`

#### Procédure de test :
1. Aller sur https://app.swikly.com
2. Créer un compte marchand (si pas déjà fait)
3. Tester une demande de caution :
   - Aller dans Admin → Réservations
   - Cliquer sur "Actions" → "Gérer caution Swikly"
   - Entrer montant et email
   - Vérifier réception email

**Utilisation actuelle** :
- Demande de caution automatique
- Emails de caution aux clients
- Libération de caution après location

---

### 5. JWT Secret ✅
**Secret**: `0360504a7eade944aea83f17317317b7`

⚠️ **IMPORTANT PRODUCTION** : Générer une nouvelle clé plus longue :
```bash
openssl rand -hex 64
```

**Utilisation actuelle** :
- Authentification des utilisateurs
- Tokens de session
- Sécurité API

---

## 🔴 API MANQUANTE : MongoDB

### MongoDB Atlas - Base de données (OBLIGATOIRE)

#### Procédure complète :

##### Étape 1 : Créer un compte MongoDB Atlas
1. Aller sur https://www.mongodb.com/cloud/atlas/register
2. S'inscrire (gratuit)
3. Créer une organisation : "Auto Discount Location"

##### Étape 2 : Créer un cluster gratuit
1. Cliquer sur **"Build a Database"**
2. Sélectionner **"M0 Free"** (512MB gratuit)
3. Choisir la région la plus proche (ex: Paris - eu-west-3)
4. Nom du cluster : `auto-discount-b2b`
5. Cliquer **"Create Cluster"**

##### Étape 3 : Configurer l'accès réseau
1. Aller dans **"Network Access"** (menu gauche)
2. Cliquer **"Add IP Address"**
3. Sélectionner **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ En production, restreindre aux IPs de votre serveur
4. Cliquer **"Confirm"**

##### Étape 4 : Créer un utilisateur database
1. Aller dans **"Database Access"** (menu gauche)
2. Cliquer **"Add New Database User"**
3. Méthode : **"Password"**
4. Username : `admin_autodiscount`
5. Password : Générer un mot de passe fort (copier-le !)
6. Database User Privileges : **"Atlas admin"**
7. Cliquer **"Add User"**

##### Étape 5 : Obtenir l'URL de connexion
1. Aller dans **"Database"** (menu gauche)
2. Cliquer sur **"Connect"** sur votre cluster
3. Choisir **"Connect your application"**
4. Driver : **Python** / Version : **3.12 or later**
5. Copier la connection string :
   ```
   mongodb+srv://admin_autodiscount:<password>@auto-discount-b2b.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

##### Étape 6 : Mettre à jour le .env
1. Remplacer `<password>` par le mot de passe créé à l'étape 4
2. Dans `backend/.env`, remplacer :
   ```
   MONGO_URL=mongodb+srv://admin_autodiscount:VOTRE_MOT_DE_PASSE@auto-discount-b2b.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=auto_discount_b2b
   ```

##### Étape 7 : Tester la connexion
```bash
cd backend
python -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; from dotenv import load_dotenv; load_dotenv(); client = AsyncIOMotorClient(os.environ['MONGO_URL']); print('✅ Connexion réussie !'); client.close()"
```

---

## 📋 Checklist de déploiement

### Avant de déployer :

- [x] Resend API configurée
- [x] Stripe API configurée
- [ ] **Stripe Webhook configuré** (voir section Stripe)
- [ ] **MongoDB Atlas configuré** (voir section MongoDB)
- [x] OpenAI API configurée
- [x] Swikly API configurée
- [x] JWT Secret défini
- [ ] Resend domaine vérifié (optionnel en dev)
- [ ] Variables d'environnement production définies

### Configuration production :

Créer un fichier `.env.production` avec :
```bash
# MongoDB Production
MONGO_URL=mongodb+srv://...
DB_NAME=auto_discount_b2b

# URLs Production
FRONTEND_URL=https://www.auto-discount.fr
BACKEND_URL=https://api.auto-discount.fr
CORS_ORIGINS=https://www.auto-discount.fr,https://admin.auto-discount.fr

# Stripe Production (remplacer les clés test par les clés live)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT Secret (générer nouveau)
JWT_SECRET=nouvelle_cle_64_caracteres_minimum

# Resend Production
SENDER_EMAIL=noreply@auto-discount.fr

# Environment
NODE_ENV=production
```

---

## 🚀 Commandes de démarrage

### Développement :
```bash
# Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend
PORT=2000 npm start
```

### Production :
```bash
# Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (build)
cd frontend
npm run build
# Servir avec nginx ou autre
```

---

## 📞 Support

- **Stripe** : https://support.stripe.com
- **MongoDB** : https://www.mongodb.com/docs/atlas/
- **Resend** : https://resend.com/docs
- **OpenAI** : https://help.openai.com
- **Swikly** : contact@swikly.com

---

**Dernière mise à jour** : 2026-01-05
