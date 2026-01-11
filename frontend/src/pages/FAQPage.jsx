import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Card, CardContent } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, HelpCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FAQPage = () => {
  const { i18n } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get(`${API}/faq`);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const question = i18n.language === 'fr' ? faq.question_fr : faq.question_en;
    const answer = i18n.language === 'fr' ? faq.answer_fr : faq.answer_en;
    const searchLower = search.toLowerCase();
    return question.toLowerCase().includes(searchLower) || answer.toLowerCase().includes(searchLower);
  });

  // Group by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const cat = faq.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const categoryLabels = {
    rental: i18n.language === 'fr' ? 'Location' : 'Rental',
    booking: i18n.language === 'fr' ? 'Réservation' : 'Booking',
    agent: i18n.language === 'fr' ? 'Agents' : 'Agents',
    payment: i18n.language === 'fr' ? 'Paiement' : 'Payment',
    general: i18n.language === 'fr' ? 'Général' : 'General',
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="faq-page">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {i18n.language === 'fr' ? 'Foire aux Questions' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            {i18n.language === 'fr' 
              ? 'Trouvez rapidement les réponses à vos questions'
              : 'Quickly find answers to your questions'}
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder={i18n.language === 'fr' ? 'Rechercher une question...' : 'Search for a question...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base bg-white"
              data-testid="faq-search"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="flex-1 py-12 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(groupedFaqs).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category}>
                  <Badge className="bg-[#3D3A6B] text-white mb-4">
                    {categoryLabels[category] || category}
                  </Badge>
                  <Accordion type="single" collapsible className="space-y-2">
                    {categoryFaqs.map((faq, index) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="bg-white rounded-lg border border-slate-200 px-4"
                      >
                        <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-[#3D3A6B]">
                          {i18n.language === 'fr' ? faq.question_fr : faq.question_en}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 pb-4">
                          {i18n.language === 'fr' ? faq.answer_fr : faq.answer_en}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {i18n.language === 'fr' ? 'Aucun résultat' : 'No results'}
              </h3>
              <p className="text-slate-600">
                {i18n.language === 'fr' 
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Try with different keywords'}
              </p>
            </Card>
          )}
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default FAQPage;
