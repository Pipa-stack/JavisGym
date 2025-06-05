import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WorkoutLogger } from "@/components/client/workout-logger";
import { Search, TrendingUp, Calendar, Weight, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Workout } from "@shared/schema";

interface ExerciseGroup {
  name: string;
  workouts: Workout[];
  lastWeight: number;
  bestWeight: number;
  totalVolume: number;
  lastDate: Date;
}

export default function ExercisesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/user", user?.id],
    enabled: !!user,
  });

  // Group workouts by exercise name
  const exerciseGroups: ExerciseGroup[] = workouts?.reduce((groups, workout) => {
    const existing = groups.find(g => g.name === workout.exerciseName);
    
    if (existing) {
      existing.workouts.push(workout);
    } else {
      groups.push({
        name: workout.exerciseName,
        workouts: [workout],
        lastWeight: 0,
        bestWeight: 0,
        totalVolume: 0,
        lastDate: new Date(workout.date),
      });
    }
    
    return groups;
  }, [] as ExerciseGroup[]) || [];

  // Calculate stats for each exercise group
  exerciseGroups.forEach(group => {
    group.workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastWorkout = group.workouts[0];
    group.lastWeight = Number(lastWorkout.weight) || 0;
    group.lastDate = new Date(lastWorkout.date);
    
    group.bestWeight = Math.max(...group.workouts.map(w => Number(w.weight) || 0));
    
    group.totalVolume = group.workouts.reduce((sum, w) => {
      const weight = Number(w.weight) || 0;
      const reps = w.reps || 0;
      const sets = w.sets || 1;
      return sum + (weight * reps * sets);
    }, 0);
  });

  const filteredExercises = exerciseGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    return `${diffDays - 1} días`;
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
                Mis Ejercicios
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground">
                Rastrea tu progreso y mejora constante
              </p>
            </div>

            {/* Add Exercise Button */}
            <div className="mb-6">
              <WorkoutLogger />
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Exercise List */}
            {filteredExercises.length === 0 ? (
              <Card className="gym-card">
                <CardContent className="p-8 text-center">
                  <Weight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
                    {searchTerm ? "No se encontraron ejercicios" : "No hay ejercicios registrados"}
                  </h3>
                  <p className="text-gray-500 dark:text-muted-foreground mb-4">
                    {searchTerm ? "Intenta con otro término de búsqueda" : "Comienza registrando tu primer entrenamiento"}
                  </p>
                  {!searchTerm && <WorkoutLogger />}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.name} className="gym-card hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{exercise.name}</h3>
                        <Badge variant="secondary">
                          {exercise.workouts.length} sesión{exercise.workouts.length !== 1 ? 'es' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">
                            Último Peso
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {exercise.lastWeight}kg
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">
                            Mejor Peso
                          </div>
                          <div className="text-xl font-bold text-success">
                            {exercise.bestWeight}kg
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">
                            Volumen Total
                          </div>
                          <div className="text-xl font-bold text-orange">
                            {(exercise.totalVolume / 1000).toFixed(1)}t
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">
                            Última Vez
                          </div>
                          <div className="text-xl font-bold text-gray-700 dark:text-foreground">
                            {formatDate(exercise.lastDate)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-muted-foreground">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>
                              {exercise.lastWeight > 0 && exercise.bestWeight > exercise.lastWeight 
                                ? `Mejor: +${exercise.bestWeight - exercise.lastWeight}kg`
                                : "En progreso"
                              }
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Ver historial
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}