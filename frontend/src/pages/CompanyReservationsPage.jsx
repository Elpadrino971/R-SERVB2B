import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Eye, Download, XCircle, Link2, FileText, UserCheck,
  Search, Filter, Calendar
} from 'lucide-react';
import { exportToCSV, exportConfigs } from '../utils/exportToCSV';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyReservationsPage = () => {
  const { i18n } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    driver: '',
    search: ''
  });
  const [assignModal, setAssignModal] = useState({ open: false, reservation: null });
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reservationsRes, driversRes] = await Promise.all([
        axios.get(`${API}/reservations`),
        axios.get(`${API}/companies/drivers`)
      ]);
      setReservations(reservationsRes.data.reservations || []);
      setDrivers(driversRes.data.drivers || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver || !assignModal.reservation) return;

    try {
      await axios.patch(`${API}/reservations/${assignModal.reservation.id}/assign`, {
        driver_id: selectedDriver
      });
      toast.success(i18n.language === 'fr' ? 'Conducteur assigné' : 'Driver assigned');
      setAssignModal({ open: false, reservation: null });
      setSelectedDriver('');
      fetchData();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'assignation' : 'Error assigning driver');
    }
  };

  const handleGeneratePaymentLink = (reservation) => {
    toast.info(i18n.language === 'fr' ? 'Lien de paiement copié' : 'Payment link copied');
    navigator.clipboard.writeText(`https://autodiscount.com/pay/${reservation.id}`);
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Annuler cette réservation ?' : 'Cancel this reservation?')) {
      return;
    }

    try {
      await axios.patch(`${API}/reservations/${reservation.id}/cancel`);
      toast.success(i18n.language === 'fr' ? 'Réservation annulée' : 'Reservation cancelled');
      fetchData();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'annulation' : 'Error cancelling');
    }
  };

  const handleExportCSV = () => {
    try {
      if (filteredReservations.length === 0) {
        toast.error('Aucune réservation à exporter');
        return;
      }

      const filename = `reservations-entreprise_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(filteredReservations, exportConfigs.reservations.columns, filename);
      toast.success(i18n.language === 'fr' ? 'Export CSV réussi' : 'CSV exported');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'export' : 'Error exporting');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-amber-100 text-amber-800' },
      confirmed: { class: 'bg-blue-100 text-blue-800' },
      completed: { class: 'bg-emerald-100 text-emerald-800' },
      cancelled: { class: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.class}>{status}</Badge>;
  };

  const filteredReservations = reservations.filter(r => {
    if (filters.status && r.status !== filters.status) return false;
    if (filters.driver && r.driver_id !== filters.driver) return false;
    if (filters.search && !r.reference?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="company-reservations-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Réservations Entreprise' : 'Company Reservations'}
          </h1>
          <p className="text-slate-600">
            {filteredReservations.length} {i18n.language === 'fr' ? 'réservations' : 'reservations'}
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder={i18n.language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
                data-testid="search-input"
              />
            </div>
            <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Statut' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Tous</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.driver} onValueChange={(val) => setFilters({ ...filters, driver: val })}>
              <SelectTrigger data-testid="driver-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Conducteur' : 'Driver'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Tous</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.first_name} {driver.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'fr' ? 'Liste des réservations' : 'Reservations list'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="reservations-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Numéro</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Conducteur</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Véhicule</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Dates</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">PO</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`reservation-row-${res.id}`}>
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-[#3D3A6B]">{res.reference}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {res.driver_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {res.vehicle_category || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {res.pickup_date} → {res.return_date}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {res.total_price?.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {res.po_number || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="Voir">
                          <Link to={`/company/reservations/${res.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {res.status !== 'prepaid' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Lien paiement"
                            onClick={() => handleGeneratePaymentLink(res)}
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Assigner conducteur"
                          onClick={() => setAssignModal({ open: true, reservation: res })}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        {res.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Annuler"
                            onClick={() => handleCancel(res)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReservations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {i18n.language === 'fr' ? 'Aucune réservation trouvée' : 'No reservations found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Driver Modal */}
      <Dialog open={assignModal.open} onOpenChange={(open) => setAssignModal({ open, reservation: null })}>
        <DialogContent data-testid="assign-driver-modal">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'fr' ? 'Assigner un conducteur' : 'Assign driver'}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? `Réservation: ${assignModal.reservation?.reference}`
                : `Reservation: ${assignModal.reservation?.reference}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger data-testid="driver-select">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Sélectionner conducteur' : 'Select driver'} />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.first_name} {driver.last_name} - {driver.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal({ open: false, reservation: null })}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleAssignDriver} disabled={!selectedDriver} data-testid="confirm-assign">
              {i18n.language === 'fr' ? 'Assigner' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyReservationsPage;
