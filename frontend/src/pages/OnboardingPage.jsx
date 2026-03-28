import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, ChevronRight, ChevronLeft,
  User, Building, Lock, Upload, FileText, ClipboardList, Mail,
  Globe, Star, Briefcase, AlertCircle, X
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const STEPS = [
  { id: 1, label: 'Type de compte', icon: User },
  { id: 2, label: 'Vos informations', icon: User },
  { id: 3, label: 'Votre entreprise', icon: Building },
  { id: 4, label: 'Accès plateforme', icon: Lock },
  { id: 5, label: 'Document KBIS', icon: Upload },
  { id: 6, label: 'Conditions', icon: FileText },
  { id: 7, label: 'Récapitulatif', icon: ClipboardList },
  { id: 8, label: 'Vérification email', icon: Mail },
];

const ROLE_OPTIONS = [
  { value: 'agent', label: 'Agence de voyages', description: 'Vous êtes une agence de voyages ou un tour-opérateur', icon: Globe },
  { value: 'company', label: 'Entreprise', description: 'Vous êtes une entreprise souhaitant louer des véhicules', icon: Briefcase },
  { value: 'influencer', label: 'Influenceur', description: 'Vous êtes un créateur de contenu ou influenceur', icon: Star },
];

export default function OnboardingPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    role: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    siret: '',
    address: '',
    city: '',
    country: 'France',
    email: '',
    password: '',
    password_confirm: '',
    kbis_file: null,
    kbis_name: '',
    accepted_cgu: false,
    accepted_privacy: false,
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // ---- Validation par étape ----
  const canNext = () => {
    switch (step) {
      case 1: return !!form.role;
      case 2: return form.first_name && form.last_name && form.phone;
      case 3: return form.company_name && (form.role === 'influencer' || form.siret);
      case 4: return form.email && form.password && form.password === form.password_confirm && form.password.length >= 8;
      case 5: return !!form.kbis_file;
      case 6: return form.accepted_cgu && form.accepted_privacy;
      case 7: return true;
      default: return false;
    }
  };

  // ---- Soumission finale (étape 7) ----
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Créer le compte
      const user = await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: form.role,
        company_name: form.company_name,
        siret: form.siret,
        address: form.address,
        city: form.city,
        country: form.country,
      });

      // 2. Uploader le KBIS
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', form.kbis_file);
      await axios.post(`${BACKEND_URL}/api/auth/upload-kbis`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setStep(8);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Format non accepté. Utilisez PDF, JPG ou PNG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop grand (max 10 Mo)');
      return;
    }
    set('kbis_file', file);
    set('kbis_name', file.name);
  };

  const handleResendVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/auth/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Email renvoyé !');
    } catch {
      toast.error('Erreur lors du renvoi');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#3D3A6B] py-4 px-6 flex items-center gap-3">
        <img src="/logo-auto-discount.png" alt="ADL" className="h-10 w-auto" />
        <span className="text-white font-semibold text-lg">Inscription partenaire</span>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b px-4 py-4 overflow-x-auto">
        <div className="flex items-center min-w-max mx-auto max-w-4xl">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                    ${done ? 'bg-green-500 border-green-500 text-white'
                      : active ? 'bg-[#3D3A6B] border-[#3D3A6B] text-white'
                      : 'bg-white border-slate-300 text-slate-400'}`}>
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-[#3D3A6B]' : done ? 'text-green-600' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mt-[-14px] ${done ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6">
        <Card className="w-full max-w-xl shadow-sm">
          <CardContent className="pt-6 pb-8 px-8">

            {/* ÉTAPE 1 — Type de compte */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Quel type de partenaire êtes-vous ?</h2>
                <p className="text-slate-500 text-sm">Sélectionnez votre profil pour adapter votre espace.</p>
                <div className="space-y-3 mt-4">
                  {ROLE_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => set('role', opt.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all
                          ${form.role === opt.value ? 'border-[#3D3A6B] bg-[#3D3A6B]/5' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${form.role === opt.value ? 'bg-[#3D3A6B] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{opt.label}</div>
                          <div className="text-sm text-slate-500">{opt.description}</div>
                        </div>
                        {form.role === opt.value && <CheckCircle2 className="ml-auto w-5 h-5 text-[#3D3A6B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ÉTAPE 2 — Informations personnelles */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Vos informations personnelles</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Prénom *</Label>
                    <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jean" />
                  </div>
                  <div className="space-y-1">
                    <Label>Nom *</Label>
                    <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Dupont" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Téléphone *</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+590 690 XX XX XX" type="tel" />
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — Informations entreprise */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Votre entreprise</h2>
                <div className="space-y-1">
                  <Label>Nom de l'entreprise / raison sociale *</Label>
                  <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Auto Voyages SARL" />
                </div>
                {form.role !== 'influencer' && (
                  <div className="space-y-1">
                    <Label>SIRET *</Label>
                    <Input value={form.siret} onChange={e => set('siret', e.target.value)} placeholder="123 456 789 00012" maxLength={17} />
                  </div>
                )}
                <div className="space-y-1">
                  <Label>Adresse</Label>
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="12 rue de la République" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Ville</Label>
                    <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Pointe-à-Pitre" />
                  </div>
                  <div className="space-y-1">
                    <Label>Pays</Label>
                    <Input value={form.country} onChange={e => set('country', e.target.value)} placeholder="France" />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 — Création du compte */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Créez vos accès</h2>
                <div className="space-y-1">
                  <Label>Adresse email *</Label>
                  <Input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="contact@votreentreprise.fr" />
                </div>
                <div className="space-y-1">
                  <Label>Mot de passe *</Label>
                  <Input value={form.password} onChange={e => set('password', e.target.value)} type="password" placeholder="8 caractères minimum" minLength={8} />
                  {form.password && form.password.length < 8 && (
                    <p className="text-xs text-red-500">Minimum 8 caractères</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Confirmer le mot de passe *</Label>
                  <Input value={form.password_confirm} onChange={e => set('password_confirm', e.target.value)} type="password" placeholder="Répétez le mot de passe" />
                  {form.password_confirm && form.password !== form.password_confirm && (
                    <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
            )}

            {/* ÉTAPE 5 — Upload KBIS */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Votre KBIS</h2>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Obligatoire</strong> — Le KBIS est requis pour accéder à la plateforme. Il doit dater de moins de 3 mois.
                  </p>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
                {!form.kbis_file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-[#3D3A6B] hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Upload className="w-10 h-10 text-slate-400" />
                    <span className="font-medium text-slate-600">Cliquez pour uploader votre KBIS</span>
                    <span className="text-sm text-slate-400">PDF, JPG, PNG — max 10 Mo</span>
                  </button>
                ) : (
                  <div className="border-2 border-green-400 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-800 truncate">{form.kbis_name}</p>
                      <p className="text-xs text-green-600">{(form.kbis_file.size / 1024).toFixed(0)} Ko</p>
                    </div>
                    <button onClick={() => { set('kbis_file', null); set('kbis_name', ''); }} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400">Votre document est sécurisé et uniquement accessible à l'équipe ADL.</p>
              </div>
            )}

            {/* ÉTAPE 6 — CGU */}
            {step === 6 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Conditions générales</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.accepted_cgu}
                      onChange={e => set('accepted_cgu', e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#3D3A6B]"
                    />
                    <span className="text-sm text-slate-700">
                      J'accepte les <span className="text-[#3D3A6B] underline cursor-pointer">Conditions Générales d'Utilisation</span> de la plateforme Auto Discount Location B2B. *
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.accepted_privacy}
                      onChange={e => set('accepted_privacy', e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#3D3A6B]"
                    />
                    <span className="text-sm text-slate-700">
                      J'accepte la <span className="text-[#3D3A6B] underline cursor-pointer">Politique de confidentialité</span> et le traitement de mes données personnelles conformément au RGPD. *
                    </span>
                  </label>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border text-sm text-slate-600">
                  En acceptant, vous confirmez que les informations fournies sont exactes et que vous avez l'autorité pour engager votre entreprise dans ce partenariat.
                </div>
              </div>
            )}

            {/* ÉTAPE 7 — Récapitulatif */}
            {step === 7 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Récapitulatif de votre dossier</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Type', value: ROLE_OPTIONS.find(r => r.value === form.role)?.label },
                    { label: 'Nom', value: `${form.first_name} ${form.last_name}` },
                    { label: 'Téléphone', value: form.phone },
                    { label: 'Email', value: form.email },
                    { label: 'Entreprise', value: form.company_name },
                    form.siret && { label: 'SIRET', value: form.siret },
                    form.city && { label: 'Ville', value: form.city },
                    { label: 'KBIS', value: form.kbis_name },
                  ].filter(Boolean).map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium text-slate-800 max-w-xs truncate text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  En soumettant, vous recevrez un email pour vérifier votre adresse. Votre dossier sera ensuite examiné par l'équipe ADL.
                </p>
              </div>
            )}

            {/* ÉTAPE 8 — Vérification email */}
            {step === 8 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-[#3D3A6B]/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-[#3D3A6B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Vérifiez votre email</h2>
                  <p className="text-slate-600 text-sm">
                    Un lien de vérification a été envoyé à <strong>{form.email}</strong>.
                    Cliquez dessus pour activer votre compte.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Prochaines étapes
                  </h3>
                  <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Vérifiez votre boîte mail (et vos spams)</li>
                    <li>Cliquez sur le lien de vérification</li>
                    <li>Votre dossier (avec KBIS) sera examiné par ADL</li>
                    <li>Vous recevrez un email d'approbation pour accéder à la plateforme</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleResendVerification}>
                    Renvoyer l'email de vérification
                  </Button>
                  <Button className="w-full btn-primary" onClick={() => navigate('/login')}>
                    Aller à la connexion
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {step < 8 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                  disabled={step === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Retour
                </Button>

                {step < 7 ? (
                  <Button
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canNext()}
                    className="btn-primary flex items-center gap-2"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !canNext()}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>Soumettre mon dossier <ChevronRight className="w-4 h-4" /></>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
