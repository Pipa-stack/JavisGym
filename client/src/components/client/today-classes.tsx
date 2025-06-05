import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { GymClass } from "@shared/schema";

export function TodayClasses() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: classes, isLoading } = useQuery<GymClass[]>({
    queryKey: ["/api/classes/today"],
  });

  const reservationMutation = useMutation({
    mutationFn: async (classId: number) => {
      if (!user) throw new Error("Usuario no autenticado");
      return apiRequest("POST", "/api/reservations", {
        userId: user.id,
        classId,
        status: "confirmed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes/today"] });
      toast({
        title: "Reserva confirmada",
        description: "Te has inscrito exitosamente en la clase.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error en la reserva",
        description: "No se pudo completar la reserva. Inténtalo de nuevo.",
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

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const end = new Date(endTime).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${start} - ${end}`;
  };

  const isClassFull = (gymClass: GymClass) => {
    return gymClass.currentEnrollment >= gymClass.capacity;
  };

  const canReserve = (gymClass: GymClass) => {
    const now = new Date();
    const classStart = new Date(gymClass.startTime);
    return classStart > now && !isClassFull(gymClass);
  };

  if (isLoading) {
    return (
      <Card className="gym-card mb-6">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 mr-4 w-12 h-12"></div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
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
      <Card className="gym-card mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Clases de Hoy</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No hay clases programadas para hoy
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gym-card mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">Clases de Hoy</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((gymClass) => (
            <div key={gymClass.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center flex-1">
                <div className={`${getClassTypeColor(gymClass.type)} rounded-lg p-3 mr-4 text-white`}>
                  <span className="text-lg">{getClassTypeIcon(gymClass.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{gymClass.name}</div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(gymClass.startTime, gymClass.endTime)}
                    </span>
                    <span>{gymClass.instructorName}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {gymClass.currentEnrollment}/{gymClass.capacity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {canReserve(gymClass) ? (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => reservationMutation.mutate(gymClass.id)}
                    disabled={reservationMutation.isPending}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Reservar
                  </Button>
                ) : isClassFull(gymClass) ? (
                  <Badge variant="secondary">Completa</Badge>
                ) : (
                  <Badge variant="outline">Finalizada</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
