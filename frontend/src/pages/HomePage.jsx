import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Car, MapPin, CalendarDays, Users, Briefcase, TrendingUp, 
  Award, Shield, Clock, ArrowRight, Star, Zap, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [challenges, setChallenges] = useState([]);
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
      const [agenciesRes, categoriesRes, vehiclesRes, challengesRes] = await Promise.all([
        axios.get(`${API}/agencies`),
        axios.get(`${API}/vehicles/categories`),
        axios.get(`${API}/vehicles`),
        axios.get(`${API}/challenges?status=active`)
      ]);
      setAgencies(agenciesRes.data);
      setCategories(categoriesRes.data);
      setVehicles(vehiclesRes.data.slice(0, 6));
      setChallenges(challengesRes.data.slice(0, 3));
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

  const features = [
    {
      icon: TrendingUp,
      title: i18n.language === 'fr' ? 'Commissions attractives' : 'Attractive commissions',
      description: i18n.language === 'fr' ? 'Jusqu\'à 17% sur chaque réservation' : 'Up to 17% on each booking'
    },
    {
      icon: Shield,
      title: i18n.language === 'fr' ? 'Paiement sécurisé' : 'Secure payment',
      description: i18n.language === 'fr' ? 'Commissions versées mensuellement' : 'Monthly commission payments'
    },
    {
      icon: Clock,
      title: i18n.language === 'fr' ? 'Support 24/7' : '24/7 Support',
      description: i18n.language === 'fr' ? 'Assistance IA + équipe dédiée' : 'AI assistance + dedicated team'
    },
    {
      icon: Award,
      title: i18n.language === 'fr' ? 'Challenges & Rewards' : 'Challenges & Rewards',
      description: i18n.language === 'fr' ? 'Bonus et récompenses exclusives' : 'Exclusive bonuses and rewards'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" data-testid="home-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative gradient-hero text-white overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3024008/pexels-photo-3024008.jpeg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-[#F5A623] text-black px-4 py-1">
                {i18n.language === 'fr' ? 'Plateforme B2B' : 'B2B Platform'}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                {t('hero.title')}
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 max-w-xl">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="btn-primary text-base">
                  <Link to="/register" data-testid="hero-register-btn">
                    {t('hero.partner_cta')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link to="/vehicles" data-testid="hero-vehicles-btn">
                    {t('hero.cta')}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Search Card */}
            <Card className="bg-white/95 backdrop-blur shadow-2xl animate-slide-up" data-testid="search-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">
                  {i18n.language === 'fr' ? 'Rechercher un véhicule' : 'Search for a vehicle'}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      {t('search.pickup_location')}
                    </label>
                    <Select value={pickupAgency} onValueChange={setPickupAgency}>
                      <SelectTrigger data-testid="pickup-agency-select">
                        <SelectValue placeholder={t('search.pickup_location')} />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#F5A623]" />
                              {agency.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      {t('search.return_location')}
                    </label>
                    <Select value={returnAgency} onValueChange={setReturnAgency}>
                      <SelectTrigger data-testid="return-agency-select">
                        <SelectValue placeholder={t('search.return_location')} />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#F5A623]" />
                              {agency.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        {t('search.pickup_date')}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="pickup-date-btn"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {pickupDate ? format(pickupDate, 'dd/MM/yyyy') : '--/--/----'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={setPickupDate}
                            locale={dateLocale}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        {t('search.return_date')}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="return-date-btn"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {returnDate ? format(returnDate, 'dd/MM/yyyy') : '--/--/----'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={setReturnDate}
                            locale={dateLocale}
                            disabled={(date) => date < (pickupDate || new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSearch} 
                  className="w-full btn-primary"
                  size="lg"
                  data-testid="search-btn"
                >
                  {t('search.search')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-slate-50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              {i18n.language === 'fr' ? 'Pourquoi nous choisir ?' : 'Why choose us?'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {i18n.language === 'fr' 
                ? 'Une plateforme conçue pour maximiser vos revenus et simplifier vos réservations'
                : 'A platform designed to maximize your revenue and simplify your bookings'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white card-hover border-slate-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-xl bg-[#3D3A6B]/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-[#3D3A6B]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                {i18n.language === 'fr' ? 'Nos catégories' : 'Our categories'}
              </h2>
              <p className="text-slate-600">
                {i18n.language === 'fr' ? 'Une gamme complète pour tous vos besoins' : 'A complete range for all your needs'}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/vehicles">
                {i18n.language === 'fr' ? 'Voir tout' : 'View all'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={category.id} 
                to={`/vehicles?category=${category.id}`}
                className="group"
              >
                <Card className="card-hover overflow-hidden">
                  <CardContent className="p-4">
                    <div className="h-12 w-12 rounded-lg bg-[#F5A623]/10 flex items-center justify-center mb-3 group-hover:bg-[#F5A623]/20 transition-colors">
                      <Car className="h-6 w-6 text-[#F5A623]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-[#3D3A6B] transition-colors">
                      {i18n.language === 'fr' ? category.name_fr : category.name_en}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{category.code}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section className="py-16 lg:py-24 bg-slate-50" data-testid="vehicles-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                {i18n.language === 'fr' ? 'Véhicules populaires' : 'Popular vehicles'}
              </h2>
              <p className="text-slate-600">
                {i18n.language === 'fr' ? 'Nos modèles les plus demandés' : 'Our most requested models'}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/vehicles">
                {i18n.language === 'fr' ? 'Voir tout' : 'View all'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden card-hover">
                <div className="aspect-video bg-slate-200 relative">
                  {vehicle.image_url ? (
                    <img 
                      src={vehicle.image_url} 
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                  {vehicle.tags?.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      {vehicle.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} className="bg-[#F5A623] text-black text-xs">
                          {tag === 'electric' && <Zap className="h-3 w-3 mr-1" />}
                          {tag === 'new' && <Star className="h-3 w-3 mr-1" />}
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-slate-800">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {vehicle.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> {vehicle.luggage}
                    </span>
                    <span className="capitalize">{vehicle.transmission}</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-slate-500 capitalize">{vehicle.fuel_type}</span>
                    <Button asChild size="sm" className="btn-primary">
                      <Link to={`/vehicles/${vehicle.id}`}>
                        {i18n.language === 'fr' ? 'Réserver' : 'Book'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-16 lg:py-24" data-testid="partners-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              {i18n.language === 'fr' ? 'Rejoignez notre réseau' : 'Join our network'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {i18n.language === 'fr' 
                ? 'Que vous soyez agent de voyage, entreprise ou influenceur, nous avons une solution pour vous'
                : 'Whether you are a travel agent, company, or influencer, we have a solution for you'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Agents */}
            <Card className="overflow-hidden card-hover border-2 hover:border-[#F5A623]">
              <div className="h-48 bg-gradient-to-br from-[#3D3A6B] to-[#252240] flex items-center justify-center">
                <img 
                  src="https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg" 
                  alt="Travel Agent"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <CardContent className="p-6">
                <Badge className="bg-[#F5A623] text-black mb-3">
                  {i18n.language === 'fr' ? 'Commission 10-17%' : '10-17% Commission'}
                </Badge>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {i18n.language === 'fr' ? 'Agents de voyage' : 'Travel Agents'}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {i18n.language === 'fr' 
                    ? 'Augmentez vos revenus avec nos commissions attractives et nos challenges exclusifs.'
                    : 'Increase your revenue with our attractive commissions and exclusive challenges.'}
                </p>
                <Button asChild className="w-full btn-primary">
                  <Link to="/register?role=agent">
                    {i18n.language === 'fr' ? 'Devenir agent' : 'Become an agent'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Companies */}
            <Card className="overflow-hidden card-hover border-2 hover:border-[#F5A623]">
              <div className="h-48 bg-gradient-to-br from-[#3D3A6B] to-[#252240] flex items-center justify-center">
                <img 
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg" 
                  alt="Business"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <CardContent className="p-6">
                <Badge className="bg-[#3D3A6B] text-white mb-3">
                  {i18n.language === 'fr' ? 'Tarifs négociés' : 'Negotiated rates'}
                </Badge>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {i18n.language === 'fr' ? 'Entreprises' : 'Companies'}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {i18n.language === 'fr' 
                    ? 'Gérez facilement vos flottes et conducteurs avec des tarifs préférentiels.'
                    : 'Easily manage your fleets and drivers with preferential rates.'}
                </p>
                <Button asChild className="w-full btn-primary">
                  <Link to="/register?role=company">
                    {i18n.language === 'fr' ? 'Ouvrir un compte' : 'Open an account'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Influencers */}
            <Card className="overflow-hidden card-hover border-2 hover:border-[#F5A623]">
              <div className="h-48 bg-gradient-to-br from-[#3D3A6B] to-[#252240] flex items-center justify-center">
                <img 
                  src="https://images.pexels.com/photos/35414303/pexels-photo-35414303.jpeg" 
                  alt="Influencer"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <CardContent className="p-6">
                <Badge className="bg-emerald-500 text-white mb-3">
                  {i18n.language === 'fr' ? 'Codes promo' : 'Promo codes'}
                </Badge>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {i18n.language === 'fr' ? 'Influenceurs' : 'Influencers'}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {i18n.language === 'fr' 
                    ? 'Partagez vos codes et gagnez des commissions sur chaque réservation.'
                    : 'Share your codes and earn commissions on every booking.'}
                </p>
                <Button asChild className="w-full btn-primary">
                  <Link to="/register?role=influencer">
                    {i18n.language === 'fr' ? 'Devenir influenceur' : 'Become an influencer'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero py-16 lg:py-24" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {i18n.language === 'fr' ? 'Prêt à rejoindre l\'aventure ?' : 'Ready to join the adventure?'}
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            {i18n.language === 'fr' 
              ? 'Créez votre compte en quelques minutes et commencez à générer des revenus dès aujourd\'hui.'
              : 'Create your account in minutes and start generating revenue today.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="btn-primary text-base">
              <Link to="/register">
                {i18n.language === 'fr' ? 'Créer mon compte' : 'Create my account'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link to="/contact">
                {i18n.language === 'fr' ? 'Nous contacter' : 'Contact us'}
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

export default HomePage;
