import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: i18n.language === 'fr' ? 'Location courte durée' : 'Short-term rental', to: '/vehicles' },
      { label: i18n.language === 'fr' ? 'Location longue durée' : 'Long-term rental', to: '/vehicles' },
      { label: i18n.language === 'fr' ? 'Flottes entreprises' : 'Corporate fleets', to: '/company' },
      { label: i18n.language === 'fr' ? 'Partenariats agents' : 'Agent partnerships', to: '/register' },
    ],
    company: [
      { label: i18n.language === 'fr' ? 'À propos' : 'About us', to: '/about' },
      { label: i18n.language === 'fr' ? 'Nos agences' : 'Our agencies', to: '/agencies' },
      { label: 'Blog', to: '/blog' },
      { label: i18n.language === 'fr' ? 'Événements' : 'Events', to: '/events' },
    ],
    support: [
      { label: 'FAQ', to: '/faq' },
      { label: i18n.language === 'fr' ? 'Contact' : 'Contact', to: '/contact' },
      { label: i18n.language === 'fr' ? 'CGV' : 'Terms', to: '/terms' },
      { label: i18n.language === 'fr' ? 'Confidentialité' : 'Privacy', to: '/privacy' },
    ],
  };

  return (
    <footer className="bg-[#3D3A6B] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
                alt="Auto Discount Location"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-slate-300 text-sm">
              {i18n.language === 'fr' 
                ? 'Votre partenaire de confiance pour la location de véhicules aux Antilles et dans les DOM-TOM.'
                : 'Your trusted partner for vehicle rental in the French Caribbean and overseas territories.'}
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-slate-300 hover:text-[#F5A623] transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-[#F5A623] transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-[#F5A623] transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-[#F5A623] transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {i18n.language === 'fr' ? 'Nos services' : 'Our services'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.to + link.label}>
                  <Link 
                    to={link.to} 
                    className="text-slate-300 hover:text-[#F5A623] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {i18n.language === 'fr' ? 'Entreprise' : 'Company'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.to + link.label}>
                  <Link 
                    to={link.to} 
                    className="text-slate-300 hover:text-[#F5A623] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4 mt-0.5 text-[#F5A623]" />
                <span>Aéroport Pôle Caraïbes<br />97139 Les Abymes, Guadeloupe</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-[#F5A623]" />
                <a href="tel:+590590XXXXXX" className="hover:text-[#F5A623] transition-colors">
                  +590 590 XX XX XX
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-[#F5A623]" />
                <a href="mailto:contact@auto-discount.fr" className="hover:text-[#F5A623] transition-colors">
                  contact@auto-discount.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} Auto Discount Location. {i18n.language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/terms" className="text-slate-400 hover:text-[#F5A623] transition-colors">
              {i18n.language === 'fr' ? 'Mentions légales' : 'Legal notice'}
            </Link>
            <Link to="/privacy" className="text-slate-400 hover:text-[#F5A623] transition-colors">
              {i18n.language === 'fr' ? 'Confidentialité' : 'Privacy'}
            </Link>
            <Link to="/cookies" className="text-slate-400 hover:text-[#F5A623] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
