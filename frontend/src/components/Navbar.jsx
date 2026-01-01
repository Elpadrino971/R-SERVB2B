import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Menu, X, Car, MapPin, BookOpen, Users, Calendar, HelpCircle, 
  LogIn, UserPlus, User, LogOut, LayoutDashboard, Globe, ChevronDown 
} from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const navLinks = [
    { to: '/vehicles', label: t('nav.vehicles'), icon: Car },
    { to: '/agencies', label: t('nav.agencies'), icon: MapPin },
    { to: '/blog', label: t('nav.blog'), icon: BookOpen },
    { to: '/partners', label: t('nav.partners'), icon: Users },
    { to: '/events', label: t('nav.events'), icon: Calendar },
    { to: '/faq', label: t('nav.faq'), icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'agent') return '/agent';
    if (user?.role === 'company') return '/company';
    if (user?.role === 'influencer') return '/influencer';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <img 
                src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
                alt="Auto Discount Location"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.to
                    ? 'text-[#F5A623] bg-[#F5A623]/10'
                    : 'text-slate-700 hover:text-[#3D3A6B] hover:bg-slate-100'
                }`}
                data-testid={`nav-${link.to.slice(1)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1" data-testid="language-switcher">
                  <Globe className="h-4 w-4" />
                  <span className="uppercase">{i18n.language}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('fr')} data-testid="lang-fr">
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')} data-testid="lang-en">
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="user-menu-trigger">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.first_name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-[#F5A623] capitalize mt-1">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="flex items-center gap-2" data-testid="dashboard-link">
                      <LayoutDashboard className="h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="logout-btn">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild data-testid="login-btn">
                  <Link to="/login" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button asChild className="btn-primary" data-testid="register-btn">
                  <Link to="/register" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('nav.register')}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 animate-slide-down" data-testid="mobile-menu">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.to
                      ? 'text-[#F5A623] bg-[#F5A623]/10'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 space-y-2 border-t border-slate-200 mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      {t('nav.login')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full btn-primary">
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('nav.register')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
