import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, Star, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { GymClass, Reservation } from "@shared/schema";

export default function ClassesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: classes, isLoading: classesLoading } = useQuery<GymClass[]>({
    queryKey: ["/api/classes"],
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations/user", user?.id],
    enabled: !!user,
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
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations/user"] });
      toast({
        title: "Reserva confirmada",
        description: "Te has inscrito exitosamente en la clase.",
      });
    },
    onError: () => {
      toast({
        title: "Error en la reserva",
        description: "No se pudo completar la reserva.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reservationId: number) => {
      return apiRequest("DELETE", `/api/reservations/${reservationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations/user"] });
      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva.",
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isClassFull = (gymClass: GymClass) => {
    return gymClass.currentEnrollment >= gymClass.capacity;
  };

  const canReserve = (gymClass: GymClass) => {
    const now = new Date();
    const classStart = new Date(gymClass.startTime);
    return classStart > now && !isClassFull(gymClass);
  };

  const isReserved = (classId: number) => {
    return reservations?.some(r => r.classId === classId && r.status === "confirmed");
  };

  const getReservationId = (classId: number) => {
    return reservations?.find(r => r.classId === classId && r.status === "confirmed")?.id;
  };

  // Separate upcoming and past classes
  const now = new Date();
  const upcomingClasses = classes?.filter(c => new Date(c.startTime) > now) || [];
  const pastClasses = classes?.filter(c => new Date(c.startTime) <= now) || [];

  if (classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="flex">
          <Sidebar variant="client" />
          <main className="flex-1 p-4 pb-20 md:pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
                Mis Clases
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground">
                Reserva y gestiona tus clases del gimnasio
              </p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Próximas ({upcomingClasses.length})</TabsTrigger>
                <TabsTrigger value="past">Pasadas ({pastClasses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingClasses.length === 0 ? (
                  <Card className="gym-card">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
                        No hay clases próximas
                      </h3>
                      <p className="text-gray-500 dark:text-muted-foreground">
                        Las nuevas clases aparecerán aquí cuando estén disponibles
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingClasses.map((gymClass) => (
                    <Card key={gymClass.id} className="gym-card hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`${getClassTypeColor(gymClass.type)} rounded-lg p-3 mr-4 text-white`}>
                              <span className="text-lg">{getClassTypeIcon(gymClass.type)}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{gymClass.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                {gymClass.instructorName}
                              </p>
                            </div>
                          </div>
                          {isReserved(gymClass.id) && (
                            <Badge className="bg-success text-success-foreground">
                              Reservado
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatDate(gymClass.startTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatTime(gymClass.startTime, gymClass.endTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {gymClass.currentEnrollment}/{gymClass.capacity} personas
                            </span>
                          </div>
                        </div>
                        
                        {gymClass.description && (
                          <p className="text-gray-600 dark:text-muted-foreground text-sm mb-4">
                            {gymClass.description}
                          </p>
                        )}
                        
                        <div className="flex justify-end">
                          {isReserved(gymClass.id) ? (
                            <Button
                              variant="outline"
                              onClick={() => {
                                const reservationId = getReservationId(gymClass.id);
                                if (reservationId) {
                                  cancelMutation.mutate(reservationId);
                                }
                              }}
                              disabled={cancelMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar Reserva
                            </Button>
                          ) : canReserve(gymClass) ? (
                            <Button
                              onClick={() => reservationMutation.mutate(gymClass.id)}
                              disabled={reservationMutation.isPending}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Reservar Plaza
                            </Button>
                          ) : isClassFull(gymClass) ? (
                            <Badge variant="secondary">Clase Completa</Badge>
                          ) : (
                            <Badge variant="outline">Clase Finalizada</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastClasses.length === 0 ? (
                  <Card className="gym-card">
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
                        No hay clases pasadas
                      </h3>
                      <p className="text-gray-500 dark:text-muted-foreground">
                        Tu historial de clases aparecerá aquí
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pastClasses.map((gymClass) => (
                    <Card key={gymClass.id} className="gym-card opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`${getClassTypeColor(gymClass.type)} rounded-lg p-3 mr-4 text-white opacity-60`}>
                              <span className="text-lg">{getClassTypeIcon(gymClass.type)}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{gymClass.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                {gymClass.instructorName}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Finalizada</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatDate(gymClass.startTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatTime(gymClass.startTime, gymClass.endTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {gymClass.currentEnrollment}/{gymClass.capacity} personas
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}