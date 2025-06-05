import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import type { GymClass } from "@shared/schema";

interface ClassReservationProps {
  onClose: () => void;
}

export function ClassReservation({ onClose }: ClassReservationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["/api/classes/today"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: userReservations = [] } = useQuery({
    queryKey: ["/api/reservations/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const reservationMutation = useMutation({
    mutationFn: async (classId: number) => {
      return apiRequest("/api/reservations", "POST", { classId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Reserva confirmada",
        description: "Tu plaza ha sido reservada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo completar la reserva",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatTime = (startTime: Date, endTime: Date) => {
    const start = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(startTime));
    
    const end = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(endTime));
    
    return `${start} - ${end}`;
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case "cardio":
        return "bg-red-500";
      case "strength":
        return "bg-blue-500";
      case "yoga":
        return "bg-green-500";
      case "hiit":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case "cardio":
        return "🏃";
      case "strength":
        return "🏋️";
      case "yoga":
        return "🧘";
      case "hiit":
        return "🔥";
      default:
        return "💪";
    }
  };

  const isReserved = (classId: number) => {
    return (userReservations as any[]).some((reservation: any) => 
      reservation.classId === classId && reservation.status === "active"
    );
  };

  const isClassFull = (gymClass: GymClass) => {
    return gymClass.currentEnrollment >= gymClass.capacity;
  };

  const canReserve = (gymClass: GymClass) => {
    return !isClassFull(gymClass) && !isReserved(gymClass.id) && new Date(gymClass.startTime) > new Date();
  };

  const availableClasses = (classes as GymClass[]).filter((gymClass: GymClass) => canReserve(gymClass));

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Cargando clases...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reservar Clase
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableClasses.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
              No hay clases disponibles
            </h3>
            <p className="text-gray-500 dark:text-muted-foreground">
              Todas las clases están completas o ya reservadas
            </p>
          </div>
        ) : (
          availableClasses.map((gymClass: GymClass) => (
            <Card key={gymClass.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`${getClassTypeColor(gymClass.type)} rounded-lg p-3 text-white`}>
                    <span className="text-lg">{getClassTypeIcon(gymClass.type)}</span>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{gymClass.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {gymClass.instructorName}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {gymClass.type}
                      </Badge>
                    </div>

                    {gymClass.description && (
                      <p className="text-sm text-muted-foreground">
                        {gymClass.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(gymClass.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(gymClass.startTime, gymClass.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{gymClass.currentEnrollment}/{gymClass.capacity} personas</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => reservationMutation.mutate(gymClass.id)}
                        disabled={reservationMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {reservationMutation.isPending ? "Reservando..." : "Reservar Plaza"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}