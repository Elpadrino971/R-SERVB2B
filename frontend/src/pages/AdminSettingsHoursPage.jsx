import React, { useState, useEffect } from 'react';
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
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Clock, Calendar, Plus, Trash2, Save, MapPin,
  CheckCircle, XCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

const AdminSettingsHoursPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      fetchAgencyHours();
    }
  }, [selectedAgency]);

  const fetchAgencies = async () => {
    try {
      const response = await axios.get(`${API}/agencies`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAgencies(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedAgency(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast.error('Erreur lors du chargement des agences');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencyHours = async () => {
    try {
      const response = await axios.get(`${API}/agencies/${selectedAgency}/hours`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Initialize with default hours if none exist
      const defaultHours = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day.key] = {
          is_open: day.key !== 'sunday',
          morning_open: '08:00',
          morning_close: '12:00',
          afternoon_open: '14:00',
          afternoon_close: '18:00'
        };
        return acc;
      }, {});

      setHours(response.data.hours || defaultHours);
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error('Error fetching hours:', error);
      // Initialize with default hours on error
      const defaultHours = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day.key] = {
          is_open: day.key !== 'sunday',
          morning_open: '08:00',
          morning_close: '12:00',
          afternoon_open: '14:00',
          afternoon_close: '18:00'
        };
        return acc;
      }, {});
      setHours(defaultHours);
    }
  };

  const updateDayHours = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const toggleDayOpen = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        is_open: !prev[day]?.is_open
      }
    }));
  };

  const saveHours = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${API}/agencies/${selectedAgency}/hours`,
        { hours, holidays },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.success('Horaires enregistrés avec succès');
    } catch (error) {
      console.error('Error saving hours:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setHolidays(prev => [...prev, { ...newHoliday, id: Date.now().toString() }]);
    setNewHoliday({ date: '', name: '' });
  };

  const removeHoliday = (id) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuration des horaires</h1>
        <p className="text-gray-600 mt-2">
          Gérez les horaires d'ouverture et jours fériés par agence
        </p>
      </div>

      {/* Agency Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sélection de l'agence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAgency} onValueChange={setSelectedAgency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une agence" />
            </SelectTrigger>
            <SelectContent>
              {agencies.map((agency) => (
                <SelectItem key={agency.id} value={agency.id}>
                  {agency.name} - {agency.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horaires d'ouverture
          </CardTitle>
          <CardDescription>
            Définissez les horaires d'ouverture pour chaque jour de la semaine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day.key}
              className={`p-4 rounded-lg border-2 transition-all ${
                hours[day.key]?.is_open
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{day.label}</h3>
                  {hours[day.key]?.is_open ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ouvert
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Fermé
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDayOpen(day.key)}
                >
                  {hours[day.key]?.is_open ? 'Fermer' : 'Ouvrir'}
                </Button>
              </div>

              {hours[day.key]?.is_open && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">
                      Matin : Ouverture
                    </label>
                    <Input
                      type="time"
                      value={hours[day.key]?.morning_open || ''}
                      onChange={(e) => updateDayHours(day.key, 'morning_open', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">
                      Matin : Fermeture
                    </label>
                    <Input
                      type="time"
                      value={hours[day.key]?.morning_close || ''}
                      onChange={(e) => updateDayHours(day.key, 'morning_close', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">
                      Après-midi : Ouverture
                    </label>
                    <Input
                      type="time"
                      value={hours[day.key]?.afternoon_open || ''}
                      onChange={(e) => updateDayHours(day.key, 'afternoon_open', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">
                      Après-midi : Fermeture
                    </label>
                    <Input
                      type="time"
                      value={hours[day.key]?.afternoon_close || ''}
                      onChange={(e) => updateDayHours(day.key, 'afternoon_close', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={saveHours}
            disabled={saving}
            className="w-full bg-[#3D3A6B] hover:bg-[#3D3A6B]/90"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les horaires'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Holidays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Jours fériés et fermetures exceptionnelles
          </CardTitle>
          <CardDescription>
            Ajoutez les dates de fermeture exceptionnelle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Holiday Form */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                placeholder="Date"
              />
            </div>
            <div className="flex-1">
              <Input
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="Nom du jour férié"
              />
            </div>
            <Button onClick={addHoliday} className="bg-[#F5A623] hover:bg-[#E09612]">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {/* Holidays List */}
          {holidays.length > 0 ? (
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{holiday.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(holiday.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHoliday(holiday.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun jour férié défini</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsHoursPage;
