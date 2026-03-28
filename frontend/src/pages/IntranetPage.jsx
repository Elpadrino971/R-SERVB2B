import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  FileText, Download, ExternalLink, Calendar, Users,
  TrendingUp, Award, FileCheck, BookOpen, Video,
  Bell, Star, ChevronRight, Search, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const IntranetPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchIntranetData();
  }, [isAuthenticated, navigate]);

  const fetchIntranetData = async () => {
    try {
      setLoading(true);
      const [announcementsRes, documentsRes, trainingsRes] = await Promise.all([
        axios.get(`${API}/intranet/announcements`),
        axios.get(`${API}/intranet/documents`),
        axios.get(`${API}/intranet/trainings`),
      ]);

      setAnnouncements(announcementsRes.data.announcements || []);
      setDocuments(documentsRes.data.documents || []);
      setTrainings(trainingsRes.data.trainings || []);
    } catch (error) {
      console.error('Error fetching intranet data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (docId, filename) => {
    try {
      const response = await axios.get(`${API}/intranet/documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Document téléchargé');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3D3A6B] to-[#5B5891] text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Intranet Partenaires</h1>
              <p className="text-white/90 text-lg">
                Bienvenue {user?.first_name} ! Accédez à toutes vos ressources professionnelles
              </p>
            </div>
            <div className="hidden md:block">
              <Badge className="bg-[#F5A623] text-gray-900 px-4 py-2 text-sm">
                {user?.role === 'agent' && '🏆 Agent Partenaire'}
                {user?.role === 'company' && '🏢 Entreprise'}
                {user?.role === 'influencer' && '⭐ Influenceur'}
                {user?.role === 'admin' && '👑 Administrateur'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Actualités
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="trainings" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Formations
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main announcements */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Dernières actualités</h2>

                {announcements.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune actualité pour le moment</p>
                    </CardContent>
                  </Card>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}>
                                {announcement.priority === 'high' && '⚠️ Important'}
                                {announcement.priority === 'medium' && '📢 Info'}
                                {announcement.priority === 'low' && '💡 Astuce'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(new Date(announcement.created_at), 'PPP', { locale: fr })}
                              </span>
                            </div>
                            <CardTitle className="text-xl">{announcement.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                        {announcement.link && (
                          <Button
                            variant="link"
                            className="mt-3 p-0 h-auto text-[#3D3A6B]"
                            onClick={() => window.open(announcement.link, '_blank')}
                          >
                            En savoir plus
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Sidebar - Quick Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Vos statistiques</h3>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ce mois-ci</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-xs text-gray-500">réservations</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Award className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Commissions</p>
                            <p className="text-2xl font-bold text-gray-900">0 €</p>
                            <p className="text-xs text-gray-500">ce mois-ci</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Star className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Niveau</p>
                            <p className="text-xl font-bold text-gray-900">Partenaire</p>
                            <p className="text-xs text-gray-500">Bronze</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        if (user?.role === 'agent') navigate('/agent');
                        else if (user?.role === 'company') navigate('/company');
                        else if (user?.role === 'influencer') navigate('/influencer');
                      }}
                    >
                      Voir mon dashboard
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#3D3A6B] to-[#5B5891] text-white">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Besoin d'aide ?</h4>
                    <p className="text-sm text-white/90 mb-4">
                      Notre équipe est disponible pour vous accompagner
                    </p>
                    <Button variant="secondary" className="w-full">
                      Contacter le support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D3A6B]"
              >
                <option value="all">Toutes catégories</option>
                <option value="contracts">Contrats</option>
                <option value="guides">Guides</option>
                <option value="marketing">Marketing</option>
                <option value="legal">Juridique</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun document trouvé</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {doc.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{doc.size || '0 KB'}</span>
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => downloadDocument(doc.id, doc.filename)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Trainings Tab */}
          <TabsContent value="trainings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Formations disponibles</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune formation disponible pour le moment</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                trainings.map((training) => (
                  <Card key={training.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-5 w-5 text-[#3D3A6B]" />
                        <Badge variant="secondary">{training.duration || '30 min'}</Badge>
                      </div>
                      <CardTitle>{training.title}</CardTitle>
                      <CardDescription>{training.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium">{training.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#F5A623] h-2 rounded-full transition-all"
                            style={{ width: `${training.progress || 0}%` }}
                          />
                        </div>
                        <Button className="w-full mt-4">
                          {training.progress > 0 ? 'Continuer' : 'Commencer'}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntranetPage;
