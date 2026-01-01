import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Building, Globe, Star } from 'lucide-react';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(i18n.language === 'fr' ? 'Connexion réussie !' : 'Login successful!');
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'agent') navigate('/agent');
      else if (user.role === 'company') navigate('/company');
      else if (user.role === 'influencer') navigate('/influencer');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || (i18n.language === 'fr' ? 'Erreur de connexion' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3024008/pexels-photo-3024008.jpeg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <img 
            src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
            alt="Auto Discount Location"
            className="h-16 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">
            {i18n.language === 'fr' ? 'Bienvenue sur votre espace partenaire' : 'Welcome to your partner space'}
          </h1>
          <p className="text-lg text-slate-300">
            {i18n.language === 'fr' 
              ? 'Gérez vos réservations, suivez vos commissions et participez à nos challenges.'
              : 'Manage your bookings, track your commissions and participate in our challenges.'}
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="lg:hidden mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
                alt="Auto Discount Location"
                className="h-12 w-auto mx-auto"
              />
            </div>
            <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Connectez-vous à votre compte' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="login-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-[#3D3A6B] hover:underline">
                  {t('auth.forgot_password')}
                </Link>
              </div>

              <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="login-submit">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('auth.login')}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">{t('auth.no_account')} </span>
              <Link to="/register" className="text-[#F5A623] font-medium hover:underline" data-testid="goto-register">
                {t('auth.register')}
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
                ← {i18n.language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'agent';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: defaultRole,
    language: i18n.language
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(i18n.language === 'fr' ? 'Compte créé avec succès !' : 'Account created successfully!');
      
      // Redirect based on role
      if (user.role === 'agent') navigate('/agent');
      else if (user.role === 'company') navigate('/company');
      else if (user.role === 'influencer') navigate('/influencer');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || (i18n.language === 'fr' ? 'Erreur lors de l\'inscription' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'agent', label: t('auth.agent'), icon: Globe },
    { value: 'company', label: t('auth.company'), icon: Building },
    { value: 'influencer', label: t('auth.influencer'), icon: Star },
  ];

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <img 
            src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
            alt="Auto Discount Location"
            className="h-16 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">
            {i18n.language === 'fr' ? 'Rejoignez notre réseau de partenaires' : 'Join our partner network'}
          </h1>
          <ul className="space-y-3 text-lg text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#F5A623] rounded-full" />
              {i18n.language === 'fr' ? 'Commissions jusqu\'à 17%' : 'Up to 17% commissions'}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#F5A623] rounded-full" />
              {i18n.language === 'fr' ? 'Challenges et récompenses' : 'Challenges and rewards'}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#F5A623] rounded-full" />
              {i18n.language === 'fr' ? 'Support dédié 24/7' : '24/7 dedicated support'}
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="lg:hidden mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_634ba54c-5254-4232-8d61-233474b6274f/artifacts/hvaqrgsp_te%CC%81le%CC%81chargement.png" 
                alt="Auto Discount Location"
                className="h-12 w-auto mx-auto"
              />
            </div>
            <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Créez votre compte partenaire' : 'Create your partner account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t('auth.first_name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="first_name"
                      placeholder="John"
                      className="pl-10"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      data-testid="register-firstname"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t('auth.last_name')}</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    data-testid="register-lastname"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="register-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('auth.phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+590 690 XX XX XX"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="register-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    data-testid="register-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('auth.role')}</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger data-testid="register-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="register-submit">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('auth.register')}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">{t('auth.have_account')} </span>
              <Link to="/login" className="text-[#F5A623] font-medium hover:underline" data-testid="goto-login">
                {t('auth.login')}
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
                ← {i18n.language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { LoginPage, RegisterPage };
