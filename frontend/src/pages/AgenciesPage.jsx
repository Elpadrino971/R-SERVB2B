import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AgenciesPage = () => {
  const { i18n } = useTranslation();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const response = await axios.get(`${API}/agencies`);
      setAgencies(response.data);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : agencies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <Card key={agency.id} className="overflow-hidden card-hover">
                  <div className="aspect-video bg-slate-200 relative">
                    {agency.image_url ? (
                      <img 
                        src={agency.image_url} 
                        alt={agency.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3D3A6B] to-[#252240]">
                        <MapPin className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-[#F5A623] text-black px-3 py-1 rounded-full text-sm font-semibold">
                      {agency.code}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg text-slate-800 mb-3">{agency.name}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 mt-0.5 text-[#F5A623]" />
                        <span>{agency.address}, {agency.city}, {agency.country}</span>
                      </div>
                      
                      {agency.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4 text-[#F5A623]" />
                          <a href={`tel:${agency.phone}`} className="hover:text-[#3D3A6B]">
                            {agency.phone}
                          </a>
                        </div>
                      )}
                      
                      {agency.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4 text-[#F5A623]" />
                          <a href={`mailto:${agency.email}`} className="hover:text-[#3D3A6B]">
                            {agency.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        {i18n.language === 'fr' ? 'Appeler' : 'Call'}
                      </Button>
                      <Button className="flex-1 btn-primary" size="sm">
                        <Navigation className="h-4 w-4 mr-1" />
                        {i18n.language === 'fr' ? 'Itinéraire' : 'Directions'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
