import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

/** Construit l'objet user pour le frontend (format unifié API/Supabase) */
function buildUser(authUser, profile) {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    role: profile?.role ?? 'company',
    first_name: profile?.first_name ?? authUser.user_metadata?.first_name ?? '',
    last_name: profile?.last_name ?? authUser.user_metadata?.last_name ?? '',
    phone: profile?.phone ?? authUser.user_metadata?.phone ?? '',
    company_name: profile?.company_name ?? '',
  };
}

// Refresh toutes les 20h (JWT expire à 24h)
const REFRESH_INTERVAL_MS = 20 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const startRefreshTimer = () => {
    if (isSupabaseConfigured()) return; // Supabase gère ses propres tokens
    clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      try {
        const res = await axios.post(`${API}/auth/refresh`);
        const newToken = res.data.access_token;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } catch {
        // Token expiré ou invalide — déconnecter silencieusement
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      }
    }, REFRESH_INTERVAL_MS);
  };

  // Charger la session Supabase au démarrage
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('adl_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(buildUser(session.user, profile));
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('adl_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(buildUser(session.user, profile));
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
      });
      return () => subscription?.unsubscribe?.();
    } else if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`).then(res => {
        setUser(res.data);
        startRefreshTimer();
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => clearInterval(refreshTimerRef.current);
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile } = await supabase
        .from('adl_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      const u = buildUser(data.user, profile);
      setUser(u);
      setToken(data.session.access_token);
      return u;
    }
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    startRefreshTimer();
    return userData;
  };

  const register = async (userData) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role || 'company',
            phone: userData.phone,
          },
        },
      });
      if (error) throw error;
      // Le trigger adl_handle_new_user crée le profil avec role, first_name, last_name
      const { data: profile } = await supabase
        .from('adl_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      const u = buildUser(data.user, profile ?? { role: userData.role, first_name: userData.first_name, last_name: userData.last_name });
      setUser(u);
      setToken(data.session?.access_token ?? null);
      return u;
    }
    const response = await axios.post(`${API}/auth/register`, userData);
    const { access_token, user: newUser } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    clearInterval(refreshTimerRef.current);
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('adl_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setUser(buildUser({ id: user.id, email: user.email }, data));
      return data;
    }
    const response = await axios.put(`${API}/auth/profile`, updates);
    setUser(response.data);
    return response.data;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    isCompany: user?.role === 'company',
    isInfluencer: user?.role === 'influencer',
    useSupabase: isSupabaseConfigured(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
