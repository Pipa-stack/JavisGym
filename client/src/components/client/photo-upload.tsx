import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUploadProps {
  onClose: () => void;
}

export function PhotoUpload({ onClose }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: { caption: string; imageUrl: string }) => {
      return apiRequest("/api/social/posts", "POST", {
        content: data.caption,
        imageUrl: data.imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      toast({
        title: "Foto subida",
        description: "Tu foto se ha compartido exitosamente",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir la foto",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona una foto",
        variant: "destructive",
      });
      return;
    }

    // For demonstration, we'll use a placeholder image URL
    // In a real app, you'd upload to a file storage service
    const imageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
    
    uploadMutation.mutate({
      caption: caption || "Nueva foto desde el gimnasio 💪",
      imageUrl,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Subir Foto
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-lg mx-auto"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                Cambiar foto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                  Selecciona una foto para compartir
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Elegir archivo</span>
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Descripción (opcional)</label>
          <Textarea
            placeholder="Escribe algo sobre tu entrenamiento..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className="w-full"
        >
          {uploadMutation.isPending ? "Subiendo..." : "Compartir foto"}
        </Button>
      </CardContent>
    </Card>
  );
}