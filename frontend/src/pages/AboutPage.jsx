import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Car,
  Shield,
  CheckCircle2,
  MapPin,
  Users,
  Award,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

const AboutPage = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language === 'fr';

  const advantages = [
    {
      icon: CheckCircle2,
      text: isFr ? 'Confirmation immédiate' : 'Immediate confirmation',
    },
    {
      icon: Shield,
      text: isFr ? 'Paiements sécurisés' : 'Secure payments',
    },
    {
      icon: Car,
      text: isFr ? 'Des prix tout compris' : 'All-inclusive prices',
    },
    {
      icon: CheckCircle2,
      text: isFr ? 'Kilométrage illimité' : 'Unlimited mileage',
    },
    {
      icon: Shield,
      text: isFr ? 'Assurances incluses' : 'Insurance included',
    },
    {
      icon: Car,
      text: isFr ? 'Des véhicules récents' : 'Recent vehicles',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-testid="about-page">
      <Navbar />

      <section className="gradient-hero py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isFr ? 'À propos de nous' : 'About us'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {isFr
              ? 'Présent depuis 25 ans aux Antilles et en Guyane'
              : 'Present for 25 years in the Caribbean and Guyana'}
          </p>
        </div>
      </section>

      <section className="flex-1 py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Parc de véhicules */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {isFr
                  ? 'Plus de 4000 véhicules à votre disposition'
                  : 'More than 4000 vehicles at your disposal'}
              </h2>
              <p className="text-slate-600 mb-4">
                {isFr
                  ? 'Notre parc de véhicules s\'étend aujourd\'hui à plus de 4000 voitures de tourisme et utilitaires. De la petite citadine Kia Picanto à la confortable Renault Captur, en passant par les SUV/Crossover familiales 5 et 7 places, à vitesses manuelles ou automatiques, nos véhicules sont équipés de climatisation, barres de toit, sièges et réhausseurs enfants.'
                  : 'Our fleet now includes more than 4000 cars and utility vehicles. From the small Kia Picanto city car to the comfortable Renault Captur, including 5 and 7-seater family SUVs/Crossovers, with manual or automatic transmission, our vehicles are equipped with air conditioning, roof bars, child seats and boosters.'}
              </p>
              <p className="text-slate-600">
                {isFr
                  ? 'Chaque véhicule est contrôlé régulièrement, nettoyé et vérifié avant sa mise en location pour garantir votre confort et votre sécurité.'
                  : 'Each vehicle is regularly checked, cleaned and inspected before rental to ensure your comfort and safety.'}
              </p>
            </div>
            <Card className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1569025743873-ea3a9ce32f8b?w=1200"
                  alt={isFr ? 'Parc de véhicules Auto Discount' : 'Auto Discount vehicle fleet'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#332859]/30" />
              </div>
              <CardContent className="p-6">
                <p className="text-center font-semibold text-slate-800">
                  {SITE_CONFIG.stats.vehicles}+ {isFr ? 'véhicules' : 'vehicles'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Zones couvertes */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {isFr
                ? 'Location en Guadeloupe, Martinique, Saint-Martin et Guyane'
                : 'Rental in Guadeloupe, Martinique, Saint-Martin and Guyana'}
            </h2>
            <p className="text-slate-600 mb-6">
              {isFr
                ? 'Louer un véhicule auprès d\'Auto Discount, c\'est l\'assurance de réserver un véhicule disponible le jour-J, répondant à vos attentes en matière de confort et de sécurité. Nos agences sont stratégiquement situées à proximité des aéroports et pôles touristiques.'
                : 'Renting from Auto Discount guarantees you a vehicle available on the day, meeting your expectations for comfort and safety. Our agencies are strategically located near airports and tourist areas.'}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SITE_CONFIG.regions.map((region) => (
                <Card key={region} className="card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-[#F9A826]" />
                    <span className="font-semibold text-slate-800">{region}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {isFr ? 'Les avantages Auto Discount' : 'Auto Discount advantages'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advantages.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white border border-slate-100"
                >
                  <item.icon className="h-6 w-6 text-[#10B981]" />
                  <span className="text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Qui peut louer */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-[#332859]" />
                {isFr ? 'Qui peut louer nos véhicules ?' : 'Who can rent our vehicles?'}
              </h3>
              <p className="text-slate-600">
                {isFr
                  ? 'Nos véhicules de location s\'adressent aux touristes en vacances, particuliers résidants et professionnels en voyage d\'affaires ou installés, pour des courtes, moyennes et longues durées.'
                  : 'Our rental vehicles are for tourists on vacation, resident individuals and professionals on business trips or based locally, for short, medium and long-term rentals.'}
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Button asChild className="btn-primary" size="lg">
              <Link to="/agencies">
                {isFr ? 'Voir nos agences' : 'View our agencies'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default AboutPage;
