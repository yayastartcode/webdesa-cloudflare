"use client";
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { usePendingUploads } from '@/lib/upload';

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/navigation";
import type { Session } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
}

interface PostForm {
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
}

export default function PostsPage() {
  const { isUploading, onUploadStateChange } = usePendingUploads();
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newForm, setNewForm] = useState<PostForm>({
    title: "",
    content: "",
    imageUrl: "",
    published: false
  });
  const [editForm, setEditForm] = useState<PostForm>({
    title: "",
    content: "",
    imageUrl: "",
    published: false
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || !session.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchPosts();
  }, [session, status, router]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/posts?admin=true&limit=100");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      } else {
        setError("Gagal memuat data berita");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Gagal memuat data berita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = async () => {
    if (isUploading) return;
    if (!newForm.title || !newForm.content) {
      setError("Judul dan konten harus diisi");
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newForm),
      });

      if (response.ok) {
        setMessage(newForm.published ? "Berita berhasil dipublikasikan" : "Draft berita berhasil disimpan");
        setNewForm({ title: "", content: "", imageUrl: "", published: false });
        setIsAdding(false);
        fetchPosts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal menambahkan berita");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      setError("Gagal menambahkan berita");
    }
  };

  const handleEditPost = async () => {
    if (isUploading) return;
    if (!editForm.title || !editForm.content || !editingPost) {
      setError("Judul dan konten harus diisi");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setMessage(editForm.published ? "Berita berhasil dipublikasikan" : "Draft berita berhasil disimpan");
        setEditingPost(null);
        setEditForm({ title: "", content: "", imageUrl: "", published: false });
        fetchPosts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal memperbarui berita");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Gagal memperbarui berita");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Berita berhasil dihapus");
        fetchPosts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal menghapus berita");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Gagal menghapus berita");
    }
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || "",
      published: post.published
    });
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditForm({ title: "", content: "", imageUrl: "", published: false });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewForm({ title: "", content: "", imageUrl: "", published: false });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kelola Berita Desa
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Tambah, edit, dan kelola berita desa
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsAdding(true);
              setNewForm({ title: "", content: "", imageUrl: "", published: false });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Berita
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add Post Form */}
        {isAdding && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Tambah Berita Baru</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Isi form di bawah untuk menambahkan berita baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Judul Berita</Label>
                <Input
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  placeholder="Masukkan judul berita"
                  className="text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Konten Berita</Label>
                <RichTextEditor
                  value={newForm.content}
                  onChange={content => setNewForm(current => ({ ...current, content }))}
                  onUploadStateChange={onUploadStateChange}
                  placeholder="Masukkan konten berita"
                  className="mt-1"
                />
              </div>
              <ImageUploadField label="Gambar berita" value={newForm.imageUrl}
                onChange={url => setNewForm(current => ({ ...current, imageUrl: url }))}
                onUploadStateChange={onUploadStateChange} />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newForm.published}
                  onCheckedChange={(checked: boolean) => setNewForm({ ...newForm, published: checked })}
                />
                <Label className="text-black dark:text-white">Publikasikan berita</Label>
              </div>
              <div className="flex space-x-2">
                <Button disabled={isUploading} onClick={handleAddPost} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Simpan Berita
                </Button>
                <Button variant="outline" disabled={isUploading} onClick={cancelAdd}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Post Form */}
        {editingPost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Edit Berita</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Edit berita: {editingPost.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Judul Berita</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Masukkan judul berita"
                  className="text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Konten Berita</Label>
                <RichTextEditor
                  value={editForm.content}
                  onChange={content => setEditForm(current => ({ ...current, content }))}
                  onUploadStateChange={onUploadStateChange}
                  placeholder="Masukkan konten berita"
                  className="mt-1"
                />
              </div>
              <ImageUploadField label="Gambar berita" value={editForm.imageUrl}
                onChange={url => setEditForm(current => ({ ...current, imageUrl: url }))}
                onUploadStateChange={onUploadStateChange} />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.published}
                  onCheckedChange={(checked: boolean) => setEditForm({ ...editForm, published: checked })}
                />
                <Label className="text-black dark:text-white">Publikasikan berita</Label>
              </div>
              <div className="flex space-x-2">
                <Button disabled={isUploading} onClick={handleEditPost} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Simpan Perubahan
                </Button>
                <Button variant="outline" disabled={isUploading} onClick={cancelEdit}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Daftar Berita</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Total: {posts.length} berita
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Belum ada berita yang ditambahkan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {post.title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {post.published ? (
                              <>
                                <Eye className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">Dipublikasi</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-400 font-medium">Draft</span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Oleh: {post.author.name} • {new Date(post.createdAt).toLocaleDateString('id-ID')}
                        </div>
                        {post.imageUrl && (
                          <div className="mt-2">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Edit ${post.title}`}
                          onClick={() => startEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label={`Hapus ${post.title}`}
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
