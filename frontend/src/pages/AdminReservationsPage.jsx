import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Calendar, Search, Download, Eye, MoreVertical,
  ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, exportConfigs } from '../utils/exportToCSV';
import SwiklyDepositModal from '../components/SwiklyDepositModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminReservationsPage = () => {
  const { i18n } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agencyFilter, setAgencyFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [swiklyModalOpen, setSwiklyModalOpen] = useState(false);
  const [swiklyReservation, setSwiklyReservation] = useState(null);

  const limit = 20;

  useEffect(() => {
    fetchReservations();
  }, [page, statusFilter, agencyFilter, searchTerm, startDate, endDate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit,
        offset,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(agencyFilter !== 'all' && { agency_id: agencyFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      const response = await axios.get(`${API}/admin/reservations?${params}`);
      setReservations(response.data.reservations || []);
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await axios.put(`${API}/admin/reservations/${reservationId}/status`, {
        status: newStatus
      });
      toast.success(i18n.language === 'fr' ? 'Statut mis à jour' : 'Status updated');
      fetchReservations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status');
    }
  };

  const exportCSV = () => {
    try {
      if (filteredReservations.length === 0) {
        toast.error('Aucune réservation à exporter');
        return;
      }

      const filename = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(filteredReservations, exportConfigs.reservations.columns, filename);
      toast.success(i18n.language === 'fr' ? 'Export réussi' : 'Export successful');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'export' : 'Error exporting');
    }
  };

  const openDetailDialog = (reservation) => {
    setSelectedReservation(reservation);
    setDetailDialogOpen(true);
  };

  const openSwiklyModal = (reservation) => {
    setSwiklyReservation(reservation);
    setSwiklyModalOpen(true);
  };

  const handleSwiklySuccess = () => {
    fetchReservations(); // Refresh the list
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-amber-100 text-amber-800', icon: Clock, label: 'En attente' },
      confirmed: { class: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmée' },
      completed: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Terminée' },
      cancelled: { class: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulée' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.class}>
        <Icon className="h-3 w-3 mr-1" />
        {i18n.language === 'fr' ? config.label : status}
      </Badge>
    );
  };

  if (loading && reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-reservations-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Toutes les réservations' : 'All Reservations'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? `${reservations.length} réservation(s) trouvée(s)`
              : `${reservations.length} reservation(s) found`}
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" data-testid="export-csv-btn">
          <Download className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Export CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={i18n.language === 'fr' ? 'Rechercher numéro/client...' : 'Search number/client...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Tous statuts' : 'All statuses'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{i18n.language === 'fr' ? 'Tous statuts' : 'All statuses'}</SelectItem>
                <SelectItem value="pending">{i18n.language === 'fr' ? 'En attente' : 'Pending'}</SelectItem>
                <SelectItem value="confirmed">{i18n.language === 'fr' ? 'Confirmée' : 'Confirmed'}</SelectItem>
                <SelectItem value="completed">{i18n.language === 'fr' ? 'Terminée' : 'Completed'}</SelectItem>
                <SelectItem value="cancelled">{i18n.language === 'fr' ? 'Annulée' : 'Cancelled'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agencyFilter} onValueChange={setAgencyFilter}>
              <SelectTrigger data-testid="agency-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Toutes agences' : 'All agencies'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{i18n.language === 'fr' ? 'Toutes agences' : 'All agencies'}</SelectItem>
              </SelectContent>
            </Select>

            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder={i18n.language === 'fr' ? 'Date début' : 'Start date'}
                data-testid="start-date-input"
              />
            </div>

            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder={i18n.language === 'fr' ? 'Date fin' : 'End date'}
                data-testid="end-date-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar className="h-5 w-5 inline mr-2" />
            {i18n.language === 'fr' ? 'Liste des réservations' : 'Reservations List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{i18n.language === 'fr' ? 'Numéro' : 'Number'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Agent/Entreprise' : 'Agent/Company'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Client' : 'Client'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Véhicule' : 'Vehicle'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Dates' : 'Dates'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Total' : 'Total'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res.id} data-testid={`reservation-row-${res.id}`}>
                    <TableCell>
                      <span className="font-mono font-medium text-[#3D3A6B]">{res.reference || res.id?.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {res.agent_email || res.company_name || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {res.customer_name || `${res.customer_first_name} ${res.customer_last_name}`}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {res.vehicle_name || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {res.pickup_date} → {res.return_date}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(res.status)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {res.total_price?.toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(res)}
                          data-testid={`view-btn-${res.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`actions-btn-${res.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openSwiklyModal(res)}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              {i18n.language === 'fr' ? 'Gérer caution Swikly' : 'Manage Swikly deposit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateReservationStatus(res.id, 'pending')}>
                              {i18n.language === 'fr' ? 'Marquer en attente' : 'Mark as pending'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateReservationStatus(res.id, 'confirmed')}>
                              {i18n.language === 'fr' ? 'Marquer confirmée' : 'Mark as confirmed'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateReservationStatus(res.id, 'completed')}>
                              {i18n.language === 'fr' ? 'Marquer terminée' : 'Mark as completed'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateReservationStatus(res.id, 'cancelled')}>
                              {i18n.language === 'fr' ? 'Marquer annulée' : 'Mark as cancelled'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      {i18n.language === 'fr' ? 'Aucune réservation trouvée' : 'No reservations found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-slate-600">
                Page {page} {i18n.language === 'fr' ? 'sur' : 'of'} {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="prev-page-btn"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="next-page-btn"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="detail-dialog">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'fr' ? 'Détail de la réservation' : 'Reservation Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedReservation?.reference || selectedReservation?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Client' : 'Client'}
                  </label>
                  <p className="font-medium">
                    {selectedReservation.customer_name ||
                     `${selectedReservation.customer_first_name} ${selectedReservation.customer_last_name}`}
                  </p>
                  <p className="text-sm text-slate-600">{selectedReservation.customer_email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Statut' : 'Status'}
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Véhicule' : 'Vehicle'}
                  </label>
                  <p className="font-medium">{selectedReservation.vehicle_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Prix total' : 'Total Price'}
                  </label>
                  <p className="font-bold text-lg text-[#F5A623]">
                    {selectedReservation.total_price?.toFixed(2)} €
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Date de départ' : 'Pickup Date'}
                  </label>
                  <p className="font-medium">{selectedReservation.pickup_date}</p>
                  <p className="text-sm text-slate-600">{selectedReservation.pickup_location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Date de retour' : 'Return Date'}
                  </label>
                  <p className="font-medium">{selectedReservation.return_date}</p>
                  <p className="text-sm text-slate-600">{selectedReservation.return_location}</p>
                </div>

                {selectedReservation.agent_email && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      {i18n.language === 'fr' ? 'Agent' : 'Agent'}
                    </label>
                    <p className="font-medium">{selectedReservation.agent_email}</p>
                  </div>
                )}

                {selectedReservation.company_name && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      {i18n.language === 'fr' ? 'Entreprise' : 'Company'}
                    </label>
                    <p className="font-medium">{selectedReservation.company_name}</p>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-600">
                    {i18n.language === 'fr' ? 'Date de création' : 'Created At'}
                  </label>
                  <p className="font-medium">
                    {new Date(selectedReservation.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swikly Deposit Modal */}
      <SwiklyDepositModal
        isOpen={swiklyModalOpen}
        onClose={() => setSwiklyModalOpen(false)}
        reservation={swiklyReservation}
        onSuccess={handleSwiklySuccess}
      />
    </div>
  );
};

export default AdminReservationsPage;
