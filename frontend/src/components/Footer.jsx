import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { label: i18n.language === 'fr' ? 'Qui sommes-nous' : 'About us', to: '/about' },
      { label: 'CGV', to: '/terms' },
      { label: i18n.language === 'fr' ? 'Confidentialité' : 'Privacy', to: '/privacy' },
      { label: i18n.language === 'fr' ? 'Mentions légales' : 'Legal notice', to: '/terms' },
    ],
    agencies: [
      { label: 'Guadeloupe', to: '/agencies?region=guadeloupe' },
      { label: 'Guyane', to: '/agencies?region=guyane' },
      { label: 'Martinique', to: '/agencies?region=martinique' },
      { label: 'Saint-Martin', to: '/agencies?region=saint-martin' },
    ],
    support: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
      { label: i18n.language === 'fr' ? 'Notre flotte' : 'Our fleet', to: '/vehicles/tourisme' },
      { label: i18n.language === 'fr' ? 'Nos utilitaires' : 'Utility vehicles', to: '/vehicles/utilitaire' },
    ],
  };

  return (
    <footer className="text-white" style={{ backgroundColor: '#312A5C' }} data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={SITE_CONFIG.assets?.logo || '/logo-auto-discount.png'} 
                alt={SITE_CONFIG.name}
                className="h-[77px] object-contain"
              />
            </div>
            <p className="text-slate-300 text-sm">
              {i18n.language === 'fr' 
                ? 'Votre partenaire de confiance pour la location de véhicules aux Antilles et en Guyane depuis 25 ans.'
                : 'Your trusted partner for vehicle rental in the Caribbean and Guyana for 25 years.'}
            </p>
            <div className="flex gap-3">
              <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#F9A826] transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#F9A826] transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#F9A826] transition-colors" aria-label="Youtube">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* À propos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {i18n.language === 'fr' ? 'À propos' : 'About'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.to + link.label}>
                  <Link 
                    to={link.to} 
                    className="text-slate-300 hover:text-[#F9A826] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Agences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {i18n.language === 'fr' ? 'Agences' : 'Agencies'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.agencies.map((link) => (
                <li key={link.to + link.label}>
                  <Link 
                    to={link.to} 
                    className="text-slate-300 hover:text-[#F9A826] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {i18n.language === 'fr' ? 'Aide' : 'Help'}
            </h3>
            <ul className="space-y-2 mb-4">
              {footerLinks.support.map((link) => (
                <li key={link.to + link.label}>
                  <Link 
                    to={link.to} 
                    className="text-slate-300 hover:text-[#F9A826] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4 mt-0.5 text-[#F9A826]" />
                <span>Aéroport Pôle Caraïbes<br />97139 Les Abymes, Guadeloupe</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-[#F9A826]" />
                <a href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`} className="hover:text-[#F9A826] transition-colors">
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-[#F9A826]" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-[#F9A826] transition-colors">
                  {SITE_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} Auto Discount Location. {i18n.language === 'fr' ? 'SARL au capital de 450 000 €' : 'LLC, capital 450,000 €'}
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/terms" className="text-slate-400 hover:text-[#F9A826] transition-colors">
              {i18n.language === 'fr' ? 'Mentions légales' : 'Legal notice'}
            </Link>
            <Link to="/privacy" className="text-slate-400 hover:text-[#F9A826] transition-colors">
              {i18n.language === 'fr' ? 'Confidentialité' : 'Privacy'}
            </Link>
            <Link to="/cookies" className="text-slate-400 hover:text-[#F9A826] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
