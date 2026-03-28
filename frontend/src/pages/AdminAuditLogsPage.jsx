import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { toast } from 'sonner';
import { Shield, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN:  'bg-purple-100 text-purple-800',
};

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [userIdInput, setUserIdInput] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (entityTypeFilter !== 'all') params.set('entity_type', entityTypeFilter);
      if (userIdFilter) params.set('user_id', userIdFilter);

      const res = await axios.get(`${API}/admin/audit-logs?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  }, [page, entityTypeFilter, userIdFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleUserSearch = () => {
    setUserIdFilter(userIdInput.trim());
    setPage(1);
  };

  const handleFilterChange = (val) => {
    setEntityTypeFilter(val);
    setPage(1);
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#3D3A6B]" />
            Journal d'audit
          </h1>
          <p className="text-slate-500">{total} entrée(s) au total</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3">
          <Select value={entityTypeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type d'entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="reservation">Réservations</SelectItem>
              <SelectItem value="user">Utilisateurs</SelectItem>
              <SelectItem value="vehicle">Véhicules</SelectItem>
              <SelectItem value="agency">Agences</SelectItem>
              <SelectItem value="allotment">Allotements</SelectItem>
              <SelectItem value="promo">Promos</SelectItem>
              <SelectItem value="stop_sale">Stop-Sales</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-1 min-w-[260px]">
            <Input
              placeholder="Filtrer par User ID..."
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
            />
            <Button variant="outline" onClick={handleUserSearch}>
              <Search className="h-4 w-4" />
            </Button>
            {userIdFilter && (
              <Button variant="ghost" size="sm" onClick={() => { setUserIdFilter(''); setUserIdInput(''); setPage(1); }}>
                ×
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entrées ({logs.length} sur {total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun log trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>ID Entité</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium capitalize">{log.entity_type}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-400 max-w-[140px] truncate">
                      {log.entity_id}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-400 max-w-[140px] truncate">
                      {log.user_id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
