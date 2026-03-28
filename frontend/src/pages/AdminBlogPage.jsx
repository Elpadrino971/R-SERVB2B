import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  FileText, Search, Eye, CheckCircle, XCircle, Edit, Clock,
  Plus, Trash2, Upload, Image, Video, X, Save,
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  'Conseils de location',
  'Destinations',
  'Actualités',
  'Guides pratiques',
  'Témoignages',
  'Conseils Voyage',
];

const EMPTY_FORM = {
  title: '',
  category: '',
  excerpt: '',
  content: '',
  featured_image: '',
  video_url: '',
  tags: '',
  status: 'published',
};

const StatusBadge = ({ status }) => {
  const cfg = {
    draft:     { cls: 'bg-slate-100 text-slate-800',   icon: Edit,         label: 'Brouillon' },
    pending:   { cls: 'bg-amber-100 text-amber-800',   icon: Clock,        label: 'En attente' },
    published: { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Publié' },
  };
  const { cls, icon: Icon, label } = cfg[status] || cfg.draft;
  return (
    <Badge className={cls}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

const AdminBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // null = create, object = edit

  // form
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // upload
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef();
  const videoInputRef = useRef();

  useEffect(() => { fetchPosts(); }, [statusFilter, categoryFilter, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
        limit: 100,
      };
      const res = await axios.get(`${API}/blog/posts`, { params });
      setPosts(res.data.posts || res.data || []);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ---------- form helpers ----------
  const openCreate = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      category: post.category || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      video_url: post.video_url || '',
      tags: (post.tags || []).join(', '),
      status: post.status || 'published',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Le titre est obligatoire'); return; }
    if (!form.content.trim()) { toast.error('Le contenu est obligatoire'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editingPost) {
        await axios.put(`${API}/admin/blog/posts/${editingPost.id}`, payload);
        toast.success('Article mis à jour');
      } else {
        await axios.post(`${API}/admin/blog/posts`, payload);
        toast.success('Article créé');
      }
      setFormOpen(false);
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Supprimer l'article "${post.title}" ?`)) return;
    try {
      await axios.delete(`${API}/admin/blog/posts/${post.id}`);
      toast.success('Article supprimé');
      fetchPosts();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const updateStatus = async (postId, newStatus) => {
    try {
      await axios.put(`${API}/admin/blog/posts/${postId}/status`, newStatus, {
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success('Statut mis à jour');
      fetchPosts();
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // ---------- media upload ----------
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API}/upload/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setForm(f => ({ ...f, featured_image: url }));
    e.target.value = '';
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setForm(f => ({ ...f, video_url: url }));
    e.target.value = '';
  };

  // ---------- counts ----------
  const pending   = posts.filter(p => p.status === 'pending').length;
  const published = posts.filter(p => p.status === 'published').length;
  const drafts    = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Gestion du Blog</h1>
          <p className="text-slate-600 mt-1">
            {pending} en attente · {published} publiés · {drafts} brouillons
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-amber-800 font-medium">
              {pending} article(s) en attente de modération
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par titre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div>
                          <p className="truncate">{post.title}</p>
                          {post.excerpt && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{post.excerpt}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.category && (
                          <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {post.author || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={post.status} />
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {post.created_at
                          ? new Date(post.created_at).toLocaleDateString('fr-FR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" title="Aperçu" onClick={() => setPreviewPost(post)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Modifier" onClick={() => openEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {post.status === 'pending' && (
                            <Button
                              variant="ghost" size="sm" title="Approuver"
                              onClick={() => updateStatus(post.id, 'published')}
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          {post.status === 'published' && (
                            <Button
                              variant="ghost" size="sm" title="Dépublier"
                              onClick={() => updateStatus(post.id, 'draft')}
                            >
                              <XCircle className="h-4 w-4 text-amber-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost" size="sm" title="Supprimer"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                        Aucun article trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======= Create / Edit dialog ======= */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Titre de l'article"
              />
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <Select
                  value={form.category || 'none'}
                  onValueChange={v => setForm(f => ({ ...f, category: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Aucune —</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <Select
                  value={form.status}
                  onValueChange={v => setForm(f => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-1">Extrait / Résumé</label>
              <Textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Courte description affichée dans la liste..."
                rows={2}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1">Contenu *</label>
              <Textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Contenu complet de l'article..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
              <Input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="location, voiture, martinique, ..."
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Image className="h-4 w-4 inline mr-1" />
                Image à la une
              </label>
              <div className="flex gap-2 items-start">
                <Input
                  value={form.featured_image}
                  onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
                  placeholder="URL ou téléversez un fichier →"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploading ? 'Upload...' : 'Upload'}
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {form.featured_image && (
                <div className="mt-2 relative w-48">
                  <img
                    src={form.featured_image}
                    alt="preview"
                    className="rounded-lg object-cover w-48 h-28"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, featured_image: '' }))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Video upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Video className="h-4 w-4 inline mr-1" />
                Vidéo (URL YouTube/Vimeo ou fichier)
              </label>
              <div className="flex gap-2">
                <Input
                  value={form.video_url}
                  onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://youtube.com/... ou téléversez →"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploading ? 'Upload...' : 'Upload'}
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
              </div>
              {form.video_url && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <Video className="h-4 w-4 text-[#3D3A6B]" />
                  <span className="truncate max-w-xs">{form.video_url}</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, video_url: '' }))}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : editingPost ? 'Mettre à jour' : 'Créer l\'article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======= Preview dialog ======= */}
      {previewPost && (
        <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewPost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                {previewPost.category && (
                  <Badge variant="outline">{previewPost.category}</Badge>
                )}
                <StatusBadge status={previewPost.status} />
                {previewPost.author && (
                  <span className="text-sm text-slate-500">Par {previewPost.author}</span>
                )}
              </div>

              {previewPost.featured_image && (
                <img
                  src={previewPost.featured_image}
                  alt={previewPost.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              {previewPost.video_url && (
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  {previewPost.video_url.includes('youtube') || previewPost.video_url.includes('youtu.be') || previewPost.video_url.includes('vimeo') ? (
                    <iframe
                      src={previewPost.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title="video"
                    />
                  ) : (
                    <video src={previewPost.video_url} controls className="w-full h-full" />
                  )}
                </div>
              )}

              {previewPost.excerpt && (
                <p className="text-slate-600 italic border-l-4 border-[#F5A623] pl-4">
                  {previewPost.excerpt}
                </p>
              )}

              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {previewPost.content || <span className="text-slate-400 italic">Aucun contenu</span>}
              </div>

              {previewPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {previewPost.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              {previewPost.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => { updateStatus(previewPost.id, 'draft'); setPreviewPost(null); }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => { updateStatus(previewPost.id, 'published'); setPreviewPost(null); }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setPreviewPost(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminBlogPage;
