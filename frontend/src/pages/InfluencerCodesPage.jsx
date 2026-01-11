import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Code2, Sparkles, AlertCircle, Plus, Edit, BarChart3, Power
} from 'lucide-react';

const InfluencerCodesPage = () => {
  const { i18n } = useTranslation();

  return (
    <div className="space-y-6" data-testid="influencer-codes-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Gestion des codes promo' : 'Promo codes management'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr' ? 'Créez et gérez vos codes promotionnels' : 'Create and manage your promo codes'}
          </p>
        </div>
        <Button disabled className="btn-primary opacity-50 cursor-not-allowed">
          <Plus className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Créer code' : 'Create code'}
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-[#F5A623] bg-gradient-to-br from-white to-amber-50">
        <CardContent className="p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="h-24 w-24 rounded-full bg-[#F5A623]/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-12 w-12 text-[#F5A623]" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {i18n.language === 'fr' ? 'Fonctionnalité en cours de développement' : 'Feature in development'}
              </h2>
              <p className="text-lg text-slate-600">
                {i18n.language === 'fr'
                  ? 'La gestion complète des codes promo sera bientôt disponible !'
                  : 'Full promo code management will be available soon!'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-100 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                {i18n.language === 'fr'
                  ? 'Les endpoints backend pour les codes promo ne sont pas encore implémentés'
                  : 'Backend endpoints for promo codes are not yet implemented'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#3D3A6B]" />
              {i18n.language === 'fr' ? 'Fonctionnalités à venir' : 'Upcoming features'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Ce qui sera disponible prochainement' : 'What will be available soon'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <Plus className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">
                    {i18n.language === 'fr' ? 'Créer des codes personnalisés' : 'Create custom codes'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {i18n.language === 'fr'
                      ? 'Générez vos propres codes avec remise pourcentage ou fixe'
                      : 'Generate your own codes with percentage or fixed discount'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">
                    {i18n.language === 'fr' ? 'Statistiques détaillées' : 'Detailed statistics'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {i18n.language === 'fr'
                      ? 'Suivez les performances de chaque code en temps réel'
                      : 'Track each code performance in real-time'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <Power className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">
                    {i18n.language === 'fr' ? 'Activer / Désactiver' : 'Activate / Deactivate'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {i18n.language === 'fr'
                      ? 'Contrôlez la disponibilité de vos codes instantanément'
                      : 'Control your codes availability instantly'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <Edit className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">
                    {i18n.language === 'fr' ? 'Modifier les paramètres' : 'Edit settings'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {i18n.language === 'fr'
                      ? 'Ajustez les remises, dates de validité et limites d\'utilisation'
                      : 'Adjust discounts, validity dates and usage limits'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Table Structure */}
        <Card>
          <CardHeader>
            <CardTitle>
              {i18n.language === 'fr' ? 'Aperçu de l\'interface' : 'Interface preview'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Structure prévue du tableau' : 'Planned table structure'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full opacity-50">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Valeur</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Utilisations</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-[#3D3A6B]">INFLUENCER10</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">Percentage</td>
                    <td className="py-3 px-4 text-sm font-semibold">-10%</td>
                    <td className="py-3 px-4 text-sm text-slate-600">45 / 100</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-emerald-100 text-emerald-800">Actif</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-[#3D3A6B]">SUMMER2024</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">Fixed</td>
                    <td className="py-3 px-4 text-sm font-semibold">-50 €</td>
                    <td className="py-3 px-4 text-sm text-slate-600">32 / 50</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-emerald-100 text-emerald-800">Actif</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-[#3D3A6B]">SPECIAL15</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">Percentage</td>
                    <td className="py-3 px-4 text-sm font-semibold">-15%</td>
                    <td className="py-3 px-4 text-sm text-slate-600">28 / ∞</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-slate-200 text-slate-700">Inactif</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Endpoints Documentation */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-blue-900">
            {i18n.language === 'fr' ? 'Endpoints API prévus' : 'Planned API endpoints'}
          </CardTitle>
          <CardDescription className="text-blue-700">
            {i18n.language === 'fr'
              ? 'Ces endpoints seront implémentés dans le backend'
              : 'These endpoints will be implemented in the backend'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-200">
              <Badge className="bg-emerald-100 text-emerald-800">GET</Badge>
              <code className="text-slate-700">/api/influencers/codes</code>
              <span className="text-slate-500 ml-auto">Liste des codes</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-200">
              <Badge className="bg-blue-100 text-blue-800">POST</Badge>
              <code className="text-slate-700">/api/influencers/codes</code>
              <span className="text-slate-500 ml-auto">Créer un code</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-200">
              <Badge className="bg-amber-100 text-amber-800">PATCH</Badge>
              <code className="text-slate-700">/api/influencers/codes/:id</code>
              <span className="text-slate-500 ml-auto">Modifier un code</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-200">
              <Badge className="bg-amber-100 text-amber-800">PATCH</Badge>
              <code className="text-slate-700">/api/influencers/codes/:id/toggle</code>
              <span className="text-slate-500 ml-auto">Activer/Désactiver</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-200">
              <Badge className="bg-emerald-100 text-emerald-800">GET</Badge>
              <code className="text-slate-700">/api/influencers/codes/:id/stats</code>
              <span className="text-slate-500 ml-auto">Statistiques détaillées</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/*
        COMMENTED OUT: Future implementation when backend is ready

        Structure will include:
        - Table with columns: Code, Type remise, Valeur, Validité, Utilisations, Statut, Actions
        - Create modal with fields:
          * code (unique text)
          * discount_type (percentage, fixed)
          * discount_value (number)
          * valid_from (date)
          * valid_until (date)
          * max_uses (number, optional)
        - Actions: Activate/Deactivate, Edit, View detailed stats
        - Filters: status (active/inactive), type (percentage/fixed)
      */}
    </div>
  );
};

export default InfluencerCodesPage;
