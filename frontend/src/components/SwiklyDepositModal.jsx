import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ShieldCheck, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SwiklyDepositModal = ({ isOpen, onClose, reservation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState(reservation?.deposit_amount || 500);
  const [driverEmail, setDriverEmail] = useState(reservation?.driver_info?.email || '');

  const handleCreateDeposit = async () => {
    try {
      setLoading(true);

      if (!driverEmail || !depositAmount) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }

      const response = await axios.post(
        `${API}/swikly/create-deposit`,
        {
          reservation_id: reservation.id,
          amount: depositAmount,
          customer_email: driverEmail,
          customer_name: `${reservation.driver_info?.first_name} ${reservation.driver_info?.last_name}`,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Demande de caution envoyée avec succès');

      if (onSuccess) {
        onSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error creating Swikly deposit:', error);
      toast.error(
        error.response?.data?.detail ||
        'Erreur lors de la création de la caution'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseDeposit = async () => {
    try {
      setLoading(true);

      await axios.post(
        `${API}/swikly/release-deposit`,
        { reservation_id: reservation.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Caution libérée avec succès');

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error releasing deposit:', error);
      toast.error('Erreur lors de la libération de la caution');
    } finally {
      setLoading(false);
    }
  };

  const getDepositStatusBadge = () => {
    const status = reservation?.deposit_status || 'pending';
    const statusConfig = {
      pending: {
        class: 'bg-amber-100 text-amber-800',
        icon: AlertCircle,
        label: 'En attente'
      },
      secured: {
        class: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Sécurisée'
      },
      released: {
        class: 'bg-slate-100 text-slate-800',
        icon: XCircle,
        label: 'Libérée'
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.class}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (!reservation) return null;

  const isSecured = reservation.deposit_status === 'secured';
  const isReleased = reservation.deposit_status === 'released';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#3D3A6B]" />
            Gestion de la caution Swikly
          </DialogTitle>
          <DialogDescription>
            Réservation: <span className="font-mono font-medium">{reservation.reference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Statut actuel:</span>
            {getDepositStatusBadge()}
          </div>

          {/* Swikly ID if exists */}
          {reservation.swikly_id && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">ID Swikly</p>
              <p className="font-mono text-sm text-blue-900">{reservation.swikly_id}</p>
            </div>
          )}

          {/* Create Deposit Form */}
          {!isSecured && !isReleased && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-700">
                  Montant de la caution (€)
                </label>
                <Input
                  type="number"
                  step="50"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                  placeholder="500"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Montant généralement entre 300€ et 1500€
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-slate-700">
                  Email du conducteur
                </label>
                <Input
                  type="email"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  placeholder="conducteur@example.com"
                  disabled={loading}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Un email sera envoyé au conducteur avec un lien pour sécuriser la caution via Swikly.
                </p>
              </div>
            </>
          )}

          {/* Release Info */}
          {isSecured && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 mb-2">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                La caution est actuellement sécurisée
              </p>
              <p className="text-xs text-green-700">
                Montant: <span className="font-bold">{depositAmount}€</span>
              </p>
            </div>
          )}

          {isReleased && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                La caution a été libérée avec succès
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Fermer
          </Button>

          {!isSecured && !isReleased && (
            <Button
              onClick={handleCreateDeposit}
              disabled={loading || !driverEmail || !depositAmount}
              className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer demande de caution
            </Button>
          )}

          {isSecured && (
            <Button
              onClick={handleReleaseDeposit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Libérer la caution
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SwiklyDepositModal;
