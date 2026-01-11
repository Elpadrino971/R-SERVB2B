import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  FileText, Search, Eye, CheckCircle, XCircle, Edit, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminBlogPage = () => {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const categories = [
    'Conseils de location',
    'Destinations',
    'Actualités',
    'Guides pratiques',
    'Témoignages'
  ];

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, categoryFilter, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${API}/blog/posts?${params}`);
      setPosts(response.data.posts || response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (postId, newStatus) => {
    try {
      await axios.put(`${API}/admin/blog/posts/${postId}/status`, {
        status: newStatus
      });
      toast.success(i18n.language === 'fr' ? 'Statut mis à jour' : 'Status updated');
      fetchPosts();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status');
    }
  };

  const approvePost = (postId) => {
    updatePostStatus(postId, 'published');
  };

  const rejectPost = (postId) => {
    if (window.confirm(i18n.language === 'fr' ? 'Rejeter cet article ?' : 'Reject this article?')) {
      updatePostStatus(postId, 'draft');
    }
  };

  const openPreview = (post) => {
    setSelectedPost(post);
    setPreviewDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'bg-slate-100 text-slate-800', icon: Edit, label: 'Brouillon' },
      pending: { class: 'bg-amber-100 text-amber-800', icon: Clock, label: 'En attente' },
      published: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Publié' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge className={config.class}>
        <Icon className="h-3 w-3 mr-1" />
        {i18n.language === 'fr' ? config.label : status}
      </Badge>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingPosts = posts.filter(p => p.status === 'pending');
  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');

  return (
    <div className="space-y-6" data-testid="admin-blog-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          {i18n.language === 'fr' ? 'Modération du Blog' : 'Blog Moderation'}
        </h1>
        <p className="text-slate-600">
          {i18n.language === 'fr'
            ? `${pendingPosts.length} en attente • ${publishedPosts.length} publiés • ${draftPosts.length} brouillons`
            : `${pendingPosts.length} pending • ${publishedPosts.length} published • ${draftPosts.length} drafts`}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={i18n.language === 'fr' ? 'Rechercher par titre...' : 'Search by title...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Tous statuts' : 'All statuses'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{i18n.language === 'fr' ? 'Tous statuts' : 'All statuses'}</SelectItem>
                <SelectItem value="draft">{i18n.language === 'fr' ? 'Brouillon' : 'Draft'}</SelectItem>
                <SelectItem value="pending">{i18n.language === 'fr' ? 'En attente' : 'Pending'}</SelectItem>
                <SelectItem value="published">{i18n.language === 'fr' ? 'Publié' : 'Published'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Toutes catégories' : 'All categories'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{i18n.language === 'fr' ? 'Toutes catégories' : 'All categories'}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Posts Alert */}
      {pendingPosts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800 font-medium">
                {i18n.language === 'fr'
                  ? `${pendingPosts.length} article(s) en attente de modération`
                  : `${pendingPosts.length} article(s) awaiting moderation`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="h-5 w-5 inline mr-2" />
            {i18n.language === 'fr' ? 'Articles' : 'Articles'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{i18n.language === 'fr' ? 'Titre' : 'Title'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Auteur' : 'Author'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Catégorie' : 'Category'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Date' : 'Date'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} data-testid={`post-row-${post.id}`}>
                    <TableCell className="font-medium max-w-md">
                      <div>
                        <p className="truncate">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-slate-500 truncate mt-1">{post.excerpt}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {post.author_name || post.author_email || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post.status)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(post.created_at || post.published_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreview(post)}
                          data-testid={`preview-btn-${post.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {post.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approvePost(post.id)}
                              data-testid={`approve-btn-${post.id}`}
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejectPost(post.id)}
                              data-testid={`reject-btn-${post.id}`}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {i18n.language === 'fr' ? 'Aucun article trouvé' : 'No articles found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="preview-dialog">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr' ? 'Par' : 'By'} {selectedPost?.author_name || selectedPost?.author_email} •{' '}
              {selectedPost?.created_at && new Date(selectedPost.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedPost.category}</Badge>
                {getStatusBadge(selectedPost.status)}
              </div>

              {selectedPost.featured_image && (
                <img
                  src={selectedPost.featured_image}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              {selectedPost.excerpt && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">
                    {i18n.language === 'fr' ? 'Extrait' : 'Excerpt'}
                  </h3>
                  <p className="text-slate-600 italic">{selectedPost.excerpt}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-slate-700 mb-2">
                  {i18n.language === 'fr' ? 'Contenu' : 'Content'}
                </h3>
                <div className="prose prose-sm max-w-none text-slate-600">
                  {selectedPost.content || (
                    <p className="text-slate-400 italic">
                      {i18n.language === 'fr' ? 'Aucun contenu' : 'No content'}
                    </p>
                  )}
                </div>
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">
                    {i18n.language === 'fr' ? 'Tags' : 'Tags'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedPost?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    rejectPost(selectedPost.id);
                    setPreviewDialogOpen(false);
                  }}
                  data-testid="reject-preview-btn"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {i18n.language === 'fr' ? 'Rejeter' : 'Reject'}
                </Button>
                <Button
                  onClick={() => {
                    approvePost(selectedPost.id);
                    setPreviewDialogOpen(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="approve-preview-btn"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {i18n.language === 'fr' ? 'Approuver' : 'Approve'}
                </Button>
              </>
            )}
            {selectedPost?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                {i18n.language === 'fr' ? 'Fermer' : 'Close'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogPage;
