import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Calendar, X, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Workout } from "@shared/schema";

interface AchievementsProps {
  onClose: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: "strength" | "consistency" | "social" | "milestone";
}

export function Achievements({ onClose }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: workouts = [] } = useQuery({
    queryKey: ["/api/workouts/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Calculate achievements based on actual workout data
  const calculateAchievements = (workouts: Workout[]): Achievement[] => {
    const totalWorkouts = workouts.length;
    const strengthWorkouts = workouts.filter(w => w.type === "strength").length;
    const uniqueExercises = new Set(workouts.map(w => w.exerciseName)).size;
    
    // Find max weight for different exercises
    const maxWeights = workouts.reduce((acc, workout) => {
      if (workout.weight) {
        const weight = parseFloat(workout.weight);
        if (!acc[workout.exerciseName] || weight > acc[workout.exerciseName]) {
          acc[workout.exerciseName] = weight;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const maxBenchPress = maxWeights["Press Banca"] || 0;
    const maxSquat = maxWeights["Sentadillas"] || 0;
    const maxDeadlift = maxWeights["Peso Muerto"] || 0;

    return [
      {
        id: "first_workout",
        title: "Primer Entrenamiento",
        description: "Completa tu primer ejercicio",
        icon: Star,
        progress: Math.min(totalWorkouts, 1),
        maxProgress: 1,
        unlocked: totalWorkouts >= 1,
        category: "milestone",
      },
      {
        id: "workout_streak_5",
        title: "Racha de 5",
        description: "Completa 5 entrenamientos",
        icon: Calendar,
        progress: Math.min(totalWorkouts, 5),
        maxProgress: 5,
        unlocked: totalWorkouts >= 5,
        category: "consistency",
      },
      {
        id: "strength_master",
        title: "Maestro de Fuerza",
        description: "Completa 10 ejercicios de fuerza",
        icon: Trophy,
        progress: Math.min(strengthWorkouts, 10),
        maxProgress: 10,
        unlocked: strengthWorkouts >= 10,
        category: "strength",
      },
      {
        id: "exercise_variety",
        title: "Variedad de Ejercicios",
        description: "Prueba 5 ejercicios diferentes",
        icon: Target,
        progress: Math.min(uniqueExercises, 5),
        maxProgress: 5,
        unlocked: uniqueExercises >= 5,
        category: "milestone",
      },
      {
        id: "bench_press_80",
        title: "Press Banca 80kg",
        description: "Alcanza 80kg en press banca",
        icon: TrendingUp,
        progress: Math.min(maxBenchPress, 80),
        maxProgress: 80,
        unlocked: maxBenchPress >= 80,
        category: "strength",
      },
      {
        id: "squat_100",
        title: "Sentadilla 100kg",
        description: "Alcanza 100kg en sentadillas",
        icon: TrendingUp,
        progress: Math.min(maxSquat, 100),
        maxProgress: 100,
        unlocked: maxSquat >= 100,
        category: "strength",
      },
      {
        id: "deadlift_120",
        title: "Peso Muerto 120kg",
        description: "Alcanza 120kg en peso muerto",
        icon: TrendingUp,
        progress: Math.min(maxDeadlift, 120),
        maxProgress: 120,
        unlocked: maxDeadlift >= 120,
        category: "strength",
      },
    ];
  };

  const achievements = calculateAchievements(workouts);

  const categories = [
    { id: "all", label: "Todos" },
    { id: "strength", label: "Fuerza" },
    { id: "consistency", label: "Consistencia" },
    { id: "milestone", label: "Hitos" },
  ];

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <div>
            <CardTitle>Logros</CardTitle>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} de {achievements.length} desbloqueados
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Achievements grid */}
        <div className="grid gap-4">
          {filteredAchievements.map((achievement) => {
            const IconComponent = achievement.icon;
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

            return (
              <Card 
                key={achievement.id} 
                className={`transition-all ${
                  achievement.unlocked 
                    ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20" 
                    : "border-gray-200 opacity-75"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlocked 
                        ? "bg-yellow-500 text-white" 
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        {achievement.unlocked && (
                          <Badge className="bg-yellow-500 text-white">
                            Desbloqueado
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              achievement.unlocked 
                                ? "bg-yellow-500" 
                                : "bg-gray-400"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay logros en esta categoría
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}