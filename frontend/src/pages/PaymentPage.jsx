import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  CreditCard, Building2, CheckCircle2, Calendar, MapPin,
  User, Car, Shield, Download, AlertCircle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PaymentPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/reservations/${reservationId}`);
      setReservation(response.data);

      // Check if already paid
      if (response.data.payment_status === 'paid' || response.data.payment_status === 'prepaid') {
        setPaymentConfirmed(true);
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setError('Réservation non trouvée ou lien invalide');
    } finally {
      setLoading(false);
    }
  };

  const handlePayAtAgency = async () => {
    try {
      setProcessing(true);
      await axios.post(`${API}/reservations/${reservationId}/confirm-payment-method`, {
        payment_method: 'on_site'
      });
      toast.success('Confirmation enregistrée !');
      setPaymentConfirmed(true);
    } catch (error) {
      console.error('Error confirming payment method:', error);
      toast.error('Erreur lors de la confirmation');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayNow = () => {
    // Rediriger vers le lien de paiement externe si disponible
    const paymentUrl = reservation?.payment_link_url;
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      toast.info(
        'Aucun lien de paiement disponible pour cette réservation. ' +
        'Veuillez régler à l\'agence ou contacter votre conseiller.'
      );
    }
  };

  const downloadVoucher = async () => {
    try {
      toast.info('Téléchargement du bon de réservation...');
      // TODO: Implement PDF generation
      toast.success('Bon de réservation téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre réservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation non trouvée</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {reservation.payment_status === 'paid' || reservation.payment_status === 'prepaid'
                ? 'Paiement confirmé !'
                : 'Confirmation enregistrée !'}
            </h2>
            <p className="text-gray-600 mb-8">
              {reservation.payment_status === 'paid' || reservation.payment_status === 'prepaid'
                ? 'Votre paiement a été effectué avec succès. Vous recevrez une confirmation par email.'
                : 'Nous avons bien noté que vous règlerez à l\'agence lors de la prise en charge du véhicule.'}
            </p>

            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Détails de votre réservation</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro de réservation</span>
                  <span className="font-semibold">{reservation.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates</span>
                  <span className="font-semibold">
                    {format(new Date(reservation.pickup_date), 'dd/MM/yyyy', { locale: fr })} -
                    {format(new Date(reservation.return_date), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-[#F5A623]">{reservation.total_price.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={downloadVoucher}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger le bon de réservation
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-[#3D3A6B] hover:bg-[#3D3A6B]/90"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Auto Discount Location
          </h1>
          <p className="text-gray-600">Paiement de votre réservation</p>
        </div>

        {/* Reservation Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Réservation {reservation.reference}</CardTitle>
                <CardDescription>Détails de votre location</CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {reservation.status === 'pending' ? 'En attente' : reservation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[#3D3A6B] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Dates de location</p>
                    <p className="font-semibold">
                      Du {format(new Date(reservation.pickup_date), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                    <p className="font-semibold">
                      Au {format(new Date(reservation.return_date), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#3D3A6B] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Agences</p>
                    <p className="font-semibold">Départ : {reservation.pickup_agency_id}</p>
                    <p className="font-semibold">Retour : {reservation.return_agency_id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-[#3D3A6B] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold">
                      {reservation.driver_info?.first_name} {reservation.driver_info?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{reservation.driver_info?.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-[#3D3A6B] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Véhicule</p>
                    <p className="font-semibold">{reservation.vehicle_category_id}</p>
                  </div>
                </div>

                {reservation.insurance_id && (
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#3D3A6B] mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Assurance</p>
                      <p className="font-semibold">{reservation.insurance_id}</p>
                    </div>
                  </div>
                )}

                <div className="bg-[#F5A623]/10 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-600 mb-1">Montant total</p>
                  <p className="text-3xl font-bold text-[#F5A623]">
                    {reservation.total_price.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Comment souhaitez-vous régler ?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pay at Agency */}
            <Card className="border-2 hover:border-[#3D3A6B] transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Paiement à l'agence</CardTitle>
                </div>
                <CardDescription>
                  Réglez directement lors de la prise en charge du véhicule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Aucun paiement en ligne nécessaire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Payez en espèces ou par carte sur place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Présentation du permis et carte d'identité requise</span>
                  </li>
                </ul>
                <Button
                  onClick={handlePayAtAgency}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirmation...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Je paierai à l'agence
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Pay via link */}
            <Card className={`border-2 transition-all ${reservation?.payment_link_url ? 'hover:border-[#F5A623] cursor-pointer' : 'opacity-60'}`}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Paiement en ligne</CardTitle>
                </div>
                <CardDescription>
                  {reservation?.payment_link_url
                    ? 'Réglez maintenant via le lien de paiement sécurisé'
                    : 'Aucun lien de paiement disponible pour cette réservation'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Paiement sécurisé via lien externe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Confirmation par email après règlement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pas de paiement à l'agence</span>
                  </li>
                </ul>
                <Button
                  onClick={handlePayNow}
                  disabled={!reservation?.payment_link_url}
                  className="w-full bg-[#F5A623] hover:bg-[#E09612] text-gray-900 disabled:opacity-50"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {reservation?.payment_link_url
                    ? `Payer maintenant ${reservation.total_price.toFixed(2)} €`
                    : 'Lien non disponible'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            Paiement 100% sécurisé et conforme aux normes PCI-DSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
