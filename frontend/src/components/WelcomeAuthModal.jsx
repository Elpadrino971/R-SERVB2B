import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Users, TrendingUp, Gift, DollarSign, CheckCircle,
  Building, Megaphone, Plane, X
} from 'lucide-react';

const WelcomeAuthModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Vérifier si le modal a déjà été affiché dans cette session
    const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
    const isAuthenticated = localStorage.getItem('token');

    // Afficher uniquement si pas encore vu ET pas authentifié
    if (!hasSeenModal && !isAuthenticated) {
      // Délai de 2 secondes pour laisser la page charger
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  const handleLogin = () => {
    handleClose();
    navigate('/login');
  };

  const handleRegister = () => {
    handleClose();
    navigate('/register');
  };

  const handleContinueAsGuest = () => {
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-5 w-5 text-gray-500" />
          <span className="sr-only">Fermer</span>
        </button>

        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-[#3D3A6B] to-[#5B5891] text-white p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white mb-2">
              Bienvenue sur Auto Discount Location B2B
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              Rejoignez notre réseau de partenaires et commencez à gagner des commissions dès aujourd'hui !
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Alerte importante */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">
                Ne perdez pas vos commissions !
              </h3>
              <p className="text-amber-800 text-sm">
                Connectez-vous ou créez votre compte partenaire avant de réserver.
                Toutes les réservations effectuées sans compte ne génèrent aucune commission.
              </p>
            </div>
          </div>

          {/* Types de partenaires */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#3D3A6B]" />
              Qui peut devenir partenaire ?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#F5A623] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plane className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Agences de Voyage</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Proposez nos véhicules à vos clients et gagnez jusqu'à 17% de commission
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#F5A623] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Megaphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Influenceurs</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Partagez vos codes promo et touchez des commissions sur chaque location
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#F5A623] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Entreprises</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Gérez la flotte de vos employés avec des tarifs préférentiels
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#F5A623] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Tour Opérateurs</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Intégrez nos services dans vos packages touristiques
                </p>
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#3D3A6B]" />
              Vos avantages partenaire
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Commissions élevées</h4>
                <p className="text-sm text-gray-600">Jusqu'à 17% par réservation</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Plateforme simple</h4>
                <p className="text-sm text-gray-600">Réservation en 4 étapes</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Suivi en temps réel</h4>
                <p className="text-sm text-gray-600">Dashboard avec statistiques</p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-[#3D3A6B] to-[#5B5891] rounded-lg p-6 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">
              Prêt à augmenter vos revenus ?
            </h3>
            <p className="text-white/90 mb-6">
              Rejoignez des centaines de partenaires qui font déjà confiance à Auto Discount Location
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRegister}
                size="lg"
                className="bg-[#F5A623] hover:bg-[#E09612] text-gray-900 font-semibold px-8"
              >
                Devenir Partenaire
              </Button>
              <Button
                onClick={handleLogin}
                size="lg"
                variant="outline"
                className="bg-white hover:bg-gray-100 text-[#3D3A6B] font-semibold px-8"
              >
                J'ai déjà un compte
              </Button>
            </div>
          </div>

          {/* Continuer sans compte */}
          <div className="text-center">
            <button
              onClick={handleContinueAsGuest}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Continuer sans compte (aucune commission)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeAuthModal;
