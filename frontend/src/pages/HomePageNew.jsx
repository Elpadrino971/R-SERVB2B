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

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    try {
      const [agenciesRes, vehiclesRes] = await Promise.all([
        axios.get(`${API}/agencies`),
        axios.get(`${API}/vehicles`)
      ]);
      setAgencies(agenciesRes.data);
      setVehicles(vehiclesRes.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
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
    { icon: Award, value: '25+', label: 'Années d\'expérience' },
    { icon: Car, value: '2000+', label: 'Véhicules disponibles' },
    { icon: Users, value: '50K+', label: 'Clients satisfaits' },
    { icon: MapPin, value: '6', label: 'Agences' }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Prix compétitifs',
      description: 'Les meilleurs tarifs toute l\'année en Guadeloupe et Martinique'
    },
    {
      icon: Shield,
      title: 'Assurance incluse',
      description: 'Tous nos véhicules sont assurés tous risques'
    },
    {
      icon: Clock,
      title: 'Service 24/7',
      description: 'Assistance disponible à tout moment pendant votre location'
    },
    {
      icon: CheckCircle2,
      title: 'Sans caution',
      description: 'Location sans blocage de caution bancaire'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-[#3D3A6B] via-[#4A4777] to-[#3D3A6B] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5A623] rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F5A623] rounded-full filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12 space-y-6">
            <Badge className="bg-[#F5A623] text-white border-none px-6 py-2 text-base font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Location de voiture aux Antilles
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Auto Discount Location
            </h1>

            <p className="text-xl sm:text-2xl text-slate-200 max-w-3xl mx-auto">
              Votre partenaire de confiance pour la location de véhicules en <span className="text-[#F5A623] font-semibold">Guadeloupe</span>, <span className="text-[#F5A623] font-semibold">Martinique</span> et <span className="text-[#F5A623] font-semibold">Guyane</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#F5A623]" />
                <span>Prix attractifs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#F5A623]" />
                <span>Sans caution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#F5A623]" />
                <span>Service 24/7</span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <Card className="max-w-5xl mx-auto shadow-2xl border-0">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                Réservez votre véhicule en quelques clics
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Agence de départ */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F5A623]" />
                    Agence de départ
                  </label>
                  <Select value={pickupAgency} onValueChange={setPickupAgency}>
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
                    <CalendarDays className="w-4 h-4 text-[#F5A623]" />
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
                    <CalendarDays className="w-4 h-4 text-[#F5A623]" />
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
                    <MapPin className="w-4 h-4 text-[#F5A623]" />
                    Agence de retour
                  </label>
                  <Select value={returnAgency} onValueChange={setReturnAgency}>
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
                className="w-full mt-6 h-14 text-lg font-semibold bg-[#F5A623] hover:bg-[#E09515] text-white"
              >
                Rechercher un véhicule
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#3D3A6B] to-[#4A4777] mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#3D3A6B] mb-2">{stat.value}</div>
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
              Pourquoi choisir Auto Discount ?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Depuis 25 ans, nous vous accompagnons dans vos déplacements aux Antilles avec des services de qualité
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E09515] mb-4">
                      <Icon className="w-7 h-7 text-white" />
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

      {/* Vehicles Section */}
      {vehicles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Nos véhicules populaires
                </h2>
                <p className="text-lg text-slate-600">
                  Découvrez notre flotte de véhicules récents et bien entretenus
                </p>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex border-[#3D3A6B] text-[#3D3A6B] hover:bg-[#3D3A6B] hover:text-white">
                <Link to="/vehicles">
                  Voir tous les véhicules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                    {vehicle.image_url ? (
                      <img
                        src={vehicle.image_url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car className="w-20 h-20 text-slate-400" />
                      </div>
                    )}
                    <Badge className="absolute top-4 right-4 bg-[#F5A623] text-white border-none">
                      {vehicle.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {vehicle.seats} places
                      </div>
                      {vehicle.transmission && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {vehicle.transmission === 'automatic' ? 'Auto' : 'Manuelle'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button className="w-full bg-[#3D3A6B] hover:bg-[#2D2A5B] text-white" asChild>
                      <Link to={`/booking?vehicle=${vehicle.id}`}>
                        Réserver
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button asChild variant="outline" className="border-[#3D3A6B] text-[#3D3A6B]">
                <Link to="/vehicles">
                  Voir tous les véhicules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#3D3A6B] to-[#2D2A5B] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-16 h-16 mx-auto mb-6 text-[#F5A623]" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à partir à l'aventure ?
          </h2>
          <p className="text-xl text-slate-200 mb-8">
            Réservez dès maintenant votre véhicule et profitez de nos meilleurs tarifs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-[#F5A623] hover:bg-[#E09515] text-white text-lg px-8">
              <Link to="/vehicles">
                Voir les véhicules
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
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
