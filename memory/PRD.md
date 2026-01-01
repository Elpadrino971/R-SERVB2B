# Auto Discount Location - B2B Partner Platform PRD

## Original Problem Statement
Créer un module de réservation B2B pour Auto Discount Location destiné aux agents de voyages, entreprises et influenceurs. Le système doit être bilingue (FR/EN), permettre le suivi des commissions, intégrer un chat IA pour le support, et offrir des challenges vendeurs.

## Architecture

### Tech Stack
- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Auth**: JWT tokens
- **AI Chat**: OpenAI GPT-5.2 via Emergent LLM Key
- **Payments**: Stripe (liens de paiement préparés)
- **Emails**: Resend (préparé, clé API requise)

### Database Collections
- users (multi-rôles: admin, agent, company, influencer)
- agent_profiles
- company_profiles
- influencer_profiles
- vehicles, vehicle_categories
- agencies
- reservations
- seasons, pricing
- options, insurances
- challenges
- blog_posts, events, faqs
- chat_messages
- audit_logs

## User Personas
1. **Agent de voyage**: Commission 10-17%, suivi réservations, challenges
2. **Entreprise**: Tarifs négociés, conducteurs autorisés, bons de commande
3. **Influenceur**: Codes promo, tracking performance
4. **Admin ADL**: Back-office complet, gestion tarifs/saisons/challenges

## Core Requirements (Static)
- [x] Système bilingue FR/EN
- [x] Auth multi-rôles (agent, company, influencer, admin)
- [x] Catalogue véhicules avec filtres
- [x] Gestion des agences
- [x] Système de réservation
- [x] Dashboard agent avec commissions
- [x] Dashboard admin avec statistiques
- [x] Chat IA support (OpenAI GPT-5.2)
- [ ] Système de challenges vendeurs (structure créée)
- [ ] Blog communautaire (structure créée)
- [ ] Événements/webinaires (structure créée)

## What's Been Implemented (December 2025)

### Backend (server.py)
- Auth système complet (register, login, JWT)
- CRUD complet: Users, Vehicles, Categories, Agencies, Seasons, Pricing
- Réservations avec statuts (pending, confirmed, prepaid, completed, cancelled)
- Commissions automatiques pour agents
- Chat IA avec OpenAI via Emergent integrations
- Routes Admin (stats, seed data, exports)
- Stripe payment links (prêt à activer)
- Audit logs

### Frontend
- **Pages publiques**: Home, Vehicles, Agencies, FAQ
- **Auth**: Login, Register (multi-rôles)
- **Dashboards**: Agent, Admin (avec graphiques Recharts)
- **Composants**: Navbar, Footer, ChatWidget
- **Système i18n**: FR/EN complet

### Data Test (Seeded)
- 5 catégories (Économique, Compacte, SUV, Premium, Utilitaire)
- 6 véhicules avec images
- 3 agences (Guadeloupe, Martinique, Saint-Martin)
- 3 saisons (Basse, Moyenne, Haute)
- Tarifs par catégorie/agence
- FAQs et Options

## Prioritized Backlog

### P0 - Critical (Next)
1. Page de réservation complète (sélection dates/véhicule/options)
2. Page détail réservation agent
3. Activation Stripe pour liens de paiement
4. Activation Resend pour emails

### P1 - Important
1. Gestion complète des challenges
2. Page commissions agent avec export
3. Gestion conducteurs autorisés (entreprises)
4. Dashboard influenceur avec codes promo

### P2 - Nice to Have
1. Blog avec modération
2. Événements avec inscriptions
3. Espace intranet partenaires
4. Import/export CSV tarifs

## Next Tasks
1. Créer page de réservation complète avec sélection véhicule
2. Intégrer Resend pour notifications email
3. Activer Stripe avec clés réelles pour liens de paiement
4. Implémenter le système de challenges complet
5. Ajouter les pages admin pour gestion CRUD complète

## Credentials
- Admin: admin@autodiscount.fr / admin123
- Test Agent: agent2@test.fr / test123
