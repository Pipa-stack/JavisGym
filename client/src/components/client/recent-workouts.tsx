import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Activity, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Workout } from "@shared/schema";

export function RecentWorkouts() {
  const { user } = useAuth();

  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/user", user?.id, "recent"],
    enabled: !!user,
  });

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <Dumbbell className="w-4 h-4" />;
      case "cardio":
        return <Activity className="w-4 h-4" />;
      default:
        return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getWorkoutColor = (type: string) => {
    switch (type) {
      case "strength":
        return "bg-primary/10 text-primary";
      case "cardio":
        return "bg-accent/10 text-accent";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const formatWorkoutData = (workout: Workout) => {
    if (workout.type === "cardio") {
      return {
        main: `${workout.duration} min`,
        sub: workout.calories ? `${workout.calories} cal` : "",
      };
    } else {
      return {
        main: `${workout.weight}kg x ${workout.reps}`,
        sub: workout.sets ? `${workout.sets} series` : "",
      };
    }
  };

  const formatDate = (date: string) => {
    const workoutDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - workoutDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    return `${diffDays - 1} días`;
  };

  if (isLoading) {
    return (
      <Card className="gym-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 mr-3 w-8 h-8"></div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-16"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workouts?.length) {
    return (
      <Card className="gym-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Últimos Entrenamientos</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No hay entrenamientos registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gym-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Últimos Entrenamientos</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workouts.map((workout) => {
            const workoutData = formatWorkoutData(workout);
            return (
              <div key={workout.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center">
                  <div className={`${getWorkoutColor(workout.type)} rounded-lg p-2 mr-3`}>
                    {getWorkoutIcon(workout.type)}
                  </div>
                  <div>
                    <div className="font-medium">{workout.exerciseName}</div>
                    <div className="text-sm text-gray-500 dark:text-muted-foreground">
                      {formatDate(workout.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{workoutData.main}</div>
                  {workoutData.sub && (
                    <div className="text-sm text-gray-500 dark:text-muted-foreground">
                      {workoutData.sub}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
