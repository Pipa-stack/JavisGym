import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, CheckCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

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

export function SocialFeed() {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const { data: posts, isLoading } = useQuery<SocialPostWithAuthor[]>({
    queryKey: ["/api/social/posts"],
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

    if (diffHours < 1) {
      return "Hace unos minutos";
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
  };

  const handleLike = (postId: number) => {
    if (!likedPosts.has(postId)) {
      likeMutation.mutate(postId);
    }
  };

  if (isLoading) {
    return (
      <Card className="gym-card mb-6">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-full"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="flex space-x-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="gym-card mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Feed Social</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No hay publicaciones aún
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gym-card mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">Feed Social</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-center mb-3">
                <img
                  src={post.author?.profileImage || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                  alt={post.author?.fullName || "Usuario"}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <div className="font-medium flex items-center">
                    <span>{post.author?.fullName || "Usuario desconocido"}</span>
                    {post.author?.isAdmin && (
                      <CheckCircle className="w-4 h-4 text-blue-500 ml-1" title="Entrenador Verificado" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground">
                    {formatTimeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-800 dark:text-foreground mb-3">{post.content}</p>
              
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              
              <div className="flex items-center justify-between">
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
