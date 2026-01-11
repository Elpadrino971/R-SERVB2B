import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogPage = () => {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Conseils Voyage', 'Guides Pratiques', 'Témoignages', 'Actualités'];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog/posts`, {
        params: { status: 'published' }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3D3A6B] to-[#252240] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Conseils & Expériences
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Découvrez nos guides pratiques, conseils voyage et témoignages clients
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!selectedCategory ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className={!selectedCategory ? 'bg-[#F5A623] hover:bg-[#F5A623]/90 text-black' : ''}
            >
              Tous
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'bg-[#F5A623] hover:bg-[#F5A623]/90 text-black' : ''}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg">
              {searchQuery || selectedCategory
                ? 'Aucun article ne correspond à votre recherche'
                : 'Aucun article publié pour le moment'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded-t-xl flex items-center justify-center">
                  {post.featured_image ? (
                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover rounded-t-xl" />
                  ) : (
                    <div className="text-white text-6xl font-bold opacity-20">📝</div>
                  )}
                </div>
                <CardContent className="p-6">
                  {post.category && (
                    <Badge className="mb-3 bg-[#F5A623] text-black">{post.category}</Badge>
                  )}
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author || 'Auto Discount'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {post.created_at && format(new Date(post.created_at), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full group">
                    Lire plus
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;
