import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
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
  Users, Search, Download, Edit, UserCheck, UserX,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, exportConfigs } from '../utils/exportToCSV';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminUsersPage = () => {
  const { i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState('');

  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit,
        offset,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${API}/admin/users?${params}`);
      setUsers(response.data.users || []);
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement des utilisateurs' : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`${API}/admin/users/${userId}`, { status: newStatus });
      toast.success(i18n.language === 'fr' ? 'Statut mis à jour' : 'Status updated');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status');
    }
  };

  const openEditDialog = (user) => {
    setEditUser(user);
    setCommissionRate(user.commission_rate || '');
    setEditDialogOpen(true);
  };

  const saveCommission = async () => {
    try {
      await axios.put(`${API}/admin/users/${editUser.id}`, {
        commission_rate: parseFloat(commissionRate)
      });
      toast.success(i18n.language === 'fr' ? 'Commission mise à jour' : 'Commission updated');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating commission');
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, { role: newRole });
      toast.success(`Rôle changé en "${newRole}"`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors du changement de rôle');
    }
  };

  const exportCSV = () => {
    try {
      if (users.length === 0) {
        toast.error('Aucun utilisateur à exporter');
        return;
      }

      const filename = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(users, exportConfigs.users.columns, filename);
      toast.success(i18n.language === 'fr' ? 'Export réussi' : 'Export successful');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'export' : 'Error exporting');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: 'bg-purple-100 text-purple-800', label: 'Admin' },
      agent: { class: 'bg-blue-100 text-blue-800', label: 'Agent' },
      company: { class: 'bg-emerald-100 text-emerald-800', label: 'Entreprise' },
      influencer: { class: 'bg-pink-100 text-pink-800', label: 'Influencer' },
    };
    const config = roleConfig[role] || roleConfig.agent;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? <Badge className="bg-emerald-100 text-emerald-800">Actif</Badge>
      : <Badge className="bg-slate-100 text-slate-800">Inactif</Badge>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Gestion des utilisateurs' : 'User Management'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? `${users.length} utilisateur(s) trouvé(s)`
              : `${users.length} user(s) found`}
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
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={i18n.language === 'fr' ? 'Rechercher par email/nom...' : 'Search by email/name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger data-testid="role-filter">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="company">Entreprise</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Users className="h-5 w-5 inline mr-2" />
            {i18n.language === 'fr' ? 'Liste des utilisateurs' : 'Users List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Nom' : 'Name'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Rôle' : 'Role'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Commission' : 'Commission'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Date création' : 'Created'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => changeRole(user.id, newRole)}
                      >
                        <SelectTrigger className="w-36 h-7 text-xs border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>{getRoleBadge(user.role)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">👑 Admin</SelectItem>
                          <SelectItem value="agent">🧑‍💼 Agent</SelectItem>
                          <SelectItem value="company">🏢 Entreprise</SelectItem>
                          <SelectItem value="influencer">⭐ Influencer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                    <TableCell>
                      {user.role === 'agent' ? `${user.commission_rate || 0}%` : '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'agent' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            data-testid={`edit-btn-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.status || 'active')}
                          data-testid={`toggle-status-btn-${user.id}`}
                        >
                          {(user.status || 'active') === 'active' ? (
                            <UserX className="h-4 w-4 text-red-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      {i18n.language === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}
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

      {/* Edit Commission Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="edit-commission-dialog">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'fr' ? 'Modifier le taux de commission' : 'Edit Commission Rate'}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? `Modifier la commission de ${editUser?.first_name} ${editUser?.last_name}`
                : `Edit commission for ${editUser?.first_name} ${editUser?.last_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Taux de commission (%)' : 'Commission Rate (%)'}
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="Ex: 10.5"
                data-testid="commission-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={saveCommission} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-commission-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
