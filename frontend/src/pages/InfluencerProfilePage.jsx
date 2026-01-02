import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  User, Mail, Phone, Users, TrendingUp, Link2,
  Edit, Save, XCircle, Download, Instagram, Youtube,
  Calendar, DollarSign, Upload
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const InfluencerProfilePage = () => {
  const { i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    follower_count: '',
    content_category: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/influencers/dashboard`);
      const profileData = response.data.profile || {};
      setProfile(profileData);
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        instagram: profileData.social_media_platforms?.instagram || '',
        tiktok: profileData.social_media_platforms?.tiktok || '',
        youtube: profileData.social_media_platforms?.youtube || '',
        follower_count: profileData.follower_count || '',
        content_category: profileData.content_category || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API}/influencers/profile`, {
        ...formData,
        social_media_platforms: {
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          youtube: formData.youtube
        }
      });
      toast.success(i18n.language === 'fr' ? 'Profil mis à jour' : 'Profile updated');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating profile');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      instagram: profile?.social_media_platforms?.instagram || '',
      tiktok: profile?.social_media_platforms?.tiktok || '',
      youtube: profile?.social_media_platforms?.youtube || '',
      follower_count: profile?.follower_count || '',
      content_category: profile?.content_category || ''
    });
  };

  const handleUploadPhoto = () => {
    toast.info(i18n.language === 'fr' ? 'Upload photo en développement' : 'Photo upload in development');
  };

  // Mock payment history
  const paymentHistory = [
    { id: 1, date: '2024-01-31', amount: 2450, status: 'paid', period: 'Janvier 2024' },
    { id: 2, date: '2024-02-29', amount: 2890, status: 'paid', period: 'Février 2024' },
    { id: 3, date: '2024-03-31', amount: 3520, status: 'pending', period: 'Mars 2024' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getInitials = () => {
    const first = profile?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'IN';
  };

  return (
    <div className="space-y-6" data-testid="influencer-profile-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Mon profil' : 'My profile'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr' ? 'Gérez vos informations personnelles' : 'Manage your personal information'}
          </p>
        </div>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} data-testid="edit-btn">
            <Edit className="h-4 w-4 mr-2" />
            {i18n.language === 'fr' ? 'Modifier' : 'Edit'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} data-testid="cancel-btn">
              <XCircle className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} data-testid="save-btn">
              <Save className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Photo & Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-[#3D3A6B] text-white text-3xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={handleUploadPhoto}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-sm text-slate-500">{profile?.email}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">
                    {i18n.language === 'fr' ? 'Abonnés totaux' : 'Total followers'}
                  </p>
                  <p className="text-2xl font-bold text-[#3D3A6B]">
                    {profile?.follower_count?.toLocaleString() || '0'}
                  </p>
                </div>

                <div className="p-3 bg-[#F5A623]/10 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">
                    {i18n.language === 'fr' ? 'Taux de commission' : 'Commission rate'}
                  </p>
                  <p className="text-2xl font-bold text-[#F5A623]">
                    {profile?.commission_rate || 10}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {i18n.language === 'fr' ? 'Informations personnelles' : 'Personal information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  {i18n.language === 'fr' ? 'Prénom' : 'First name'}
                </Label>
                {editMode ? (
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    data-testid="first-name-input"
                  />
                ) : (
                  <p className="text-slate-800 font-medium">{profile?.first_name || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  {i18n.language === 'fr' ? 'Nom' : 'Last name'}
                </Label>
                {editMode ? (
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    data-testid="last-name-input"
                  />
                ) : (
                  <p className="text-slate-800 font-medium">{profile?.last_name || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {editMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="email-input"
                  />
                ) : (
                  <p className="text-slate-800 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    {profile?.email || '-'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {i18n.language === 'fr' ? 'Téléphone' : 'Phone'}
                </Label>
                {editMode ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="phone-input"
                  />
                ) : (
                  <p className="text-slate-800 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {profile?.phone || '-'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_category">
                  {i18n.language === 'fr' ? 'Catégorie de contenu' : 'Content category'}
                </Label>
                {editMode ? (
                  <Input
                    id="content_category"
                    value={formData.content_category}
                    onChange={(e) => setFormData({ ...formData, content_category: e.target.value })}
                    placeholder="Travel, Lifestyle, Tech..."
                    data-testid="content-category-input"
                  />
                ) : (
                  <p className="text-slate-800">{profile?.content_category || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="follower_count">
                  {i18n.language === 'fr' ? 'Nombre d\'abonnés' : 'Follower count'}
                </Label>
                {editMode ? (
                  <Input
                    id="follower_count"
                    type="number"
                    value={formData.follower_count}
                    onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })}
                    data-testid="follower-count-input"
                  />
                ) : (
                  <p className="text-slate-800 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    {profile?.follower_count?.toLocaleString() || '-'}
                  </p>
                )}
              </div>

              <Separator className="sm:col-span-2" />

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                {editMode ? (
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                    data-testid="instagram-input"
                  />
                ) : (
                  <p className="text-slate-800">
                    {profile?.social_media_platforms?.instagram || '-'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  TikTok
                </Label>
                {editMode ? (
                  <Input
                    id="tiktok"
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    placeholder="@username"
                    data-testid="tiktok-input"
                  />
                ) : (
                  <p className="text-slate-800">
                    {profile?.social_media_platforms?.tiktok || '-'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Label>
                {editMode ? (
                  <Input
                    id="youtube"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="Channel URL"
                    data-testid="youtube-input"
                  />
                ) : (
                  <p className="text-slate-800">
                    {profile?.social_media_platforms?.youtube || '-'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              {i18n.language === 'fr' ? 'Historique des paiements' : 'Payment history'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Vos commissions versées' : 'Your paid commissions'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export en développement')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="payment-history-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Période</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {payment.period}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {payment.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {payment.amount.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                        {payment.status === 'paid'
                          ? (i18n.language === 'fr' ? 'Payé' : 'Paid')
                          : (i18n.language === 'fr' ? 'En attente' : 'Pending')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerProfilePage;
