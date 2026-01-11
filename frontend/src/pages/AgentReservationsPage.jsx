import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
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
  Calendar, Search, Download, Filter, Eye, Edit, Copy, XCircle,
  Clock, CheckCircle, DollarSign, AlertCircle, Plus
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AgentReservationsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`${API}/reservations?${params.toString()}`);
      setReservations(response.data.reservations || response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors du chargement des réservations'
        : 'Error loading reservations'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await axios.patch(`${API}/reservations/${reservationId}`, { status: 'cancelled' });
      toast.success(i18n.language === 'fr'
        ? 'Réservation annulée avec succès'
        : 'Reservation cancelled successfully'
      );
      fetchReservations();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors de l\'annulation'
        : 'Error cancelling reservation'
      );
    }
  };

  const handleDuplicateReservation = async (reservation) => {
    try {
      const duplicateData = {
        vehicle_category: reservation.vehicle_category,
        pickup_location: reservation.pickup_location,
        return_location: reservation.return_location,
        pickup_date: reservation.pickup_date,
        return_date: reservation.return_date,
      };
      await axios.post(`${API}/reservations`, duplicateData);
      toast.success(i18n.language === 'fr'
        ? 'Réservation dupliquée avec succès'
        : 'Reservation duplicated successfully'
      );
      fetchReservations();
    } catch (error) {
      console.error('Error duplicating reservation:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors de la duplication'
        : 'Error duplicating reservation'
      );
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Numéro', 'Client', 'Véhicule', 'Date départ', 'Date retour', 'Statut', 'Total'];
    const csvData = filteredReservations.map(res => [
      res.reference,
      res.customer_name || '-',
      res.vehicle_category || '-',
      res.pickup_date,
      res.return_date,
      res.status,
      res.total_price?.toFixed(2) || '0'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success(i18n.language === 'fr'
      ? 'Export CSV réussi'
      : 'CSV export successful'
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-amber-100 text-amber-800', icon: Clock },
      confirmed: { class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      prepaid: { class: 'bg-purple-100 text-purple-800', icon: DollarSign },
      completed: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      cancelled: { class: 'bg-red-100 text-red-800', icon: XCircle },
      no_show: { class: 'bg-slate-100 text-slate-800', icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.class}>
        <config.icon className="h-3 w-3 mr-1" />
        {t(`status.${status}`) || status}
      </Badge>
    );
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = !searchTerm ||
      res.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateFrom = !dateFrom || new Date(res.pickup_date) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(res.pickup_date) <= new Date(dateTo);

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="agent-reservations-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Mes Réservations' : 'My Reservations'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? 'Gérez toutes vos réservations'
              : 'Manage all your reservations'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} data-testid="export-csv-btn">
            <Download className="h-4 w-4 mr-2" />
            {i18n.language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
          </Button>
          <Button asChild className="bg-[#F5A623] hover:bg-[#F5A623]/90">
            <Link to="/agent/reservations/new">
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Nouvelle réservation' : 'New Reservation'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-[#3D3A6B]" />
            {i18n.language === 'fr' ? 'Filtres' : 'Filters'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={i18n.language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-input"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Statut' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{i18n.language === 'fr' ? 'Tous' : 'All'}</SelectItem>
                <SelectItem value="pending">{i18n.language === 'fr' ? 'En attente' : 'Pending'}</SelectItem>
                <SelectItem value="confirmed">{i18n.language === 'fr' ? 'Confirmée' : 'Confirmed'}</SelectItem>
                <SelectItem value="completed">{i18n.language === 'fr' ? 'Complétée' : 'Completed'}</SelectItem>
                <SelectItem value="cancelled">{i18n.language === 'fr' ? 'Annulée' : 'Cancelled'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder={i18n.language === 'fr' ? 'Du' : 'From'}
                data-testid="date-from-input"
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder={i18n.language === 'fr' ? 'Au' : 'To'}
                data-testid="date-to-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {i18n.language === 'fr'
            ? `${filteredReservations.length} réservation(s) trouvée(s)`
            : `${filteredReservations.length} reservation(s) found`}
        </p>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{i18n.language === 'fr' ? 'Numéro' : 'Number'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Client' : 'Customer'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Véhicule' : 'Vehicle'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Date départ' : 'Pickup Date'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Date retour' : 'Return Date'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Total' : 'Total'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id} data-testid="reservation-row">
                      <TableCell className="font-mono font-medium text-[#3D3A6B]">
                        {reservation.reference}
                      </TableCell>
                      <TableCell>{reservation.customer_name || '-'}</TableCell>
                      <TableCell>{reservation.vehicle_category || '-'}</TableCell>
                      <TableCell>{reservation.pickup_date}</TableCell>
                      <TableCell>{reservation.return_date}</TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {reservation.total_price?.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(reservation)}
                            data-testid="view-btn"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            data-testid="edit-btn"
                          >
                            <Link to={`/agent/reservations/${reservation.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateReservation(reservation)}
                            data-testid="duplicate-btn"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelReservation(reservation.id)}
                              data-testid="cancel-btn"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      {i18n.language === 'fr'
                        ? 'Aucune réservation trouvée'
                        : 'No reservations found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="details-dialog">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'fr' ? 'Détails de la réservation' : 'Reservation Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedReservation?.reference}
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Client' : 'Customer'}
                  </p>
                  <p className="text-sm text-slate-800">{selectedReservation.customer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Statut' : 'Status'}
                  </p>
                  <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Véhicule' : 'Vehicle'}
                  </p>
                  <p className="text-sm text-slate-800">{selectedReservation.vehicle_category || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Lieu de départ' : 'Pickup Location'}
                  </p>
                  <p className="text-sm text-slate-800">{selectedReservation.pickup_location || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Date de départ' : 'Pickup Date'}
                  </p>
                  <p className="text-sm text-slate-800">{selectedReservation.pickup_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Date de retour' : 'Return Date'}
                  </p>
                  <p className="text-sm text-slate-800">{selectedReservation.return_date}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-slate-800">
                    {i18n.language === 'fr' ? 'Total' : 'Total'}
                  </p>
                  <p className="text-2xl font-bold text-[#F5A623]">
                    {selectedReservation.total_price?.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentReservationsPage;
