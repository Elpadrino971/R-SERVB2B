import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien invalide.');
      return;
    }
    axios.get(`${BACKEND_URL}/api/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Email vérifié !');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Lien invalide ou expiré.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center space-y-6">
        <img src="/logo-auto-discount.png" alt="ADL" className="h-12 mx-auto" />

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#3D3A6B] mx-auto animate-spin" />
            <p className="text-slate-600">Vérification en cours...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Email vérifié !</h2>
              <p className="text-slate-600 text-sm">
                Votre email est confirmé. Votre dossier (KBIS inclus) est maintenant en cours d'examen par l'équipe ADL.
                Vous recevrez un email d'approbation sous 24–48h.
              </p>
            </div>
            <Button className="btn-primary w-full" onClick={() => navigate('/login')}>
              Aller à la connexion
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Lien invalide</h2>
              <p className="text-slate-600 text-sm">{message}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
              Recommencer l'inscription
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
