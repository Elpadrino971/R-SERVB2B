import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { toast } from 'sonner';

const ContactPage = () => {
  const { i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success(
        i18n.language === 'fr'
          ? 'Message envoyé ! Nous vous recontacterons rapidement.'
          : 'Message sent! We will contact you shortly.'
      );
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(
        i18n.language === 'fr'
          ? 'Erreur lors de l\'envoi du message'
          : 'Error sending message'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isFr = i18n.language === 'fr';

  return (
    <div className="min-h-screen flex flex-col" data-testid="contact-page">
      <Navbar />

      <section className="gradient-hero py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isFr ? 'Contact' : 'Contact'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {isFr
              ? 'Une question ? Nous sommes là pour vous aider.'
              : 'Have a question? We are here to help you.'}
          </p>
        </div>
      </section>

      <section className="flex-1 py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Infos de contact */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="h-5 w-5 text-[#332859]" />
                    {isFr ? 'Téléphone' : 'Phone'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
                    className="text-slate-700 hover:text-[#332859] font-medium"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-[#332859]" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="text-slate-700 hover:text-[#332859] font-medium"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-[#332859]" />
                    {isFr ? 'Siège principal' : 'Head office'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">
                    Aéroport Pôle Caraïbes<br />
                    Rue Emmanuel Varieux, Petit Pérou<br />
                    97139 Les Abymes, Guadeloupe
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-[#332859]" />
                    {isFr ? 'Horaires' : 'Hours'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">
                    {isFr
                      ? 'Service clients disponible 5j/7'
                      : 'Customer service available 5 days a week'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isFr ? 'Envoyez-nous un message' : 'Send us a message'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{isFr ? 'Nom' : 'Name'}</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder={isFr ? 'Votre nom' : 'Your name'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">{isFr ? 'Téléphone' : 'Phone'}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+590 690 XX XX XX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">
                          {isFr ? 'Sujet' : 'Subject'}
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder={
                            isFr
                              ? 'Objet de votre demande'
                              : 'Subject of your request'
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">
                        {isFr ? 'Message' : 'Message'}
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder={
                          isFr
                            ? 'Décrivez votre demande...'
                            : 'Describe your request...'
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto btn-primary"
                      disabled={submitting}
                    >
                      {submitting
                        ? isFr
                          ? 'Envoi...'
                          : 'Sending...'
                        : isFr
                        ? 'Envoyer'
                        : 'Send'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default ContactPage;
