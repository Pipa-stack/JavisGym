import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, CheckCircle, Plus, Camera, Users, Trophy } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SocialPostWithAuthor {
  id: number;
  content: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    profileImage: string | null;
    isAdmin: boolean;
  } | null;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const { data: posts, isLoading } = useQuery<SocialPostWithAuthor[]>({
    queryKey: ["/api/social/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; imageUrl?: string }) => {
      if (!user) throw new Error("Usuario no autenticado");
      return apiRequest("POST", "/api/social/posts", {
        userId: user.id,
        content: postData.content,
        imageUrl: postData.imageUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      toast({
        title: "Publicación creada",
        description: "Tu post ha sido publicado exitosamente.",
      });
      setNewPostContent("");
      setIsCreateOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la publicación.",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("POST", `/api/social/posts/${postId}/like`);
    },
    onSuccess: (_, postId) => {
      setLikedPosts(prev => new Set([...prev, postId]));
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
    },
  });

  const formatTimeAgo = (date: string) => {
    const postDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) return "Hace unos minutos";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  const handleLike = (postId: number) => {
    if (!likedPosts.has(postId)) {
      likeMutation.mutate(postId);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate({ content: newPostContent.trim() });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="flex">
          <Sidebar variant="client" />
          <main className="flex-1 p-4 pb-20 md:pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar variant="client" />
        
        <main className="flex-1 p-4 pb-20 md:pb-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                Comunidad
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground">
                Conecta con otros miembros del gimnasio
              </p>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="gym-card">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">150+</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">Miembros Activos</p>
                </CardContent>
              </Card>
              <Card className="gym-card">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">{posts?.length || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">Publicaciones</p>
                </CardContent>
              </Card>
              <Card className="gym-card">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-orange mx-auto mb-2" />
                  <p className="text-2xl font-bold">25</p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">Logros Compartidos</p>
                </CardContent>
              </Card>
            </div>

            {/* Create Post */}
            <Card className="gym-card mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Compartir con la comunidad</h3>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Publicación
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Crear Publicación</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="content">¿Qué quieres compartir?</Label>
                          <Textarea
                            id="content"
                            placeholder="Comparte tu progreso, logros o motiva a otros..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || createPostMutation.isPending}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user?.profileImage || undefined} />
                    <AvatarFallback>
                      {user?.fullName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="¿Qué quieres compartir con la comunidad?"
                    onClick={() => setIsCreateOpen(true)}
                    className="cursor-pointer"
                    readOnly
                  />
                  <Button variant="ghost" size="sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {!posts?.length ? (
                <Card className="gym-card">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
                      No hay publicaciones aún
                    </h3>
                    <p className="text-gray-500 dark:text-muted-foreground mb-4">
                      Sé el primero en compartir tu progreso con la comunidad
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Publicación
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="gym-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={post.author?.profileImage || undefined} />
                          <AvatarFallback>
                            {post.author?.fullName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-semibold">{post.author?.fullName || "Usuario"}</h4>
                            {post.author?.isAdmin && (
                              <CheckCircle className="w-4 h-4 text-blue-500 ml-1" title="Entrenador Verificado" />
                            )}
                            <Badge variant="secondary" className="ml-2">Miembro</Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-800 dark:text-foreground mb-4 whitespace-pre-wrap">
                        {post.content}
                      </p>
                      
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="Post content"
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center ${
                              likedPosts.has(post.id) 
                                ? "text-red-500 hover:text-red-600" 
                                : "text-gray-500 hover:text-red-500"
                            }`}
                            onClick={() => handleLike(post.id)}
                            disabled={likeMutation.isPending}
                          >
                            <Heart 
                              className={`w-4 h-4 mr-1 ${likedPosts.has(post.id) ? "fill-current" : ""}`} 
                            />
                            <span>{post.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center text-gray-500 hover:text-blue-500"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span>{post.comments}</span>
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-muted-foreground">
                          {post.likes + post.comments} interacciones
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}