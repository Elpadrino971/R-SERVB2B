import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VehiclesPage = () => {
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    fuel_type: '',
    transmission: '',
    passengers: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category_id', filters.category);
      if (filters.fuel_type) params.set('fuel_type', filters.fuel_type);
      if (filters.transmission) params.set('transmission', filters.transmission);
      if (filters.passengers) params.set('passengers', filters.passengers);

      const [vehiclesRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/vehicles?${params.toString()}`),
        axios.get(`${API}/vehicles/categories`)
      ]);
      setVehicles(vehiclesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', fuel_type: '', transmission: '', passengers: '' });
    setSearchParams({});
  };

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

  return (
    <div className="min-h-screen flex flex-col" data-testid="vehicles-page">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {i18n.language === 'fr' ? 'Notre flotte de véhicules' : 'Our Vehicle Fleet'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {i18n.language === 'fr' 
              ? 'Découvrez notre gamme complète de véhicules pour tous vos besoins'
              : 'Discover our complete range of vehicles for all your needs'}
          </p>
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
                          <SelectItem key={cat.id} value={cat.id}>
                            {i18n.language === 'fr' ? cat.name_fr : cat.name_en}
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
                  {vehicles.length} {i18n.language === 'fr' ? 'véhicules' : 'vehicles'}
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
                            {i18n.language === 'fr' ? cat.name_fr : cat.name_en}
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
                  <span className="font-semibold text-slate-800">{vehicles.length}</span> {i18n.language === 'fr' ? 'véhicules disponibles' : 'vehicles available'}
                </p>
              </div>

              {/* Vehicle Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : vehicles.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden card-hover group">
                      <div className="aspect-video bg-slate-200 relative overflow-hidden">
                        {vehicle.image_url ? (
                          <img 
                            src={vehicle.image_url} 
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                                {getTagIcon(tag)}
                                <span className="ml-1">{tag}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg text-slate-800">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-sm text-slate-500">{vehicle.year}</p>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                            <Users className="h-4 w-4 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-600">{vehicle.passengers}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                            <Briefcase className="h-4 w-4 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-600">{vehicle.luggage}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                            <Settings className="h-4 w-4 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-600 capitalize">
                              {vehicle.transmission === 'manual' ? 'M' : 'A'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
                            <Fuel className="h-4 w-4 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-600 capitalize">
                              {vehicle.fuel_type?.slice(0, 3)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-[#3D3A6B]">
                              {i18n.language === 'fr' ? 'À partir de' : 'From'}
                            </span>
                          </div>
                          <Button asChild className="btn-primary">
                            <Link to={`/book?vehicle=${vehicle.id}`} data-testid={`book-${vehicle.id}`}>
                              {i18n.language === 'fr' ? 'Réserver' : 'Book'}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
