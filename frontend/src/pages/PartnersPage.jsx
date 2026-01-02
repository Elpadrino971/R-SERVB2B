import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { toast } from 'sonner';
import { DollarSign, Users, TrendingUp, Award, Send, Star, CheckCircle, Headphones, BookOpen, Gift } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PartnersPage = () => {
  const [formData, setFormData] = useState({
    type: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    social_media: '',
    message: ''
  });

  const submitApplication = async () => {
    if (!formData.type || !formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Simulation - endpoint à créer
    toast.success('Candidature envoyée avec succès ! Notre équipe vous contactera sous 48h.');
    setFormData({
      type: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_name: '',
      social_media: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3D3A6B] to-[#252240] text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Devenez Partenaire</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Rejoignez notre réseau et générez des revenus supplémentaires en recommandant nos services
          </p>
          <Button
            onClick={() => document.getElementById('form').scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black font-semibold"
          >
            Rejoignez-nous maintenant
          </Button>
        </div>
      </div>

      {/* Partner Types */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Types de Partenariat</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-[#F5A623] transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Agents Locaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#F5A623] mb-2">Jusqu'à 15%</div>
                <p className="text-slate-600">de commission</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Recommandez vos clients et générez une commission sur chaque réservation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Accès à votre dashboard personnel</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Challenges réguliers avec bonus</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#F5A623] shadow-lg transform scale-105">
            <div className="bg-[#F5A623] text-black text-center py-2 font-semibold">
              <Star className="inline h-4 w-4 mr-1" />
              POPULAIRE
            </div>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Influenceurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#F5A623] mb-2">Jusqu'à 20%</div>
                <p className="text-slate-600">de commission</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Partagez votre code promo avec votre communauté</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Suivi en temps réel de vos conversions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Support marketing (visuels, contenus)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-[#F5A623] transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Entreprises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#F5A623] mb-2">Sur-mesure</div>
                <p className="text-slate-600">tarifs négociés</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Grilles tarifaires préférentielles selon volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Gestion centralisée des conducteurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Facturation mensuelle</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Advantages */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi devenir partenaire ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#F5A623] rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Commissions attractives</h3>
                <p className="text-slate-600">Jusqu'à 20% sur chaque réservation générée avec paiements mensuels garantis</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#3D3A6B] rounded-lg flex items-center justify-center flex-shrink-0">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Support dédié</h3>
                <p className="text-slate-600">Une équipe disponible pour vous accompagner dans votre développement</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Formation gratuite</h3>
                <p className="text-slate-600">Webinaires, workshops et ressources pour optimiser vos performances</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Challenges & bonus</h3>
                <p className="text-slate-600">Participez à des défis mensuels et gagnez des récompenses exclusives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div id="form" className="max-w-2xl mx-auto mb-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Candidature Partenaire</CardTitle>
              <p className="text-slate-600">Remplissez le formulaire et notre équipe vous contactera sous 48h</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Type de partenariat *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent Local</SelectItem>
                    <SelectItem value="influencer">Influenceur</SelectItem>
                    <SelectItem value="company">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Prénom *</Label>
                  <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              {formData.type === 'company' && (
                <div>
                  <Label>Nom de l'entreprise</Label>
                  <Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
                </div>
              )}

              {formData.type === 'influencer' && (
                <div>
                  <Label>Liens réseaux sociaux</Label>
                  <Input
                    placeholder="Instagram, TikTok, YouTube..."
                    value={formData.social_media}
                    onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Message (optionnel)</Label>
                <Textarea
                  rows={4}
                  placeholder="Parlez-nous de votre projet..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button onClick={submitApplication} className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-black">
                <Send className="mr-2 h-4 w-4" />
                Envoyer ma candidature
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Questions Fréquentes</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Comment sont calculées les commissions ?</AccordionTrigger>
              <AccordionContent>
                Les commissions sont calculées sur le montant hors taxes de chaque réservation. Elles sont versées le mois suivant la clôture effective du contrat client, après validation du retour du véhicule.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Quand reçois-je mes paiements ?</AccordionTrigger>
              <AccordionContent>
                Les paiements sont effectués mensuellement, le 15 du mois suivant. Vous recevez un récapitulatif détaillé par email avec le montant et les réservations concernées.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Y a-t-il un engagement minimum ?</AccordionTrigger>
              <AccordionContent>
                Non, il n'y a aucun engagement. Vous êtes libre de générer autant ou aussi peu de réservations que vous le souhaitez. Votre compte reste actif tant que vous l'utilisez.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Quels outils marketing recevrai-je ?</AccordionTrigger>
              <AccordionContent>
                Vous aurez accès à une bibliothèque complète : logos, bannières, templates de posts, codes promo personnalisés, landing pages, et supports de formation. Un kit digital complet pour maximiser vos conversions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Puis-je devenir partenaire si je suis à l'étranger ?</AccordionTrigger>
              <AccordionContent>
                Oui ! Notre programme est ouvert internationalement. Les commissions sont versées par virement SEPA ou PayPal selon votre préférence et localisation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-[#3D3A6B] to-[#252240] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de partenaires qui génèrent déjà des revenus avec Auto Discount
          </p>
          <Button
            onClick={() => document.getElementById('form').scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black font-semibold"
          >
            Devenir partenaire maintenant
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartnersPage;
