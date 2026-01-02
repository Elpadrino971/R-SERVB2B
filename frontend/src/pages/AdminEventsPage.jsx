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
  Calendar, Plus, Edit, Trash2, Users, Video, MapPin, Clock,
  Bell, XCircle, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminEventsPage = () => {
  const { i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'webinar',
    event_date: '',
    duration: 60,
    max_attendees: 50,
    registration_deadline: '',
    meeting_link: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/events`);
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading events');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        event_type: event.event_type || 'webinar',
        event_date: event.event_date?.split('T')[0] + 'T' + event.event_date?.split('T')[1]?.slice(0, 5) || '',
        duration: event.duration || 60,
        max_attendees: event.max_attendees || 50,
        registration_deadline: event.registration_deadline?.split('T')[0] || '',
        meeting_link: event.meeting_link || ''
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        event_type: 'webinar',
        event_date: '',
        duration: 60,
        max_attendees: 50,
        registration_deadline: '',
        meeting_link: ''
      });
    }
    setDialogOpen(true);
  };

  const saveEvent = async () => {
    try {
      const payload = {
        ...eventForm,
        event_date: new Date(eventForm.event_date).toISOString(),
        registration_deadline: eventForm.registration_deadline
          ? new Date(eventForm.registration_deadline).toISOString()
          : null
      };

      if (editingEvent) {
        await axios.put(`${API}/admin/events/${editingEvent.id}`, payload);
        toast.success(i18n.language === 'fr' ? 'Événement mis à jour' : 'Event updated');
      } else {
        await axios.post(`${API}/admin/events`, payload);
        toast.success(i18n.language === 'fr' ? 'Événement créé' : 'Event created');
      }

      setDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving event');
    }
  };

  const cancelEvent = async (eventId) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Annuler cet événement ?' : 'Cancel this event?')) {
      return;
    }
    try {
      await axios.put(`${API}/admin/events/${eventId}`, { status: 'cancelled' });
      toast.success(i18n.language === 'fr' ? 'Événement annulé' : 'Event cancelled');
      fetchEvents();
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'annulation' : 'Error cancelling event');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Supprimer cet événement ?' : 'Delete this event?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/events/${eventId}`);
      toast.success(i18n.language === 'fr' ? 'Événement supprimé' : 'Event deleted');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting event');
    }
  };

  const viewAttendees = async (event) => {
    try {
      const response = await axios.get(`${API}/admin/events/${event.id}/attendees`);
      setSelectedEventAttendees(response.data.attendees || []);
      setAttendeesDialogOpen(true);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement des participants' : 'Error loading attendees');
    }
  };

  const sendReminder = async (eventId) => {
    try {
      await axios.post(`${API}/admin/events/${eventId}/reminder`);
      toast.success(i18n.language === 'fr' ? 'Rappel envoyé aux participants' : 'Reminder sent to attendees');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'envoi' : 'Error sending reminder');
    }
  };

  const getEventTypeBadge = (type) => {
    const typeConfig = {
      workshop: { class: 'bg-blue-100 text-blue-800', icon: MapPin, label: 'Workshop' },
      webinar: { class: 'bg-purple-100 text-purple-800', icon: Video, label: 'Webinaire' },
    };
    const config = typeConfig[type] || typeConfig.webinar;
    const Icon = config.icon;
    return (
      <Badge className={config.class}>
        <Icon className="h-3 w-3 mr-1" />
        {i18n.language === 'fr' ? config.label : type}
      </Badge>
    );
  };

  const getStatusBadge = (event) => {
    if (event.status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
    }
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const isPast = eventDate < now;

    if (isPast) {
      return <Badge className="bg-slate-100 text-slate-800">Terminé</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800">À venir</Badge>;
  };

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    return eventDate > new Date() && e.status !== 'cancelled';
  });

  const pastEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    return eventDate <= new Date() || e.status === 'cancelled';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-events-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Gestion des Événements' : 'Events Management'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? `${upcomingEvents.length} à venir • ${pastEvents.length} terminés`
              : `${upcomingEvents.length} upcoming • ${pastEvents.length} past`}
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="create-event-btn">
          <Plus className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Créer événement' : 'Create Event'}
        </Button>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {i18n.language === 'fr' ? 'Événements à venir' : 'Upcoming Events'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="card-hover" data-testid={`event-card-${event.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1">{event.description}</CardDescription>
                    </div>
                    {getStatusBadge(event)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getEventTypeBadge(event.event_type)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.event_date).toLocaleDateString()} à {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.duration} {i18n.language === 'fr' ? 'minutes' : 'minutes'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.attendees_count || 0} / {event.max_attendees} {i18n.language === 'fr' ? 'inscrits' : 'registered'}
                    </span>
                  </div>

                  {event.meeting_link && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Video className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3D3A6B] hover:underline truncate"
                      >
                        {event.meeting_link}
                      </a>
                    </div>
                  )}

                  {event.registration_deadline && (
                    <div className="text-xs text-slate-500">
                      {i18n.language === 'fr' ? 'Inscription jusqu\'au' : 'Register by'} {new Date(event.registration_deadline).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewAttendees(event)}
                      data-testid={`view-attendees-${event.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {i18n.language === 'fr' ? 'Participants' : 'Attendees'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReminder(event.id)}
                      data-testid={`send-reminder-${event.id}`}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(event)}
                      data-testid={`edit-event-${event.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEvent(event.id)}
                      data-testid={`cancel-event-${event.id}`}
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {i18n.language === 'fr' ? 'Événements passés' : 'Past Events'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75" data-testid={`event-card-${event.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    {getStatusBadge(event)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getEventTypeBadge(event.event_type)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees_count || 0} {i18n.language === 'fr' ? 'participants' : 'attendees'}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => deleteEvent(event.id)}
                    data-testid={`delete-event-${event.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {i18n.language === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            {i18n.language === 'fr' ? 'Aucun événement trouvé' : 'No events found'}
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="event-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingEvent
                ? (i18n.language === 'fr' ? 'Modifier l\'événement' : 'Edit Event')
                : (i18n.language === 'fr' ? 'Créer un événement' : 'Create Event')}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? 'Remplissez les informations de l\'événement'
                : 'Fill in the event information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Titre' : 'Title'} *
              </label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Formation sur les nouvelles fonctionnalités"
                data-testid="event-title-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Description' : 'Description'} *
              </label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez l'événement..."
                data-testid="event-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Type' : 'Type'} *
                </label>
                <Select
                  value={eventForm.event_type}
                  onValueChange={(value) => setEventForm(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger data-testid="event-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="webinar">{i18n.language === 'fr' ? 'Webinaire' : 'Webinar'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Durée (minutes)' : 'Duration (minutes)'} *
                </label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={eventForm.duration}
                  onChange={(e) => setEventForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  data-testid="event-duration-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Date et heure' : 'Date and Time'} *
                </label>
                <Input
                  type="datetime-local"
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
                  data-testid="event-date-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Date limite d\'inscription' : 'Registration Deadline'}
                </label>
                <Input
                  type="date"
                  value={eventForm.registration_deadline}
                  onChange={(e) => setEventForm(prev => ({ ...prev, registration_deadline: e.target.value }))}
                  data-testid="event-deadline-input"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Nombre maximum de participants' : 'Maximum Attendees'} *
              </label>
              <Input
                type="number"
                min="1"
                value={eventForm.max_attendees}
                onChange={(e) => setEventForm(prev => ({ ...prev, max_attendees: parseInt(e.target.value) }))}
                data-testid="event-max-attendees-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Lien de la réunion (Zoom, Teams, etc.)' : 'Meeting Link (Zoom, Teams, etc.)'}
              </label>
              <Input
                type="url"
                value={eventForm.meeting_link}
                onChange={(e) => setEventForm(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://zoom.us/j/..."
                data-testid="event-link-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={saveEvent} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-event-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={attendeesDialogOpen} onOpenChange={setAttendeesDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="attendees-dialog">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'fr' ? 'Liste des participants' : 'Attendees List'}
            </DialogTitle>
            <DialogDescription>
              {selectedEventAttendees.length} {i18n.language === 'fr' ? 'participant(s) inscrit(s)' : 'registered attendee(s)'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedEventAttendees.length > 0 ? (
              <div className="space-y-2">
                {selectedEventAttendees.map((attendee, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{attendee.name || `${attendee.first_name} ${attendee.last_name}`}</p>
                      <p className="text-sm text-slate-600">{attendee.email}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(attendee.registered_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                {i18n.language === 'fr' ? 'Aucun participant inscrit' : 'No attendees registered'}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendeesDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventsPage;
