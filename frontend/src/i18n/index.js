import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Navigation
      "nav.home": "Accueil",
      "nav.vehicles": "Nos Véhicules",
      "nav.agencies": "Nos Agences",
      "nav.blog": "Blog",
      "nav.partners": "Partenaires",
      "nav.events": "Événements",
      "nav.faq": "FAQ",
      "nav.login": "Connexion",
      "nav.register": "Inscription",
      "nav.dashboard": "Tableau de bord",
      "nav.logout": "Déconnexion",
      
      // Hero
      "hero.title": "Votre partenaire location véhicules B2B",
      "hero.subtitle": "Plateforme dédiée aux agents de voyages, entreprises et influenceurs",
      "hero.cta": "Commencer une réservation",
      "hero.partner_cta": "Devenir partenaire",
      
      // Search
      "search.pickup_location": "Lieu de prise en charge",
      "search.return_location": "Lieu de retour",
      "search.pickup_date": "Date de départ",
      "search.return_date": "Date de retour",
      "search.search": "Rechercher",
      
      // Categories
      "categories.economy": "Économique",
      "categories.compact": "Compacte",
      "categories.suv": "SUV",
      "categories.premium": "Premium",
      "categories.utility": "Utilitaire",
      
      // Dashboard
      "dashboard.title": "Tableau de bord",
      "dashboard.reservations": "Réservations",
      "dashboard.commissions": "Commissions",
      "dashboard.challenges": "Challenges",
      "dashboard.profile": "Profil",
      "dashboard.total_bookings": "Total réservations",
      "dashboard.pending": "En attente",
      "dashboard.completed": "Complétées",
      "dashboard.total_commission": "Commission totale",
      
      // Reservations
      "reservation.new": "Nouvelle réservation",
      "reservation.reference": "Référence",
      "reservation.status": "Statut",
      "reservation.pickup": "Prise en charge",
      "reservation.return": "Retour",
      "reservation.vehicle": "Véhicule",
      "reservation.total": "Total",
      "reservation.cancel": "Annuler",
      "reservation.duplicate": "Dupliquer",
      "reservation.details": "Détails",
      
      // Status
      "status.pending": "En attente",
      "status.confirmed": "Confirmée",
      "status.prepaid": "Prépayée",
      "status.completed": "Terminée",
      "status.cancelled": "Annulée",
      "status.no_show": "No-show",
      
      // Auth
      "auth.email": "Email",
      "auth.password": "Mot de passe",
      "auth.first_name": "Prénom",
      "auth.last_name": "Nom",
      "auth.phone": "Téléphone",
      "auth.login": "Se connecter",
      "auth.register": "S'inscrire",
      "auth.forgot_password": "Mot de passe oublié ?",
      "auth.no_account": "Pas encore de compte ?",
      "auth.have_account": "Déjà un compte ?",
      "auth.role": "Type de compte",
      "auth.agent": "Agent de voyages",
      "auth.company": "Entreprise",
      "auth.influencer": "Influenceur",
      
      // Chat
      "chat.title": "Support",
      "chat.placeholder": "Écrivez votre message...",
      "chat.send": "Envoyer",
      "chat.ai_assistant": "Assistant IA",
      
      // Admin
      "admin.dashboard": "Administration",
      "admin.users": "Utilisateurs",
      "admin.vehicles": "Véhicules",
      "admin.agencies": "Agences",
      "admin.pricing": "Tarifs",
      "admin.seasons": "Saisons",
      "admin.challenges": "Challenges",
      "admin.blog": "Blog",
      "admin.events": "Événements",
      "admin.stats": "Statistiques",
      "admin.export": "Exporter",
      
      // Common
      "common.save": "Enregistrer",
      "common.cancel": "Annuler",
      "common.edit": "Modifier",
      "common.delete": "Supprimer",
      "common.confirm": "Confirmer",
      "common.loading": "Chargement...",
      "common.error": "Erreur",
      "common.success": "Succès",
      "common.actions": "Actions",
      "common.view": "Voir",
      "common.back": "Retour",
      "common.next": "Suivant",
      "common.previous": "Précédent",
      "common.search": "Rechercher",
      "common.filter": "Filtrer",
      "common.all": "Tous",
      "common.from": "Du",
      "common.to": "Au",
      "common.per_day": "/jour",
      "common.total": "Total",
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.vehicles": "Our Vehicles",
      "nav.agencies": "Our Agencies",
      "nav.blog": "Blog",
      "nav.partners": "Partners",
      "nav.events": "Events",
      "nav.faq": "FAQ",
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Logout",
      
      // Hero
      "hero.title": "Your B2B Vehicle Rental Partner",
      "hero.subtitle": "Platform dedicated to travel agents, businesses and influencers",
      "hero.cta": "Start a Booking",
      "hero.partner_cta": "Become a Partner",
      
      // Search
      "search.pickup_location": "Pickup Location",
      "search.return_location": "Return Location",
      "search.pickup_date": "Pickup Date",
      "search.return_date": "Return Date",
      "search.search": "Search",
      
      // Categories
      "categories.economy": "Economy",
      "categories.compact": "Compact",
      "categories.suv": "SUV",
      "categories.premium": "Premium",
      "categories.utility": "Utility",
      
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.reservations": "Reservations",
      "dashboard.commissions": "Commissions",
      "dashboard.challenges": "Challenges",
      "dashboard.profile": "Profile",
      "dashboard.total_bookings": "Total Bookings",
      "dashboard.pending": "Pending",
      "dashboard.completed": "Completed",
      "dashboard.total_commission": "Total Commission",
      
      // Reservations
      "reservation.new": "New Reservation",
      "reservation.reference": "Reference",
      "reservation.status": "Status",
      "reservation.pickup": "Pickup",
      "reservation.return": "Return",
      "reservation.vehicle": "Vehicle",
      "reservation.total": "Total",
      "reservation.cancel": "Cancel",
      "reservation.duplicate": "Duplicate",
      "reservation.details": "Details",
      
      // Status
      "status.pending": "Pending",
      "status.confirmed": "Confirmed",
      "status.prepaid": "Prepaid",
      "status.completed": "Completed",
      "status.cancelled": "Cancelled",
      "status.no_show": "No-show",
      
      // Auth
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.first_name": "First Name",
      "auth.last_name": "Last Name",
      "auth.phone": "Phone",
      "auth.login": "Login",
      "auth.register": "Register",
      "auth.forgot_password": "Forgot Password?",
      "auth.no_account": "Don't have an account?",
      "auth.have_account": "Already have an account?",
      "auth.role": "Account Type",
      "auth.agent": "Travel Agent",
      "auth.company": "Company",
      "auth.influencer": "Influencer",
      
      // Chat
      "chat.title": "Support",
      "chat.placeholder": "Type your message...",
      "chat.send": "Send",
      "chat.ai_assistant": "AI Assistant",
      
      // Admin
      "admin.dashboard": "Administration",
      "admin.users": "Users",
      "admin.vehicles": "Vehicles",
      "admin.agencies": "Agencies",
      "admin.pricing": "Pricing",
      "admin.seasons": "Seasons",
      "admin.challenges": "Challenges",
      "admin.blog": "Blog",
      "admin.events": "Events",
      "admin.stats": "Statistics",
      "admin.export": "Export",
      
      // Common
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.confirm": "Confirm",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.actions": "Actions",
      "common.view": "View",
      "common.back": "Back",
      "common.next": "Next",
      "common.previous": "Previous",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.all": "All",
      "common.from": "From",
      "common.to": "To",
      "common.per_day": "/day",
      "common.total": "Total",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
