import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  LayoutDashboard, Calendar, DollarSign, Trophy, User, Settings,
  LogOut, Menu, X, ChevronDown, Globe, Bell, Search, Car, Building,
  Users, MapPin, Tag, FileText, BarChart3, MessageCircle, Ticket
} from 'lucide-react';

const DashboardLayout = ({ role }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { 
        to: `/${role}`, 
        label: t('dashboard.title'), 
        icon: LayoutDashboard,
        exact: true
      },
      { 
        to: `/${role}/reservations`, 
        label: t('dashboard.reservations'), 
        icon: Calendar 
      },
    ];

    if (role === 'agent') {
      return [
        ...baseItems,
        { to: '/agent/commissions', label: t('dashboard.commissions'), icon: DollarSign },
        { to: '/agent/challenges', label: t('dashboard.challenges'), icon: Trophy },
        { to: '/agent/profile', label: t('dashboard.profile'), icon: User },
      ];
    }

    if (role === 'company') {
      return [
        ...baseItems,
        { to: '/company/drivers', label: i18n.language === 'fr' ? 'Conducteurs' : 'Drivers', icon: Users },
        { to: '/company/profile', label: t('dashboard.profile'), icon: Building },
      ];
    }

    if (role === 'influencer') {
      return [
        { to: '/influencer', label: t('dashboard.title'), icon: LayoutDashboard, exact: true },
        { to: '/influencer/codes', label: i18n.language === 'fr' ? 'Mes Codes' : 'My Codes', icon: Ticket },
        { to: '/influencer/profile', label: t('dashboard.profile'), icon: User },
      ];
    }

    if (role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { to: '/admin/reservations', label: 'Réservations', icon: Calendar },
        { to: '/admin/users', label: 'Utilisateurs', icon: Users },
        { to: '/admin/vehicles', label: 'Véhicules', icon: Car },
        { to: '/admin/agencies', label: 'Agences', icon: MapPin },
        { to: '/admin/pricing', label: 'Tarifs', icon: Tag },
        { to: '/admin/challenges', label: 'Challenges', icon: Trophy },
        { to: '/admin/blog', label: 'Blog', icon: FileText },
        { to: '/admin/events', label: 'Événements', icon: Calendar },
        { to: '/admin/stats', label: 'Statistiques', icon: BarChart3 },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid={`${role}-dashboard`}>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3D3A6B] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link to="/" className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
              alt="Auto Discount Location"
              className="h-10 w-auto"
            />
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F5A623] flex items-center justify-center text-black font-semibold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <Badge className="bg-[#F5A623] text-black text-xs capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${isActive(item) ? 'sidebar-link-active' : ''}`}
              data-testid={`nav-${item.to.split('/').pop()}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link to="/" className="sidebar-link">
            <Car className="h-5 w-5" />
            {i18n.language === 'fr' ? 'Retour au site' : 'Back to site'}
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="mobile-sidebar-toggle"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={i18n.language === 'fr' ? 'Rechercher...' : 'Search...'}
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#F5A623] rounded-full text-[10px] font-bold flex items-center justify-center text-black">
                3
              </span>
            </Button>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Globe className="h-4 w-4" />
                  <span className="uppercase">{i18n.language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#3D3A6B] flex items-center justify-center text-white text-sm font-medium">
                    {user?.first_name?.[0]}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${role}/profile`} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('dashboard.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/${role}/settings`} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {i18n.language === 'fr' ? 'Paramètres' : 'Settings'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
