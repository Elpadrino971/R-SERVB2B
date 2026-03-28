import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Phone, Mail, Navigation } from 'lucide-react';
import { AGENCIES_DATA } from '../data/agencies';

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;

const AgenciesPage = () => {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const regionFilter = searchParams.get('region');
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    if (API) {
      try {
        const response = await axios.get(`${API}/agencies`);
        const data = response.data || [];
        setAgencies(Array.isArray(data) ? data : (data.agencies || []));
      } catch (error) {
        console.warn('API non disponible, utilisation des données statiques:', error.message);
        setAgencies(AGENCIES_DATA);
      } finally {
        setLoading(false);
      }
    } else {
      setAgencies(AGENCIES_DATA);
      setLoading(false);
    }
  };

  const isFr = i18n.language === 'fr';
  const filteredAgencies = regionFilter
    ? agencies.filter((a) =>
        (a.region || a.country || '').toLowerCase().includes(regionFilter.toLowerCase())
      )
    : agencies;

  const getAgencyImage = (agency) => {
    if (agency.image_url) return agency.image_url;
    const fallback = AGENCIES_DATA.find(
      (a) => (a.id && a.id === (agency.id || agency._id)) || (a.code && a.code === agency.code)
    );
    return fallback?.image_url;
  };

  const formatAgency = (agency) => ({
    id: agency.id || agency._id,
    code: agency.code,
    name: agency.name,
    address: agency.address,
    city: agency.city,
    country: agency.country || agency.region,
    phone: agency.phone,
    email: agency.email,
    hours: agency.hours ? (isFr ? agency.hours.fr : agency.hours.en) : agency.opening_hours,
  });

  return (
    <div className="min-h-screen flex flex-col" data-testid="agencies-page">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {i18n.language === 'fr' ? 'Nos Agences' : 'Our Agencies'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {i18n.language === 'fr' 
              ? 'Retrouvez-nous dans les principales destinations des Antilles'
              : 'Find us in the main Caribbean destinations'}
          </p>
        </div>
      </section>

      {/* Agencies Grid */}
      <section className="flex-1 py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-[#F9A826] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAgencies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgencies.map((agency) => {
                const a = formatAgency(agency);
                return (
                  <Card key={a.id || agency.code} className="overflow-hidden card-hover">
                    <div className="aspect-video bg-slate-200 relative">
                      {getAgencyImage(agency) ? (
                        <img 
                          src={getAgencyImage(agency)} 
                          alt={a.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#332859] to-[#252040]">
                          <MapPin className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-[#F9A826] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {a.code}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg text-slate-800 mb-3">{a.name}</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 mt-0.5 text-[#332859]" />
                          <span>{a.address}, {a.city}, {a.country}</span>
                        </div>
                        
                        {a.phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-4 w-4 text-[#332859]" />
                            <a href={`tel:${a.phone.replace(/\s/g, '')}`} className="hover:text-[#332859]">
                              {a.phone}
                            </a>
                          </div>
                        )}
                        
                        {a.email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="h-4 w-4 text-[#332859]" />
                            <a href={`mailto:${a.email}`} className="hover:text-[#332859]">
                              {a.email}
                            </a>
                          </div>
                        )}
                        {a.hours && (
                          <div className="text-slate-500 text-xs pt-1">
                            {a.hours}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                        {a.phone && (
                          <Button variant="outline" className="flex-1" size="sm" asChild>
                            <a href={`tel:${a.phone.replace(/\s/g, '')}`}>
                              <Phone className="h-4 w-4 mr-1" />
                              {isFr ? 'Appeler' : 'Call'}
                            </a>
                          </Button>
                        )}
                        <Button className="flex-1 btn-primary" size="sm" asChild>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.address} ${a.city}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            {isFr ? 'Itinéraire' : 'Directions'}
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {i18n.language === 'fr' ? 'Aucune agence disponible' : 'No agencies available'}
              </h3>
            </Card>
          )}
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default AgenciesPage;
