# 🚀 Guide de déploiement sur Emergent.sh

## 📋 Prérequis

Vous avez déjà toutes les clés API configurées :
- ✅ MongoDB Atlas
- ✅ Resend (emails)
- ✅ Stripe (paiements)
- ✅ OpenAI (Chat IA)
- ✅ Swikly (cautions)
- ✅ JWT Secret

---

## 🔧 Étape 1 : Cloner le repository sur Emergent

Dans votre espace Emergent.sh :

```bash
git clone https://github.com/Elpadrino971/R-SERVB2B.git
cd R-SERVB2B
git checkout claude/complete-all-pages-tHGWM
```

---

## ⚙️ Étape 2 : Configuration Backend

### 2.1 - Créer le fichier .env backend

```bash
cd backend
cp .env.example .env
```

### 2.2 - Éditer le .env avec vos clés

```bash
nano .env
```

Remplacer les valeurs suivantes :

```env
# MongoDB Atlas (OBLIGATOIRE)
MONGO_URL=mongodb+srv://votre_user:votre_password@votre-cluster.mongodb.net/?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=votre_jwt_secret_ici

# Resend
RESEND_API_KEY=re_votre_cle_resend_ici

# Stripe
STRIPE_API_KEY=sk_test_votre_stripe_secret_key
STRIPE_SECRET_KEY=sk_test_votre_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_votre_stripe_public_key

# Swikly
SWIKLY_API_KEY=api_votre_swikly_key

# OpenAI
OPENAI_API_KEY=sk-proj-votre_openai_key
OPENAI_ORG_ID=org-votre_org_id
EMERGENT_LLM_KEY=sk-proj-votre_openai_key

# Server Configuration (Emergent ajustera automatiquement les URLs)
PORT=8000
CORS_ORIGINS=http://localhost:2000
FRONTEND_URL=http://localhost:2000
BACKEND_URL=http://localhost:8000
```

**Note** : Vous avez reçu toutes les vraies clés API dans notre conversation précédente. Utilisez-les ici.

**Note** : Les URLs seront automatiquement ajustées par Emergent lors du déploiement.

### 2.3 - Installer les dépendances backend

```bash
pip install fastapi motor python-dotenv resend pydantic bcrypt pyjwt uvicorn email-validator aiofiles python-multipart
```

### 2.4 - Lancer le backend

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🎨 Étape 3 : Configuration Frontend

### 3.1 - Créer le fichier .env frontend

```bash
cd ../frontend
cp .env.example .env
```

### 3.2 - Éditer le .env frontend

```bash
nano .env
```

**IMPORTANT** : Une fois sur Emergent, vous devrez mettre l'URL publique du backend.

Pour l'instant, laissez :
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_votre_stripe_public_key
PORT=2000
```

**Note** : Utilisez votre vraie clé Stripe publique (reçue précédemment).

### 3.3 - Installer les dépendances frontend

```bash
npm install --legacy-peer-deps
```

### 3.4 - Lancer le frontend

```bash
PORT=2000 npm start
```

---

## 🌐 Étape 4 : Trouver vos URLs Emergent

Une fois les serveurs lancés sur Emergent :

1. Cherchez le panneau **"PORTS"** ou **"Forwarded Ports"** dans l'interface
2. Vous verrez deux URLs :
   - **Port 8000** → URL du backend (ex: `https://xxxxx-8000.emergent.sh`)
   - **Port 2000** → URL du frontend (ex: `https://xxxxx-2000.emergent.sh`)

3. **Mettez à jour le frontend/.env** avec l'URL backend :
   ```env
   REACT_APP_BACKEND_URL=https://xxxxx-8000.emergent.sh
   ```

4. **Mettez à jour le backend/.env** avec les URLs :
   ```env
   CORS_ORIGINS=https://xxxxx-2000.emergent.sh
   FRONTEND_URL=https://xxxxx-2000.emergent.sh
   BACKEND_URL=https://xxxxx-8000.emergent.sh
   ```

5. **Redémarrez les serveurs** pour appliquer les changements

---

## 🔄 Commandes de redémarrage

### Backend
```bash
pkill -f uvicorn
cd /path/to/R-SERVB2B/backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
pkill -f "npm start"
cd /path/to/R-SERVB2B/frontend
PORT=2000 npm start
```

---

## ✅ Vérification

Une fois tout configuré :

1. **Backend** : Ouvrez `https://xxxxx-8000.emergent.sh/docs`
   - Vous devriez voir la documentation Swagger

2. **Frontend** : Ouvrez `https://xxxxx-2000.emergent.sh`
   - Vous devriez voir la page d'accueil Auto Discount Location

3. **Testez la connexion** :
   - Créez un compte utilisateur
   - Connectez-vous
   - Vérifiez que le backend répond

---

## 🐛 Dépannage

### Backend ne démarre pas
```bash
# Vérifier les logs
cat /tmp/backend.log

# Vérifier la connexion MongoDB
python -c "import pymongo; print('MongoDB OK')"
```

### Frontend ne compile pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Erreur CORS
- Vérifiez que `CORS_ORIGINS` dans `backend/.env` contient l'URL du frontend Emergent
- Redémarrez le backend après modification

### MongoDB ne se connecte pas
- Vérifiez que l'IP `0.0.0.0/0` est bien **Active** dans MongoDB Atlas → Network Access
- Vérifiez le mot de passe dans `MONGO_URL`

---

## 📦 Build de production

### Backend
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
npm run build
# Servir le dossier build/ avec nginx ou serveur statique
```

---

## 📞 Support

Pour toute question :
- Documentation MongoDB Atlas : https://www.mongodb.com/docs/atlas/
- Documentation Stripe : https://stripe.com/docs
- Documentation Emergent : https://emergent.sh/docs

---

## 🎉 C'est tout !

Votre application **Auto Discount Location B2B** est maintenant déployée sur Emergent.sh ! 🚀

**Rappel** :
- Frontend : `https://xxxxx-2000.emergent.sh`
- Backend : `https://xxxxx-8000.emergent.sh`
- API Docs : `https://xxxxx-8000.emergent.sh/docs`
