import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon, Car, MapPin, Users, Luggage, DollarSign,
  Shield, Plus, ChevronRight, ChevronLeft, Check, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Search form
  const [agencies, setAgencies] = useState([]);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [pickupAgency, setPickupAgency] = useState('');
  const [returnAgency, setReturnAgency] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');

  // Step 2: Vehicle selection
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Step 3: Options & Insurance
  const [options, setOptions] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  // Step 4: Customer info
  const [customerInfo, setCustomerInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    driver_license: '',
    notes: ''
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('on_site'); // on_site or link

  // Pricing
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [agenciesRes, categoriesRes, optionsRes, insurancesRes] = await Promise.all([
        axios.get(`${API}/agencies`),
        axios.get(`${API}/vehicles/categories`),
        axios.get(`${API}/options`),
        axios.get(`${API}/insurances`)
      ]);
      setAgencies(agenciesRes.data);
      setCategories(categoriesRes.data);
      setOptions(optionsRes.data);
      setInsurances(insurancesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const searchVehicles = async () => {
    if (!pickupDate || !returnDate || !pickupAgency || !returnAgency) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/vehicles`, {
        params: {
          agency: pickupAgency,
          pickup_date: format(pickupDate, 'yyyy-MM-dd'),
          return_date: format(returnDate, 'yyyy-MM-dd')
        }
      });
      setVehicles(response.data);
      setStep(2);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const selectVehicle = async (vehicle) => {
    setSelectedVehicle(vehicle);

    // Calculate pricing
    try {
      const response = await axios.get(`${API}/pricing`, {
        params: {
          category: vehicle.category,
          pickup_date: format(pickupDate, 'yyyy-MM-dd'),
          return_date: format(returnDate, 'yyyy-MM-dd'),
          pickup_agency: pickupAgency,
          return_agency: returnAgency
        }
      });
      setPricing(response.data);
      setStep(3);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      toast.error('Erreur lors du calcul du prix');
    }
  };

  const calculateTotal = () => {
    if (!pricing) return 0;

    let total = pricing.total_price || 0;

    // Add selected options
    selectedOptions.forEach(optId => {
      const opt = options.find(o => o.id === optId);
      if (opt) {
        total += opt.price_per_day * (pricing.rental_days || 1);
      }
    });

    // Add insurance
    if (selectedInsurance) {
      const ins = insurances.find(i => i.id === selectedInsurance);
      if (ins) {
        total += ins.price_per_day * (pricing.rental_days || 1);
      }
    }

    return total.toFixed(2);
  };

  const createReservation = async () => {
    if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Veuillez remplir toutes les informations client');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        pickup_date: format(pickupDate, 'yyyy-MM-dd'),
        pickup_time: pickupTime,
        return_date: format(returnDate, 'yyyy-MM-dd'),
        return_time: returnTime,
        pickup_agency_id: pickupAgency,
        return_agency_id: returnAgency,
        vehicle_category: selectedVehicle.category,
        customer_info: customerInfo,
        selected_options: selectedOptions,
        insurance_id: selectedInsurance,
        total_price: parseFloat(calculateTotal()),
        agent_id: user?.id,
        payment_method: paymentMethod
      };

      const response = await axios.post(`${API}/reservations`, reservationData);

      // Si paiement par lien, envoyer le lien
      if (paymentMethod === 'link') {
        try {
          await axios.post(
            `${API}/reservations/${response.data.id}/send-payment-link`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          toast.success(`Réservation créée et lien de paiement envoyé au client !`);
        } catch (linkError) {
          console.error('Error sending payment link:', linkError);
          toast.warning('Réservation créée mais erreur d\'envoi du lien de paiement');
        }
      } else {
        toast.success(`Réservation créée avec succès ! Numéro: ${response.data.reference}`);
      }

      // Redirect to reservations list
      if (user?.role === 'agent') {
        navigate('/agent/reservations');
      } else if (user?.role === 'company') {
        navigate('/company/reservations');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = selectedCategory
    ? vehicles.filter(v => v.category === selectedCategory)
    : vehicles;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Recherche' },
              { num: 2, label: 'Véhicule' },
              { num: 3, label: 'Options' },
              { num: 4, label: 'Confirmation' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s.num
                      ? 'bg-[#F5A623] text-black'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}>
                    {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                  </div>
                  <span className={`hidden sm:block ${step >= s.num ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s.num ? 'bg-[#F5A623]' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Search Form */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#F5A623]" />
                Rechercher un véhicule
              </CardTitle>
              <CardDescription>Sélectionnez vos dates et agences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pickup Date */}
                <div>
                  <Label>Date de départ *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Date */}
                <div>
                  <Label>Date de retour *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        disabled={(date) => date < (pickupDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Pickup Time */}
                <div>
                  <Label>Heure de départ *</Label>
                  <Input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>

                {/* Return Time */}
                <div>
                  <Label>Heure de retour *</Label>
                  <Input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                  />
                </div>

                {/* Pickup Agency */}
                <div>
                  <Label>Agence de départ *</Label>
                  <Select value={pickupAgency} onValueChange={setPickupAgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map(agency => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Return Agency */}
                <div>
                  <Label>Agence de retour *</Label>
                  <Select value={returnAgency} onValueChange={setReturnAgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map(agency => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={searchVehicles}
                className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
                disabled={loading}
              >
                {loading ? 'Recherche...' : 'Rechercher des véhicules'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vehicle Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#F5A623]" />
                  Choisir un véhicule
                </CardTitle>
                <CardDescription>
                  {filteredVehicles.length} véhicules disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="mb-6">
                  <Label>Filtrer par catégorie</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map(vehicle => (
                    <Card
                      key={vehicle.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => selectVehicle(vehicle)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                          <Car className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{vehicle.name}</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {vehicle.passengers} passagers
                          </div>
                          <div className="flex items-center gap-2">
                            <Luggage className="h-4 w-4" />
                            {vehicle.luggage} bagages
                          </div>
                        </div>
                        {vehicle.tags && vehicle.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {vehicle.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button className="w-full mt-3 bg-[#F5A623] hover:bg-[#F5A623]/90 text-black">
                          Sélectionner
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        )}

        {/* Step 3: Options & Insurance */}
        {step === 3 && selectedVehicle && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#F5A623]" />
                  Options et Assurances
                </CardTitle>
                <CardDescription>
                  Véhicule sélectionné: {selectedVehicle.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing Summary */}
                {pricing && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Tarif de base ({pricing.rental_days} jours)</span>
                      <span className="font-semibold">{pricing.base_price?.toFixed(2)} €</span>
                    </div>
                    {pricing.season && (
                      <div className="text-sm text-slate-500">Saison: {pricing.season}</div>
                    )}
                  </div>
                )}

                {/* Options */}
                <div>
                  <h3 className="font-semibold mb-3">Options disponibles</h3>
                  <div className="space-y-2">
                    {options.map(option => (
                      <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedOptions.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOptions([...selectedOptions, option.id]);
                              } else {
                                setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                              }
                            }}
                          />
                          <div>
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-slate-500">{option.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{option.price_per_day?.toFixed(2)} €/jour</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <h3 className="font-semibold mb-3">Assurance</h3>
                  <div className="space-y-2">
                    {insurances.map(insurance => (
                      <div
                        key={insurance.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedInsurance === insurance.id
                            ? 'border-[#F5A623] bg-[#F5A623]/5'
                            : 'hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedInsurance(insurance.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium mb-1">{insurance.name}</div>
                            <div className="text-sm text-slate-600">{insurance.description}</div>
                            <div className="text-sm text-slate-500 mt-2">
                              Franchise: {insurance.deductible} €
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{insurance.price_per_day?.toFixed(2)} €/jour</div>
                            {selectedInsurance === insurance.id && (
                              <Check className="h-5 w-5 text-[#F5A623] ml-auto mt-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[#3D3A6B] text-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">{calculateTotal()} €</span>
                  </div>
                  <div className="text-sm text-white/70 mt-1">TTC pour {pricing?.rental_days} jours</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1 bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
                onClick={() => setStep(4)}
              >
                Continuer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Customer Info & Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Client</CardTitle>
                <CardDescription>Complétez les informations du conducteur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom *</Label>
                    <Input
                      value={customerInfo.first_name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, first_name: e.target.value })}
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={customerInfo.last_name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, last_name: e.target.value })}
                      placeholder="Dupont"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                    />
                  </div>
                  <div>
                    <Label>Téléphone *</Label>
                    <Input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <Label>Numéro de permis</Label>
                    <Input
                      value={customerInfo.driver_license}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, driver_license: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes (optionnel)</Label>
                  <Input
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Informations supplémentaires..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reservation Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif de la réservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Véhicule</div>
                    <div className="font-medium">{selectedVehicle?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Catégorie</div>
                    <div className="font-medium">{selectedVehicle?.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Départ</div>
                    <div className="font-medium">
                      {pickupDate && format(pickupDate, 'PPP', { locale: fr })} à {pickupTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Retour</div>
                    <div className="font-medium">
                      {returnDate && format(returnDate, 'PPP', { locale: fr })} à {returnTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Agence de départ</div>
                    <div className="font-medium">
                      {agencies.find(a => a.id === pickupAgency)?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Agence de retour</div>
                    <div className="font-medium">
                      {agencies.find(a => a.id === returnAgency)?.name}
                    </div>
                  </div>
                </div>

                {selectedOptions.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-500 mb-2">Options sélectionnées</div>
                    <div className="space-y-1">
                      {selectedOptions.map(optId => {
                        const opt = options.find(o => o.id === optId);
                        return opt ? (
                          <div key={optId} className="flex justify-between text-sm">
                            <span>{opt.name}</span>
                            <span>{opt.price_per_day * (pricing?.rental_days || 1)} €</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {selectedInsurance && (
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Assurance</div>
                    <div className="font-medium">
                      {insurances.find(i => i.id === selectedInsurance)?.name}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total TTC</span>
                    <span className="text-[#F5A623]">{calculateTotal()} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Mode de paiement</CardTitle>
                <CardDescription>Choisissez comment le client règlera la réservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'on_site'
                        ? 'border-[#F5A623] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('on_site')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'on_site' ? 'border-[#F5A623]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'on_site' && (
                          <div className="h-3 w-3 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">Sur place</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Le client paiera directement à l'agence lors de la prise en charge du véhicule
                    </p>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'link'
                        ? 'border-[#F5A623] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('link')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'link' ? 'border-[#F5A623]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'link' && (
                          <div className="h-3 w-3 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">Lien de paiement</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Un lien de paiement sera envoyé par email au client
                    </p>
                  </div>
                </div>

                {paymentMethod === 'link' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <strong>Information :</strong> Un email sera automatiquement envoyé à {customerInfo.email || 'l\'adresse email du client'} avec un lien sécurisé pour effectuer le paiement en ligne.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1 bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
                onClick={createReservation}
                disabled={loading}
              >
                {loading ? 'Création...' : 'Confirmer la réservation'}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
