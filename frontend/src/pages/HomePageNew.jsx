import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  Car, MapPin, CalendarDays, Users, Shield, Clock,
  ArrowRight, Star, Zap, Award, TrendingUp, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { SITE_CONFIG } from '../data/siteConfig';
import { AGENCIES_DATA } from '../data/agencies';
import { VEHICLE_PRODUCTS } from '../data/vehicles';

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;

const HomePageNew = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [pickupAgency, setPickupAgency] = useState('');
  const [returnAgency, setReturnAgency] = useState('');
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!API) {
      setAgencies(AGENCIES_DATA);
      setVehicles(VEHICLE_PRODUCTS.slice(0, 6));
      setLoading(false);
      return;
    }
    try {
      const [agenciesRes, vehiclesRes] = await Promise.all([
        axios.get(`${API}/agencies`),
        axios.get(`${API}/vehicles`).catch(() => ({ data: [] }))
      ]);
      setAgencies(Array.isArray(agenciesRes.data) ? agenciesRes.data : AGENCIES_DATA);
      const vData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data.slice(0, 6) : [];
      setVehicles(vData.length > 0 ? vData : VEHICLE_PRODUCTS.slice(0, 6));
    } catch (error) {
      console.warn('API non disponible, utilisation des données statiques:', error.message);
      setAgencies(AGENCIES_DATA);
      setVehicles(VEHICLE_PRODUCTS.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupAgency) params.set('pickup', pickupAgency);
    if (returnAgency) params.set('return', returnAgency);
    if (pickupDate) params.set('from', format(pickupDate, 'yyyy-MM-dd'));
    if (returnDate) params.set('to', format(returnDate, 'yyyy-MM-dd'));
    navigate(`/vehicles?${params.toString()}`);
  };

  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  const stats = [
    { icon: Award, value: `${SITE_CONFIG.stats.experience}+`, label: i18n.language === 'fr' ? 'Années d\'expérience' : 'Years of experience' },
    { icon: Car, value: `${SITE_CONFIG.stats.vehicles}+`, label: i18n.language === 'fr' ? 'Véhicules disponibles' : 'Vehicles available' },
    { icon: Users, value: `${SITE_CONFIG.stats.clients}+`, label: i18n.language === 'fr' ? 'Clients satisfaits' : 'Satisfied clients' },
    { icon: MapPin, value: SITE_CONFIG.stats.agencies, label: i18n.language === 'fr' ? 'Agences' : 'Agencies' }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Commissions attractives',
      description: 'Jusqu\'à 17% sur chaque réservation.'
    },
    {
      icon: Shield,
      title: 'Paiement sécurisé',
      description: 'Commissions versées mensuellement.'
    },
    {
      icon: Clock,
      title: 'Support 24/7',
      description: 'Assistance IA + équipe dédiée.'
    },
    {
      icon: CheckCircle2,
      title: 'Challenges & Rewards',
      description: 'Bonus et récompenses exclusives.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Photo fond + violet #332859 */}
      <section className="relative min-h-[600px] lg:min-h-[650px] text-white overflow-hidden" style={{ minHeight: 'min(100vh - 4rem, 650px)' }}>
        {/* Photo de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${SITE_CONFIG.assets?.heroBackground || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920'})`,
          }}
        />
        {/* Overlay violet contractuel #332859 */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(51, 40, 89, 0.85)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Contenu gauche */}
            <div className="space-y-6">
              <Badge className="bg-[#F9A826] text-white border-none px-4 py-1.5 text-sm font-semibold">
                Plateforme B2B
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Votre partenaire location véhicules B2B
              </h1>
              <p className="text-xl text-white/90 max-w-xl">
                Plateforme dédiée aux agents de voyages, entreprises et influenceurs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-[#F9A826] hover:bg-[#F5A623] text-white font-semibold">
                  <Link to="/register">
                    Devenir partenaire
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-slate-700/80 hover:bg-slate-600 text-white border-0">
                  <Link to="/vehicles">Commencer une réservation</Link>
                </Button>
              </div>
            </div>

            {/* Formulaire recherche - droite */}
            <div>
              <Card className="shadow-2xl border-0 overflow-hidden relative z-10 bg-white">
                <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Rechercher un véhicule
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Agence de départ */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#332859]" />
                    Agence de départ
                  </label>
                  <Select value={pickupAgency || undefined} onValueChange={setPickupAgency}>
                    <SelectTrigger className="h-12 border-slate-300">
                      <SelectValue placeholder="Choisir une agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date de départ */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#332859]" />
                    Date de départ
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-12 w-full justify-start text-left font-normal border-slate-300">
                        {pickupDate ? format(pickupDate, 'dd/MM/yyyy') : 'Sélectionner'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        locale={dateLocale}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date de retour */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#332859]" />
                    Date de retour
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-12 w-full justify-start text-left font-normal border-slate-300">
                        {returnDate ? format(returnDate, 'dd/MM/yyyy') : 'Sélectionner'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        locale={dateLocale}
                        disabled={(date) => pickupDate && date < pickupDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Agence de retour */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#332859]" />
                    Agence de retour
                  </label>
                  <Select value={returnAgency || undefined} onValueChange={setReturnAgency}>
                    <SelectTrigger className="h-12 border-slate-300">
                      <SelectValue placeholder="Même agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                size="lg"
                className="w-full mt-6 h-14 text-lg font-semibold bg-[#F9A826] hover:bg-[#F5A623] text-white"
              >
                Rechercher
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#332859]/20 mb-4">
                    <Icon className="w-8 h-8 text-[#332859]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#332859] mb-2">{stat.value}</div>
                  <div className="text-sm sm:text-base text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une plateforme conçue pour maximiser vos revenus et simplifier vos réservations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
                      <Icon className="w-7 h-7 text-[#332859]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catégories véhicules */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {['Économique', 'Compacte', 'SUV', 'Premium', 'Utilitaire'].map((cat) => (
              <Link
                key={cat}
                to={`/vehicles?category=${cat.toLowerCase()}`}
                className="flex flex-col items-center p-6 min-w-[140px] rounded-xl border border-slate-200 hover:border-[#332859] hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-[#332859]/10 flex items-center justify-center mb-3">
                  <Car className="w-6 h-6 text-[#332859]" />
                </div>
                <span className="font-bold text-slate-800 text-sm">{cat}</span>
                <span className="text-xs text-slate-500 uppercase mt-1">
                  {cat.slice(0, 3)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section - Véhicules populaires */}
      {vehicles.length > 0 && (
        <section className="py-16 bg-slate-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Véhicules populaires
                </h2>
                <p className="text-lg text-slate-600">
                  Nos modèles les plus demandés
                </p>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex border-[#332859] text-[#332859] hover:bg-[#332859] hover:text-white">
                <Link to="/vehicles">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => {
                const img = vehicle.image_url || vehicle.image || vehicle.imageThumb;
                const name = vehicle.name ? (i18n.language === 'fr' ? vehicle.name.fr : vehicle.name.en) : (vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.model || vehicle.category);
                const passengers = vehicle.specs?.passengers || vehicle.seats || 5;
                const trans = vehicle.specs?.transmission ? (i18n.language === 'fr' ? vehicle.specs.transmission.fr : vehicle.specs.transmission.en) : vehicle.transmission;
                return (
                  <Card key={vehicle.id || vehicle.categoryId} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Car className="w-20 h-20 text-slate-400" />
                        </div>
                      )}
                      <Badge className="absolute top-4 right-4 bg-[#F9A826] text-white border-none">
                        {vehicle.category || name}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-2">{vehicle.model}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {passengers} places
                        </div>
                        {trans && (
                          <Badge variant="outline" className="text-xs">
                            {trans}
                          </Badge>
                        )}
                      </div>
                      <Button className="w-full bg-[#F9A826] hover:bg-[#F5A623] text-white" asChild>
                        <Link to={`/vehicles?category=${vehicle.categoryId || vehicle.id}`}>
                          {i18n.language === 'fr' ? 'Réserver' : 'Book'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button asChild variant="outline" className="border-[#332859] text-[#332859] hover:bg-[#332859] hover:text-white">
                <Link to="/vehicles">
                  Voir tous les véhicules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Violet #352D64 */}
      <section className="py-16 text-white" style={{ backgroundColor: '#352D64' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-16 h-16 mx-auto mb-6 text-[#F9A826]" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à rejoindre l'aventure ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Créez votre compte en quelques minutes et commencez à générer des revenus dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-[#F9A826] hover:bg-[#F5A623] text-white text-lg px-8">
              <Link to="/vehicles">
                Voir les véhicules
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 bg-transparent">
              <Link to="/agencies">
                Nos agences
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default HomePageNew;
