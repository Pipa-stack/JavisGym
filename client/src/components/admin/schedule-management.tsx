import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GymClass } from "@shared/schema";

export function ScheduleManagement() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

  const { data: classes, isLoading } = useQuery<GymClass[]>({
    queryKey: ["/api/classes"],
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      return apiRequest("DELETE", `/api/classes/${classId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Clase eliminada",
        description: "La clase ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la clase.",
        variant: "destructive",
      });
    },
  });

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case "cardio":
        return "🏃";
      case "strength":
        return "🏋️";
      case "yoga":
        return "🧘";
      default:
        return "💪";
    }
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case "cardio":
        return "bg-accent text-accent-foreground";
      case "strength":
        return "bg-orange text-orange-foreground";
      case "yoga":
        return "bg-purple-500 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="gym-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 mr-4 w-12 h-12"></div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!classes?.length) {
    return (
      <Card className="gym-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Horarios</h3>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No hay clases programadas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gym-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Gestión de Horarios</h3>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Clase
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((gymClass) => (
            <div key={gymClass.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className={`${getClassTypeColor(gymClass.type)} rounded-lg p-3 mr-4 text-white`}>
                  <span className="text-lg">{getClassTypeIcon(gymClass.type)}</span>
                </div>
                <div>
                  <div className="font-medium">{gymClass.name}</div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(gymClass.startTime).toLocaleTimeString("es-ES", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })} - {new Date(gymClass.endTime).toLocaleTimeString("es-ES", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                    <span>{gymClass.instructorName}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-muted-foreground flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    {gymClass.currentEnrollment}/{gymClass.capacity} inscritos
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => setSelectedClass(gymClass)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={() => deleteClassMutation.mutate(gymClass.id)}
                  disabled={deleteClassMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
