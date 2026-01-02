import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, Users, Video, MapPin, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EventsPage = () => {
  const { i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  const registerForEvent = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await axios.post(`${API}/events/${selectedEvent.id}/register`, formData);
      toast.success('Inscription réussie ! Vous recevrez un email avec le lien de connexion');
      setShowRegisterDialog(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Erreur lors de l\'inscription');
    }
  };

  const EventCard = ({ event }) => {
    const isFull = event.registered_count >= event.max_attendees;
    const spotsLeft = event.max_attendees - event.registered_count;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge className={event.event_type === 'webinar' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
              {event.event_type === 'webinar' ? '🎥 Webinaire' : '🏢 Workshop'}
            </Badge>
            {spotsLeft < 5 && spotsLeft > 0 && (
              <Badge variant="destructive">Plus que {spotsLeft} places</Badge>
            )}
            {isFull && <Badge variant="destructive">Complet</Badge>}
          </div>

          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <p className="text-slate-600 mb-4">{event.description}</p>

          <div className="space-y-2 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.event_date), 'PPP', { locale: fr })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {event.duration} minutes
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event.registered_count} / {event.max_attendees} inscrits
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedEvent(event);
              setShowRegisterDialog(true);
            }}
            disabled={isFull}
            className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
          >
            {isFull ? 'Complet' : 'S\'inscrire'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3D3A6B] to-[#252240] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Événements & Formations
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Participez à nos workshops et webinaires dédiés aux partenaires
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-8">
            <TabsTrigger value="upcoming">À venir ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Passés ({pastEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-600 text-lg">Aucun événement prévu pour le moment</p>
                <p className="text-slate-500 mt-2">Revenez bientôt pour découvrir nos prochains événements !</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-600 text-lg">Aucun événement passé</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscription - {selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour vous inscrire à cet événement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Prénom *</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <Button onClick={registerForEvent} className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-black">
              <Check className="mr-2 h-4 w-4" />
              Confirmer l'inscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventsPage;
