import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Car, Users, Briefcase, Fuel, Settings, Search, Filter, X, Zap, Star, Heart
} from 'lucide-react';
import { VEHICLE_PRODUCTS, VEHICLE_CATEGORIES } from '../data/vehicles';

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;

const VehiclesPage = ({ type: propType = 'tourisme' }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Type from route: /vehicles/tourisme ou /vehicles/utilitaire
  const currentType = propType || (location.pathname.includes('utilitaire') ? 'utilitaire' : 'tourisme');

  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    type: currentType, // forcé par la page
    fuel_type: '',
    transmission: '',
    passengers: '',
  });

  useEffect(() => {
    setFilters((f) => ({ ...f, type: currentType }));
  }, [currentType]);

  useEffect(() => {
    fetchData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    if (!API) {
      setCategories(VEHICLE_CATEGORIES);
      let v = VEHICLE_PRODUCTS;
      if (filters.category) v = v.filter((x) => (x.categoryId || x.id) === filters.category);
      if (filters.type) v = v.filter((x) => (x.vehicleType || (x.categoryId === 'utilitaire' ? 'utilitaire' : 'tourisme')) === filters.type);
      setVehicles(v);
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category_id', filters.category);
      if (filters.type) params.set('vehicle_type', filters.type);
      if (filters.fuel_type) params.set('fuel_type', filters.fuel_type);
      if (filters.transmission) params.set('transmission', filters.transmission);
      if (filters.passengers) params.set('passengers', filters.passengers);

      const [vehiclesRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/vehicles?${params.toString()}`).catch(() => ({ data: [] })),
        axios.get(`${API}/vehicles/categories`).catch(() => ({ data: [] }))
      ]);
      const vData = vehiclesRes.data || [];
      const cData = categoriesRes.data || [];
      let vDataFiltered = Array.isArray(vData) && vData.length > 0 ? vData : VEHICLE_PRODUCTS;
      if (filters.type) {
        vDataFiltered = vDataFiltered.filter((x) => (x.vehicleType || (x.categoryId === 'utilitaire' ? 'utilitaire' : 'tourisme')) === filters.type);
      }
      setVehicles(vDataFiltered);
      setCategories(Array.isArray(cData) && cData.length > 0 ? cData : VEHICLE_CATEGORIES);
    } catch (error) {
      console.warn('API non disponible, utilisation des données statiques:', error.message);
      setVehicles(VEHICLE_PRODUCTS);
      setCategories(VEHICLE_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', type: currentType, fuel_type: '', transmission: '', passengers: '' });
    setSearchParams({});
  };

  const handleTypeChange = (newType) => {
    navigate(`/vehicles/${newType}`);
  };

  const getVehicleType = (v) => v.vehicleType || (v.categoryId === 'utilitaire' ? 'utilitaire' : 'tourisme');
  const displayedVehicles = vehicles.filter((v) => getVehicleType(v) === currentType);

  const getTagIcon = (tag) => {
    switch (tag) {
      case 'electric': return <Zap className="h-3 w-3" />;
      case 'new': return <Star className="h-3 w-3" />;
      case 'favorite': return <Heart className="h-3 w-3" />;
      default: return null;
    }
  };

  const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];
  const transmissions = ['manual', 'automatic'];

  const renderVehicleCard = (vehicle) => {
    const img = vehicle.image_url || vehicle.image || vehicle.imageThumb;
    const displayName = vehicle.name ? (i18n.language === 'fr' ? vehicle.name.fr : vehicle.name.en) : (vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.model);
    const passengers = vehicle.specs?.passengers ?? vehicle.passengers ?? vehicle.seats ?? 5;
    const bags = vehicle.specs?.bags ?? vehicle.luggage ?? 2;
    const trans = vehicle.specs?.transmission ? (i18n.language === 'fr' ? vehicle.specs.transmission.fr : vehicle.specs.transmission.en) : (vehicle.transmission === 'automatic' ? 'Auto' : vehicle.transmission === 'manual' ? 'Manuelle' : vehicle.transmission);
    const fuel = vehicle.specs?.fuel ? (i18n.language === 'fr' ? vehicle.specs.fuel.fr : vehicle.specs.fuel.en) : vehicle.fuel_type;
    const sectionLabel = getVehicleType(vehicle) === 'utilitaire' ? 'Utilitaires' : 'VP';
    return (
      <Card key={vehicle.id || vehicle.categoryId} className="overflow-hidden card-hover group">
        <div className="aspect-video bg-white relative overflow-hidden">
          {img ? (
            <img src={img} alt={displayName} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Car className="h-16 w-16 text-slate-400" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-[#F9A826] text-white text-xs">{sectionLabel}</Badge>
          </div>
          {(vehicle.tags?.length > 0 || vehicle.specs?.fuel?.fr === 'Électrique') && (
            <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
              {(vehicle.tags || []).slice(0, 2).map((tag) => (
                <Badge key={tag} className="bg-slate-700/80 text-white text-xs">
                  {getTagIcon(tag)}
                  <span className="ml-1">{tag}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-slate-800">{displayName}</h3>
            <p className="text-sm text-slate-500">{vehicle.model || vehicle.year}</p>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
              <Users className="h-4 w-4 text-slate-600 mb-1" />
              <span className="text-xs text-slate-600">{passengers}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
              <Briefcase className="h-4 w-4 text-slate-600 mb-1" />
              <span className="text-xs text-slate-600">{bags}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
              <Settings className="h-4 w-4 text-slate-600 mb-1" />
              <span className="text-xs text-slate-600">{trans ? (trans.includes('Auto') ? 'A' : 'M') : '-'}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
              <Fuel className="h-4 w-4 text-slate-600 mb-1" />
              <span className="text-xs text-slate-600 capitalize">{fuel ? String(fuel).slice(0, 3) : '-'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{i18n.language === 'fr' ? 'À partir de' : 'From'} —</span>
            <Button asChild className="btn-primary">
              <Link to={`/booking?vehicle=${vehicle.id || vehicle.categoryId}`} data-testid={`book-${vehicle.id}`}>
                {i18n.language === 'fr' ? 'Réserver' : 'Book'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="vehicles-page">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {i18n.language === 'fr' ? 'Nos véhicules' : 'Our Vehicles'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
            {i18n.language === 'fr' 
              ? 'Choisissez le type de véhicule'
              : 'Choose vehicle type'}
          </p>
          {/* Menu déroulant pour changer de page */}
          <div className="flex justify-center">
            <Select value={currentType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full max-w-md bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 text-base font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourisme">
                  {i18n.language === 'fr' ? 'Véhicules de tourisme' : 'Passenger vehicles'}
                </SelectItem>
                <SelectItem value="utilitaire">
                  {i18n.language === 'fr' ? 'Véhicules utilitaires' : 'Utility vehicles'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="flex-1 py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">
                      {i18n.language === 'fr' ? 'Filtres' : 'Filters'}
                    </h3>
                    {Object.values(filters).some(v => v) && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        {i18n.language === 'fr' ? 'Effacer' : 'Clear'}
                      </Button>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {i18n.language === 'fr' ? 'Catégorie' : 'Category'}
                    </label>
                    <Select 
                      value={filters.category || "all"} 
                      onValueChange={(v) => setFilters({...filters, category: v === "all" ? "" : v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={i18n.language === 'fr' ? 'Toutes' : 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {i18n.language === 'fr' ? 'Toutes les catégories' : 'All categories'}
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id || cat.categoryId} value={cat.id || cat.categoryId}>
                            {(i18n.language === 'fr' ? cat.name?.fr : cat.name?.en) || cat.name_fr || cat.name_en || cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {i18n.language === 'fr' ? 'Carburant' : 'Fuel Type'}
                    </label>
                    <Select 
                      value={filters.fuel_type || "all"} 
                      onValueChange={(v) => setFilters({...filters, fuel_type: v === "all" ? "" : v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={i18n.language === 'fr' ? 'Tous' : 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{i18n.language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                        {fuelTypes.map((fuel) => (
                          <SelectItem key={fuel} value={fuel} className="capitalize">
                            {fuel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {i18n.language === 'fr' ? 'Transmission' : 'Transmission'}
                    </label>
                    <Select 
                      value={filters.transmission || "all"} 
                      onValueChange={(v) => setFilters({...filters, transmission: v === "all" ? "" : v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={i18n.language === 'fr' ? 'Toutes' : 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{i18n.language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                        {transmissions.map((trans) => (
                          <SelectItem key={trans} value={trans} className="capitalize">
                            {trans === 'manual' 
                              ? (i18n.language === 'fr' ? 'Manuelle' : 'Manual')
                              : (i18n.language === 'fr' ? 'Automatique' : 'Automatic')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {i18n.language === 'fr' ? 'Passagers min.' : 'Min. Passengers'}
                    </label>
                    <Select 
                      value={filters.passengers || "all"} 
                      onValueChange={(v) => setFilters({...filters, passengers: v === "all" ? "" : v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={i18n.language === 'fr' ? 'Tous' : 'Any'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{i18n.language === 'fr' ? 'Tous' : 'Any'}</SelectItem>
                        {[2, 4, 5, 7, 9].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}+ {i18n.language === 'fr' ? 'places' : 'seats'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4 flex justify-between items-center">
                <p className="text-slate-600">
                  {displayedVehicles.length} {i18n.language === 'fr' ? 'véhicules' : 'vehicles'}
                </p>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {i18n.language === 'fr' ? 'Filtres' : 'Filters'}
                </Button>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <Card className="lg:hidden mb-4">
                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                    <Select 
                      value={filters.category || "all"} 
                      onValueChange={(v) => setFilters({...filters, category: v === "all" ? "" : v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={i18n.language === 'fr' ? 'Catégorie' : 'Category'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{i18n.language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {(i18n.language === 'fr' ? cat.name?.fr : cat.name?.en) || cat.name_fr || cat.name_en || cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.fuel_type || "all"} 
                      onValueChange={(v) => setFilters({...filters, fuel_type: v === "all" ? "" : v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={i18n.language === 'fr' ? 'Carburant' : 'Fuel'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{i18n.language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                        {fuelTypes.map((fuel) => (
                          <SelectItem key={fuel} value={fuel} className="capitalize">{fuel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Results Header */}
              <div className="hidden lg:flex justify-between items-center mb-6">
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-800">{displayedVehicles.length}</span> {i18n.language === 'fr' ? 'véhicules disponibles' : 'vehicles available'}
                </p>
              </div>

              {/* Grille des véhicules (page tourisme ou utilitaire) */}
              {loading ? (
                <div className="flex justify-center h-64 items-center">
                  <div className="h-8 w-8 border-4 border-[#F9A826] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : displayedVehicles.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-[#332859] mb-2">
                    {currentType === 'tourisme' 
                      ? (i18n.language === 'fr' ? 'Véhicules de tourisme' : 'Passenger vehicles')
                      : (i18n.language === 'fr' ? 'Véhicules utilitaires' : 'Utility vehicles')}
                  </h2>
                  <p className="text-slate-600 mb-6">
                    {currentType === 'tourisme' 
                      ? (i18n.language === 'fr' ? 'Découvrez notre gamme de voitures pour vos déplacements personnels et professionnels.' : 'Discover our range of cars for your personal and business travel.')
                      : (i18n.language === 'fr' ? 'Envie de louer un véhicule utilitaire ? Sélectionnez le modèle de votre choix puis votre agence la plus proche et réservez en ligne à prix Auto Discount !' : 'Want to rent a utility vehicle? Select the model of your choice, then your nearest agency and book online at Auto Discount price!')}
                  </p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedVehicles.map((v) => renderVehicleCard(v))}
                  </div>
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {i18n.language === 'fr' ? 'Aucun véhicule trouvé' : 'No vehicles found'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {i18n.language === 'fr' 
                      ? 'Essayez de modifier vos filtres'
                      : 'Try adjusting your filters'}
                  </p>
                  <Button onClick={clearFilters}>
                    {i18n.language === 'fr' ? 'Effacer les filtres' : 'Clear filters'}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default VehiclesPage;
