import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  Shield, Plus, ChevronRight, ChevronLeft, Check, AlertCircle,
  Infinity, Clock, XCircle, Tag, Percent, Info, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicle');
  const isPublicRoute = location.pathname === '/booking';
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Search form
  const [agencies, setAgencies] = useState([]);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [pickupAgency, setPickupAgency] = useState(undefined);
  const [returnAgency, setReturnAgency] = useState(undefined);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');

  // Step 2: Vehicle selection
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    license_issue_date: '',
    notes: ''
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('pay_on_arrival'); // pay_on_arrival | pay_by_link
  const [paymentUrl, setPaymentUrl] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Pricing
  const [pricing, setPricing] = useState(null);

  // Availability & Stop-Sales
  const [availabilityStatuses, setAvailabilityStatuses] = useState({});

  // Promos
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [autoPromos, setAutoPromos] = useState([]);
  const [checkingPromo, setCheckingPromo] = useState(false);

  // Group booking
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [showGroupSection, setShowGroupSection] = useState(false);
  const [groupVehicleCount, setGroupVehicleCount] = useState(2);
  const [groupDrivers, setGroupDrivers] = useState([]);
  const [groupConfirmedReservations, setGroupConfirmedReservations] = useState(null);
  const [expandedDriver, setExpandedDriver] = useState(0);

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
      const vehicleList = response.data;
      setVehicles(vehicleList);

      // Fetch availability statuses for all unique categories
      const uniqueCategories = [...new Set(vehicleList.map(v => v.category_id).filter(Boolean))];
      const bookingDate = format(new Date(), 'yyyy-MM-dd');
      const statusMap = {};
      await Promise.allSettled(
        uniqueCategories.map(async (catId) => {
          try {
            const sRes = await axios.get(`${API}/availability-status`, {
              params: { category_id: catId, agency_id: pickupAgency, date: bookingDate }
            });
            if (sRes.data?.status) statusMap[catId] = sRes.data.status;
          } catch (_) {}
        })
      );
      setAvailabilityStatuses(statusMap);

      // Auto-select vehicle if coming from vehicles page (?vehicle=id)
      if (preselectedVehicleId) {
        const match = vehicleList.find(v => v.id === preselectedVehicleId || v.categoryId === preselectedVehicleId);
        if (match) {
          setLoading(false);
          await selectVehicleInternal(match, statusMap);
          return;
        }
      }

      setStep(2);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const selectVehicleInternal = async (vehicle, statusMap) => {
    // Check stop-sales
    try {
      const stopRes = await axios.post(`${API}/check-stop-sales`, {
        booking_date: format(new Date(), 'yyyy-MM-dd'),
        checkout_date: format(pickupDate, 'yyyy-MM-dd'),
        checkin_date: format(returnDate, 'yyyy-MM-dd'),
        category_id: vehicle.category_id,
        agency_id: pickupAgency,
        user_role: user?.role || 'agent',
        user_id: user?.id,
      });
      if (stopRes.data?.blocked) {
        toast.error(stopRes.data.reason || 'Cette catégorie n\'est pas disponible à la vente pour cette période');
        setLoading(false);
        return;
      }
    } catch (_) {
      // If endpoint unavailable, continue
    }

    // Check availability status — if non_available, block
    const avStatus = statusMap[vehicle.category_id];
    if (avStatus === 'non_available') {
      toast.error('Cette catégorie est fermée à la vente pour la période sélectionnée');
      setLoading(false);
      return;
    }

    setSelectedVehicle(vehicle);
    // Reset promo state
    setPromoCode('');
    setPromoResult(null);
    setAutoPromos([]);

    // Calculate pricing
    try {
      const response = await axios.get(`${API}/pricing`, {
        params: {
          category_id: vehicle.category_id,
          pickup_date: format(pickupDate, 'yyyy-MM-dd'),
          return_date: format(returnDate, 'yyyy-MM-dd'),
          agency_id: pickupAgency,
        }
      });
      const pricingData = response.data;
      setPricing(pricingData);

      // Check auto promos
      try {
        const rentalDays = pricingData.rental_days || 1;
        const autoRes = await axios.post(`${API}/promos/auto-check`, {
          category_id: vehicle.category_id,
          rental_days: rentalDays,
          total_price: pricingData.base_price || pricingData.total_price || 0,
          booking_date: format(new Date(), 'yyyy-MM-dd'),
          pickup_date: format(pickupDate, 'yyyy-MM-dd'),
          return_date: format(returnDate, 'yyyy-MM-dd'),
          user_role: user?.role || 'agent',
        });
        setAutoPromos(autoRes.data || []);
      } catch (_) {}

      setStep(3);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      toast.error('Erreur lors du calcul du prix');
    } finally {
      setLoading(false);
    }
  };

  const selectVehicle = async (vehicle) => {
    setLoading(true);
    await selectVehicleInternal(vehicle, availabilityStatuses);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setCheckingPromo(true);
    try {
      const res = await axios.post(`${API}/promos/validate`, {
        code: promoCode.trim().toUpperCase(),
        category_id: selectedVehicle?.category_id,
        rental_days: pricing?.rental_days || 1,
        total_price: pricing?.base_price || pricing?.total_price || 0,
        pickup_date: format(pickupDate, 'yyyy-MM-dd'),
        return_date: format(returnDate, 'yyyy-MM-dd'),
        user_role: user?.role || 'agent',
      });
      setPromoResult(res.data);
      if (res.data?.valid) {
        toast.success(`Code appliqué : -${res.data.discount_amount?.toFixed(2)} €`);
      } else {
        toast.error(res.data?.message || 'Code invalide');
      }
    } catch (e) {
      toast.error('Erreur lors de la validation du code');
    } finally {
      setCheckingPromo(false);
    }
  };

  const buildPriceBreakdown = () => {
    if (!pricing) return null;
    const rentalDays = pricing.rental_days || 1;
    const basePrice = pricing.base_price || pricing.total_price || 0;

    const optionsList = selectedOptions.map(optId => {
      const opt = options.find(o => o.id === optId);
      if (!opt) return null;
      const total = opt.price_per_day * rentalDays;
      return { id: opt.id, name: opt.name, price_per_day: opt.price_per_day, days: rentalDays, total };
    }).filter(Boolean);
    const optionsTotal = optionsList.reduce((s, o) => s + o.total, 0);

    const ins = selectedInsurance ? insurances.find(i => i.id === selectedInsurance) : null;
    const insuranceTotal = ins ? ins.price_per_day * rentalDays : 0;

    const subtotalHT = basePrice + optionsTotal + insuranceTotal;

    // Discount: promo code takes priority over auto promo
    let discountAmount = 0;
    let discountLabel = null;
    if (promoResult?.valid) {
      discountAmount = promoResult.discount_amount || 0;
      discountLabel = promoCode.toUpperCase();
    } else if (autoPromos.length > 0) {
      discountAmount = autoPromos[0].discount_amount || 0;
      discountLabel = autoPromos[0].name;
    }

    const totalHT = Math.max(0, subtotalHT - discountAmount);
    const tvaRate = 8.5;
    const tvaAmount = totalHT * tvaRate / 100;
    const totalTTC = totalHT + tvaAmount;

    return {
      base_price: basePrice,
      rental_days: rentalDays,
      season: typeof pricing.season === 'object' ? (pricing.season?.name || pricing.season?.code || '') : (pricing.season || ''),
      week_type: pricing.week_type,
      options: optionsList,
      options_total: optionsTotal,
      insurance: ins ? { id: ins.id, name: ins.name, price_per_day: ins.price_per_day, days: rentalDays, total: insuranceTotal } : null,
      insurance_total: insuranceTotal,
      subtotal_ht: subtotalHT,
      discount_label: discountLabel,
      discount_amount: discountAmount,
      total_ht: totalHT,
      tva_rate: tvaRate,
      tva_amount: tvaAmount,
      total_ttc: totalTTC,
      locked_at: new Date().toISOString(),
    };
  };

  const calculateTotal = () => {
    return buildPriceBreakdown()?.total_ttc?.toFixed(2) || '0.00';
  };

  const createReservation = async () => {
    if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Veuillez remplir toutes les informations client');
      return;
    }

    setLoading(true);
    try {
      const breakdown = buildPriceBreakdown();
      const avStatus = availabilityStatuses[selectedVehicle?.category_id];

      const reservationData = {
        pickup_date: format(pickupDate, 'yyyy-MM-dd'),
        pickup_time: pickupTime,
        return_date: format(returnDate, 'yyyy-MM-dd'),
        return_time: returnTime,
        pickup_agency_id: pickupAgency,
        return_agency_id: returnAgency,
        vehicle_category_id: selectedVehicle.category_id,
        driver_info: customerInfo,
        options: selectedOptions,
        insurance_id: selectedInsurance,
        total_price: breakdown ? parseFloat(breakdown.total_ttc.toFixed(2)) : parseFloat(calculateTotal()),
        price_before_discount: breakdown ? parseFloat(breakdown.subtotal_ht.toFixed(2)) : 0,
        discount_amount: breakdown?.discount_amount || 0,
        promo_code_used: promoResult?.valid ? promoCode.toUpperCase() : null,
        auto_promo_applied: !promoResult?.valid && autoPromos.length > 0 ? autoPromos[0].rule_id : null,
        price_breakdown: breakdown,
        agent_id: user?.id,
        payment_mode: paymentMethod,
        // If on_request status → status will be pending_approval (handled by backend)
        availability_status: avStatus || null,
      };

      const response = await axios.post(`${API}/reservations`, reservationData);

      // Si paiement par lien et URL fournie, envoyer le lien immédiatement
      if (paymentMethod === 'pay_by_link' && paymentUrl.trim()) {
        try {
          await axios.post(`${API}/reservations/${response.data.id}/send-payment-link`, {
            payment_url: paymentUrl.trim(),
          });
          toast.success('Lien de paiement envoyé au client par email !');
        } catch (linkError) {
          console.error('Error sending payment link:', linkError);
          toast.warning('Réservation créée, mais l\'envoi du lien de paiement a échoué. Vous pouvez le renvoyer depuis l\'admin.');
        }
      }

      // Afficher l'écran de confirmation au lieu de rediriger
      setConfirmedReservation({
        id: response.data.id,
        reference: response.data.reference,
        paymentMode: paymentMethod,
        paymentUrl: paymentUrl.trim(),
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.first_name} ${customerInfo.last_name}`,
        totalPrice: breakdown ? breakdown.total_ttc : parseFloat(calculateTotal()),
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        returnDate: format(returnDate, 'yyyy-MM-dd'),
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const initGroupDrivers = (count) => {
    setGroupDrivers(Array.from({ length: count }, () => ({
      first_name: '', last_name: '', email: '', phone: '', driver_license: '', license_issue_date: '', notes: ''
    })));
    setExpandedDriver(0);
  };

  const updateGroupDriver = (index, field, value) => {
    setGroupDrivers(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const createGroupReservations = async () => {
    const invalid = groupDrivers.findIndex(d => !d.first_name || !d.last_name || !d.email || !d.phone);
    if (invalid !== -1) {
      toast.error(`Veuillez remplir les informations du conducteur ${invalid + 1}`);
      setExpandedDriver(invalid);
      return;
    }

    setLoading(true);
    const breakdown = buildPriceBreakdown();
    const avStatus = availabilityStatuses[selectedVehicle?.category_id];
    const results = [];

    try {
      for (let i = 0; i < groupDrivers.length; i++) {
        const driver = groupDrivers[i];
        const reservationData = {
          pickup_date: format(pickupDate, 'yyyy-MM-dd'),
          pickup_time: pickupTime,
          return_date: format(returnDate, 'yyyy-MM-dd'),
          return_time: returnTime,
          pickup_agency_id: pickupAgency,
          return_agency_id: returnAgency,
          vehicle_category_id: selectedVehicle.category_id,
          driver_info: driver,
          options: selectedOptions,
          insurance_id: selectedInsurance,
          total_price: breakdown ? parseFloat(breakdown.total_ttc.toFixed(2)) : parseFloat(calculateTotal()),
          price_before_discount: breakdown ? parseFloat(breakdown.subtotal_ht.toFixed(2)) : 0,
          discount_amount: breakdown?.discount_amount || 0,
          promo_code_used: promoResult?.valid ? promoCode.toUpperCase() : null,
          auto_promo_applied: !promoResult?.valid && autoPromos.length > 0 ? autoPromos[0].rule_id : null,
          price_breakdown: breakdown,
          agent_id: user?.id,
          payment_mode: paymentMethod,
          availability_status: avStatus || null,
          is_group_booking: true,
          group_vehicle_index: i + 1,
          group_total_vehicles: groupDrivers.length,
        };
        const response = await axios.post(`${API}/reservations`, reservationData);
        results.push({
          id: response.data.id,
          reference: response.data.reference,
          driverName: `${driver.first_name} ${driver.last_name}`,
          vehicleIndex: i + 1,
        });
      }

      setGroupConfirmedReservations({
        reservations: results,
        totalVehicles: groupDrivers.length,
        pricePerVehicle: breakdown ? breakdown.total_ttc : parseFloat(calculateTotal()),
        totalPrice: (breakdown ? breakdown.total_ttc : parseFloat(calculateTotal())) * groupDrivers.length,
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        returnDate: format(returnDate, 'yyyy-MM-dd'),
      });
    } catch (error) {
      console.error('Error creating group reservations:', error);
      toast.error('Erreur lors de la création des réservations groupe');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = selectedCategory && selectedCategory !== 'all'
    ? vehicles.filter(v => v.category_id === selectedCategory)
    : vehicles;

  // Écran de confirmation post-réservation
  if (confirmedReservation) {
    const listPath = user?.role === 'agent' ? '/agent/reservations' : user?.role === 'company' ? '/company/reservations' : isPublicRoute ? '/' : '/admin/reservations';
    const confirmContent = (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Réservation confirmée !</h2>
                <p className="text-gray-500 mt-1">La réservation a été enregistrée avec succès.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Numéro de réservation</span>
                  <span className="font-bold text-[#3D3A6B] text-lg">{confirmedReservation.reference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Client</span>
                  <span className="font-medium">{confirmedReservation.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Email client</span>
                  <span className="font-medium">{confirmedReservation.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Période</span>
                  <span className="font-medium">{confirmedReservation.pickupDate} → {confirmedReservation.returnDate}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total TTC</span>
                  <span className="font-bold text-[#F5A623] text-lg">{confirmedReservation.totalPrice?.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mode de règlement</span>
                  <span className="font-medium">
                    {confirmedReservation.paymentMode === 'pay_by_link'
                      ? confirmedReservation.paymentUrl ? 'Lien envoyé par email' : 'Lien de paiement (à envoyer)'
                      : 'Sur place en agence'}
                  </span>
                </div>
              </div>
              {confirmedReservation.paymentMode === 'pay_on_arrival' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 text-left">
                  Un email de confirmation a été envoyé au client. Il réglera sur place lors de la prise en charge.
                </div>
              )}
              {confirmedReservation.paymentMode === 'pay_by_link' && !confirmedReservation.paymentUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 text-left">
                  Aucun lien de paiement n'a été renseigné. Vous pouvez l'envoyer depuis la liste des réservations.
                </div>
              )}
              {confirmedReservation.paymentMode === 'pay_by_link' && confirmedReservation.paymentUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 text-left">
                  Le lien de paiement a été envoyé à {confirmedReservation.customerEmail}.
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setConfirmedReservation(null);
                    setStep(1);
                    setSelectedVehicle(null);
                    setPickupDate(null);
                    setReturnDate(null);
                    setPaymentMethod('pay_on_arrival');
                    setPaymentUrl('');
                    setPromoCode('');
                    setPromoResult(null);
                    setAutoPromos([]);
                    setCustomerInfo({ first_name: '', last_name: '', email: '', phone: '', driver_license: '', license_issue_date: '', notes: '' });
                  }}
                >
                  Nouvelle réservation
                </Button>
                <Button
                  className="flex-1 bg-[#3D3A6B] hover:bg-[#3D3A6B]/90 text-white"
                  onClick={() => navigate(listPath)}
                >
                  Voir mes réservations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
    if (isPublicRoute) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          {confirmContent}
          <Footer />
        </div>
      );
    }
    return confirmContent;
  }

  // Écran de confirmation groupe
  if (groupConfirmedReservations) {
    const listPath = user?.role === 'agent' ? '/agent/reservations' : user?.role === 'company' ? '/company/reservations' : isPublicRoute ? '/' : '/admin/reservations';
    const resetAll = () => {
      setGroupConfirmedReservations(null);
      setIsGroupBooking(false);
      setShowGroupSection(false);
      setGroupDrivers([]);
      setGroupVehicleCount(2);
      setStep(1);
      setSelectedVehicle(null);
      setPickupDate(null);
      setReturnDate(null);
      setPaymentMethod('pay_on_arrival');
      setPaymentUrl('');
      setPromoCode('');
      setPromoResult(null);
      setAutoPromos([]);
    };
    const groupConfirmContent = (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Réservation Groupe confirmée !</h2>
                <p className="text-gray-500">{groupConfirmedReservations.totalVehicles} réservations créées avec succès</p>
              </div>

              {/* Prix total groupe */}
              <div className="bg-[#3D3A6B]/5 border border-[#3D3A6B]/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-500">Prix par véhicule</div>
                  <div className="font-medium">{groupConfirmedReservations.pricePerVehicle?.toFixed(2)} € TTC</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total groupe ({groupConfirmedReservations.totalVehicles} véhicules)</div>
                  <div className="text-2xl font-bold text-[#F5A623]">{groupConfirmedReservations.totalPrice?.toFixed(2)} € TTC</div>
                </div>
              </div>

              {/* Période */}
              <div className="bg-slate-50 rounded-xl p-4 flex justify-between text-sm">
                <div>
                  <div className="text-slate-400">Départ</div>
                  <div className="font-medium">{groupConfirmedReservations.pickupDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Retour</div>
                  <div className="font-medium">{groupConfirmedReservations.returnDate}</div>
                </div>
              </div>

              {/* Liste des réservations */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#3D3A6B]" />
                  Détail des {groupConfirmedReservations.totalVehicles} réservations
                </h3>
                {groupConfirmedReservations.reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#3D3A6B]/10 flex items-center justify-center text-sm font-bold text-[#3D3A6B]">
                        {r.vehicleIndex}
                      </div>
                      <span className="font-medium">{r.driverName}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[#3D3A6B] border-[#3D3A6B]/30">
                      {r.reference}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={resetAll}>
                  Nouvelle réservation
                </Button>
                <Button className="flex-1 bg-[#3D3A6B] hover:bg-[#3D3A6B]/90 text-white" onClick={() => navigate(listPath)}>
                  Voir les réservations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
    if (isPublicRoute) {
      return <div className="min-h-screen flex flex-col"><Navbar />{groupConfirmContent}<Footer /></div>;
    }
    return groupConfirmContent;
  }

  const pageContent = (
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
                      <SelectItem value="all">Toutes</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id || cat} value={cat.id || cat}>{cat.name_fr || cat.name_en || cat.code || cat}</SelectItem>
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
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                          {availabilityStatuses[vehicle.category_id] && (() => {
                            const av = availabilityStatuses[vehicle.category_id];
                            if (av === 'freesale') return (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 shrink-0">
                                <Infinity className="h-3 w-3" /> Freesale
                              </span>
                            );
                            if (av === 'on_request') return (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                                <Clock className="h-3 w-3" /> Sur demande
                              </span>
                            );
                            if (av === 'non_available') return (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                                <XCircle className="h-3 w-3" /> Indispo
                              </span>
                            );
                            return null;
                          })()}
                        </div>
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
                        <Button
                          className={`w-full mt-3 text-black ${
                            availabilityStatuses[vehicle.category_id] === 'non_available'
                              ? 'bg-slate-200 cursor-not-allowed'
                              : 'bg-[#F5A623] hover:bg-[#F5A623]/90'
                          }`}
                          disabled={availabilityStatuses[vehicle.category_id] === 'non_available' || loading}
                        >
                          {loading ? '...' : availabilityStatuses[vehicle.category_id] === 'on_request' ? 'Demander' : 'Sélectionner'}
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
                {/* Availability status warning (on_request) */}
                {availabilityStatuses[selectedVehicle?.category_id] === 'on_request' && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Réservation sur demande :</strong> Cette catégorie nécessite une confirmation manuelle. La réservation sera en attente d'approbation.
                    </div>
                  </div>
                )}

                {/* Auto promos notification */}
                {autoPromos.length > 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                    <Sparkles className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Remise automatique appliquée !</p>
                      {autoPromos.map(p => (
                        <p key={p.rule_id} className="text-sm text-green-700 mt-0.5">
                          {p.name} : -{p.discount_amount?.toFixed(2)} €
                        </p>
                      ))}
                    </div>
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

                {/* Promo Code */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#F5A623]" />
                    Code promo
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="EX: ETE10"
                      className="font-mono uppercase"
                      disabled={!!promoResult?.valid}
                    />
                    {promoResult?.valid ? (
                      <Button variant="outline" className="text-red-500 border-red-200" onClick={() => { setPromoResult(null); setPromoCode(''); }}>
                        Retirer
                      </Button>
                    ) : (
                      <Button
                        onClick={applyPromoCode}
                        disabled={!promoCode.trim() || checkingPromo}
                        className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90"
                      >
                        {checkingPromo ? '...' : 'Appliquer'}
                      </Button>
                    )}
                  </div>
                  {promoResult && !promoResult.valid && (
                    <p className="text-sm text-red-600 mt-1">{promoResult.message}</p>
                  )}
                  {promoResult?.valid && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Check className="h-3 w-3" /> {promoResult.message || `Code valide — remise de ${promoResult.discount_amount?.toFixed(2)} €`}
                    </p>
                  )}
                </div>

                {/* Detailed Price Breakdown */}
                {pricing && (() => {
                  const bd = buildPriceBreakdown();
                  if (!bd) return null;
                  return (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b">
                        <p className="text-sm font-medium text-slate-700">Détail du prix</p>
                        {bd.season && <p className="text-xs text-slate-400">Saison : {bd.season}{bd.week_type ? ` · ${bd.week_type}` : ''}</p>}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Location ({bd.rental_days} jour{bd.rental_days > 1 ? 's' : ''})</span>
                          <span className="font-medium">{bd.base_price.toFixed(2)} €</span>
                        </div>
                        {bd.options.map(o => (
                          <div key={o.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{o.name} ({o.days}j)</span>
                            <span>{o.total.toFixed(2)} €</span>
                          </div>
                        ))}
                        {bd.insurance && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{bd.insurance.name} ({bd.insurance.days}j)</span>
                            <span>{bd.insurance.total.toFixed(2)} €</span>
                          </div>
                        )}
                        {bd.discount_amount > 0 && (
                          <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              Remise {bd.discount_label ? `(${bd.discount_label})` : ''}
                            </span>
                            <span>-{bd.discount_amount.toFixed(2)} €</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2 flex justify-between text-sm">
                          <span className="text-slate-500">Total HT</span>
                          <span>{bd.total_ht.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">TVA ({bd.tva_rate}%)</span>
                          <span>{bd.tva_amount.toFixed(2)} €</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-base font-bold">
                          <span>Total TTC</span>
                          <span className="text-[#F5A623]">{bd.total_ttc.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
                  onClick={() => { setIsGroupBooking(false); setShowGroupSection(false); setStep(4); }}
                >
                  Continuer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Group booking toggle */}
              {!showGroupSection ? (
                <Button
                  variant="outline"
                  className="w-full border-[#3D3A6B] text-[#3D3A6B] hover:bg-[#3D3A6B]/5"
                  onClick={() => setShowGroupSection(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Réservation Groupe — Réserver plusieurs véhicules identiques
                </Button>
              ) : (
                <Card className="border-[#3D3A6B]/30 bg-[#3D3A6B]/5">
                  <CardContent className="pt-4 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#3D3A6B] flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Réservation Groupe
                      </h3>
                      <button
                        className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                        onClick={() => setShowGroupSection(false)}
                      >×</button>
                    </div>

                    <div>
                      <Label className="text-slate-700">Nombre de véhicules identiques</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => setGroupVehicleCount(c => Math.max(2, c - 1))}
                        >−</Button>
                        <span className="text-2xl font-bold text-[#3D3A6B] w-10 text-center">{groupVehicleCount}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => setGroupVehicleCount(c => Math.min(20, c + 1))}
                        >+</Button>
                        <span className="text-sm text-slate-500">véhicule{groupVehicleCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {pricing && (() => {
                      const bd = buildPriceBreakdown();
                      if (!bd) return null;
                      return (
                        <div className="bg-white rounded-lg p-3 border space-y-1">
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Prix par véhicule</span>
                            <span>{bd.total_ttc.toFixed(2)} € TTC</span>
                          </div>
                          <div className="flex justify-between font-bold text-[#F5A623]">
                            <span>Total groupe ({groupVehicleCount} véhicules)</span>
                            <span>{(bd.total_ttc * groupVehicleCount).toFixed(2)} € TTC</span>
                          </div>
                        </div>
                      );
                    })()}

                    <Button
                      className="w-full bg-[#3D3A6B] hover:bg-[#3D3A6B]/90 text-white"
                      onClick={() => {
                        initGroupDrivers(groupVehicleCount);
                        setIsGroupBooking(true);
                        setStep(4);
                      }}
                    >
                      Saisir les {groupVehicleCount} conducteurs
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Customer Info & Confirmation */}
        {step === 4 && isGroupBooking && (
          <div className="space-y-6">
            {/* Header groupe */}
            <Card className="border-[#3D3A6B]/30 bg-[#3D3A6B]/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#3D3A6B] flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[#3D3A6B]">Réservation Groupe — {groupVehicleCount} véhicules</div>
                    <div className="text-sm text-slate-500">Saisissez les informations de chaque conducteur</div>
                  </div>
                  {pricing && (() => {
                    const bd = buildPriceBreakdown();
                    return bd ? (
                      <div className="ml-auto text-right">
                        <div className="text-xs text-slate-400">Total groupe</div>
                        <div className="font-bold text-[#F5A623]">{(bd.total_ttc * groupVehicleCount).toFixed(2)} € TTC</div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Un bloc par conducteur */}
            {groupDrivers.map((driver, idx) => (
              <Card key={idx} className={`transition-all ${expandedDriver === idx ? 'border-[#3D3A6B]/40 shadow-md' : 'border-slate-200'}`}>
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => setExpandedDriver(expandedDriver === idx ? -1 : idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        driver.first_name && driver.last_name && driver.email && driver.phone
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {driver.first_name && driver.last_name && driver.email && driver.phone
                          ? <Check className="h-4 w-4" />
                          : idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base">Véhicule {idx + 1}</CardTitle>
                        {driver.first_name && driver.last_name && (
                          <CardDescription>{driver.first_name} {driver.last_name}</CardDescription>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expandedDriver === idx ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>

                {expandedDriver === idx && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Prénom *</Label>
                        <Input value={driver.first_name} onChange={e => updateGroupDriver(idx, 'first_name', e.target.value)} placeholder="Jean" />
                      </div>
                      <div>
                        <Label>Nom *</Label>
                        <Input value={driver.last_name} onChange={e => updateGroupDriver(idx, 'last_name', e.target.value)} placeholder="Dupont" />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input type="email" value={driver.email} onChange={e => updateGroupDriver(idx, 'email', e.target.value)} placeholder="jean.dupont@email.com" />
                      </div>
                      <div>
                        <Label>Téléphone *</Label>
                        <Input type="tel" value={driver.phone} onChange={e => updateGroupDriver(idx, 'phone', e.target.value)} placeholder="+590 6 90 12 34 56" />
                      </div>
                      <div>
                        <Label>Numéro de permis</Label>
                        <Input value={driver.driver_license} onChange={e => updateGroupDriver(idx, 'driver_license', e.target.value)} placeholder="123456789" />
                      </div>
                      <div>
                        <Label>Date de délivrance du permis</Label>
                        <Input type="date" value={driver.license_issue_date || ''} onChange={e => updateGroupDriver(idx, 'license_issue_date', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Notes (optionnel)</Label>
                      <Input value={driver.notes} onChange={e => updateGroupDriver(idx, 'notes', e.target.value)} placeholder="Informations supplémentaires..." />
                    </div>
                    {idx < groupDrivers.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[#3D3A6B]/30 text-[#3D3A6B]"
                        onClick={() => setExpandedDriver(idx + 1)}
                      >
                        Conducteur suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Mode de règlement */}
            <Card>
              <CardHeader>
                <CardTitle>Mode de règlement</CardTitle>
                <CardDescription>Choisissez comment les clients régleront</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'pay_on_arrival' ? 'border-[#F5A623] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('pay_on_arrival')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pay_on_arrival' ? 'border-[#F5A623]' : 'border-gray-300'}`}>
                        {paymentMethod === 'pay_on_arrival' && <div className="h-3 w-3 rounded-full bg-[#F5A623]" />}
                      </div>
                      <h4 className="font-semibold text-gray-900">Sur place en agence</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">Les clients paient à l'agence lors de la prise en charge</p>
                  </div>
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'pay_by_link' ? 'border-[#F5A623] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('pay_by_link')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pay_by_link' ? 'border-[#F5A623]' : 'border-gray-300'}`}>
                        {paymentMethod === 'pay_by_link' && <div className="h-3 w-3 rounded-full bg-[#F5A623]" />}
                      </div>
                      <h4 className="font-semibold text-gray-900">Lien de paiement</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">Un lien de paiement est envoyé par email à chaque client</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setIsGroupBooking(false); setStep(3); }}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1 bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
                onClick={createGroupReservations}
                disabled={loading}
              >
                {loading ? `Création en cours...` : `Confirmer les ${groupVehicleCount} réservations`}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && !isGroupBooking && (
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
                  <div>
                    <Label>Date de délivrance du permis</Label>
                    <Input
                      type="date"
                      value={customerInfo.license_issue_date || ''}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, license_issue_date: e.target.value })}
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
                    <div className="font-medium">{selectedVehicle?.category_id}</div>
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

                {/* Detailed price summary */}
                {pricing && (() => {
                  const bd = buildPriceBreakdown();
                  if (!bd) return null;
                  return (
                    <div className="border rounded-lg overflow-hidden mt-2">
                      <div className="bg-slate-50 px-4 py-2 border-b text-sm font-medium text-slate-700">
                        Détail du prix verrouillé
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Location ({bd.rental_days}j)</span>
                          <span>{bd.base_price.toFixed(2)} €</span>
                        </div>
                        {bd.options.map(o => (
                          <div key={o.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{o.name}</span>
                            <span>{o.total.toFixed(2)} €</span>
                          </div>
                        ))}
                        {bd.insurance && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{bd.insurance.name}</span>
                            <span>{bd.insurance.total.toFixed(2)} €</span>
                          </div>
                        )}
                        {bd.discount_amount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Remise {bd.discount_label ? `(${bd.discount_label})` : ''}</span>
                            <span>-{bd.discount_amount.toFixed(2)} €</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between text-sm text-slate-500">
                          <span>Total HT</span>
                          <span>{bd.total_ht.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                          <span>TVA ({bd.tva_rate}%)</span>
                          <span>{bd.tva_amount.toFixed(2)} €</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-xl font-bold">
                          <span>Total TTC</span>
                          <span className="text-[#F5A623]">{bd.total_ttc.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Mode de règlement</CardTitle>
                <CardDescription>Choisissez comment le client règlera la réservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'pay_on_arrival'
                        ? 'border-[#F5A623] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('pay_on_arrival')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'pay_on_arrival' ? 'border-[#F5A623]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'pay_on_arrival' && (
                          <div className="h-3 w-3 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">Sur place en agence</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Le client paie directement à l'agence lors de la prise en charge du véhicule
                    </p>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'pay_by_link'
                        ? 'border-[#F5A623] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('pay_by_link')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'pay_by_link' ? 'border-[#F5A623]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'pay_by_link' && (
                          <div className="h-3 w-3 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">Lien de paiement</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Un lien de paiement externe est envoyé par email au client
                    </p>
                  </div>
                </div>

                {paymentMethod === 'pay_by_link' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <Label htmlFor="payment-url" className="text-sm font-medium">
                        Lien de paiement <span className="text-gray-400 font-normal">(optionnel — peut être envoyé plus tard depuis l'admin)</span>
                      </Label>
                      <Input
                        id="payment-url"
                        className="mt-1"
                        placeholder="https://buy.stripe.com/... ou tout autre lien de paiement"
                        value={paymentUrl}
                        onChange={(e) => setPaymentUrl(e.target.value)}
                      />
                      {paymentUrl.trim() && (
                        <p className="text-xs text-green-600 mt-1">
                          Ce lien sera envoyé par email à {customerInfo.email || 'l\'adresse du client'} après confirmation.
                        </p>
                      )}
                      {!paymentUrl.trim() && (
                        <p className="text-xs text-gray-400 mt-1">
                          Si vous ne renseignez pas de lien maintenant, vous pourrez l'envoyer ultérieurement depuis la liste des réservations.
                        </p>
                      )}
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

  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {pageContent}
        <Footer />
      </div>
    );
  }

  return pageContent;
};

export default BookingPage;
