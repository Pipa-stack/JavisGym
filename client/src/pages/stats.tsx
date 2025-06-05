import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Calendar,
  Flame,
  Award,
  Timer,
  Dumbbell
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Workout } from "@shared/schema";

interface Stats {
  weeklyWorkouts: number;
  caloriesBurned: number;
}

export default function StatsPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts/user", user?.id],
    enabled: !!user,
  });

  // Process workout data for charts
  const processWorkoutData = () => {
    if (!workouts?.length) return { weeklyData: [], exerciseData: [], progressData: [] };

    // Group by week for weekly chart
    const weeklyGroups = workouts.reduce((acc, workout) => {
      const date = new Date(workout.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, workouts: 0, volume: 0 };
      }
      
      acc[weekKey].workouts++;
      const weight = Number(workout.weight) || 0;
      const reps = workout.reps || 0;
      const sets = workout.sets || 1;
      acc[weekKey].volume += weight * reps * sets;
      
      return acc;
    }, {} as Record<string, any>);

    const weeklyData = Object.values(weeklyGroups)
      .sort((a: any, b: any) => a.week.localeCompare(b.week))
      .slice(-8) // Last 8 weeks
      .map((item: any) => ({
        ...item,
        week: new Date(item.week).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        volume: Math.round(item.volume / 1000 * 10) / 10 // Convert to tons
      }));

    // Group by exercise for pie chart
    const exerciseGroups = workouts.reduce((acc, workout) => {
      if (!acc[workout.exerciseName]) {
        acc[workout.exerciseName] = 0;
      }
      acc[workout.exerciseName]++;
      return acc;
    }, {} as Record<string, number>);

    const exerciseData = Object.entries(exerciseGroups)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 exercises

    // Progress data for line chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = workouts
      .filter(w => new Date(w.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const progressData = recentWorkouts.map(workout => ({
      date: new Date(workout.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      weight: Number(workout.weight) || 0,
      exercise: workout.exerciseName
    }));

    return { weeklyData, exerciseData, progressData };
  };

  const { weeklyData, exerciseData, progressData } = processWorkoutData();

  // Calculate personal records
  const getPersonalRecords = () => {
    if (!workouts?.length) return [];

    const exerciseMaxes = workouts.reduce((acc, workout) => {
      const weight = Number(workout.weight) || 0;
      if (!acc[workout.exerciseName] || weight > acc[workout.exerciseName].weight) {
        acc[workout.exerciseName] = {
          exercise: workout.exerciseName,
          weight,
          date: workout.date,
          reps: workout.reps || 0
        };
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(exerciseMaxes)
      .sort((a: any, b: any) => b.weight - a.weight)
      .slice(0, 5);
  };

  const personalRecords = getPersonalRecords();

  // Calculate achievements
  const calculateAchievements = () => {
    if (!workouts?.length) return [];

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => {
      const weight = Number(w.weight) || 0;
      const reps = w.reps || 0;
      const sets = w.sets || 1;
      return sum + (weight * reps * sets);
    }, 0);

    const achievements = [];

    if (totalWorkouts >= 10) achievements.push({ title: "Constancia", description: "10+ entrenamientos", icon: "🎯" });
    if (totalWorkouts >= 25) achievements.push({ title: "Dedicado", description: "25+ entrenamientos", icon: "💪" });
    if (totalWorkouts >= 50) achievements.push({ title: "Guerrero", description: "50+ entrenamientos", icon: "⚡" });
    
    if (totalVolume >= 5000) achievements.push({ title: "Fuerza", description: "5+ toneladas movidas", icon: "🏋️" });
    if (totalVolume >= 10000) achievements.push({ title: "Titan", description: "10+ toneladas movidas", icon: "🔥" });

    return achievements;
  };

  const achievements = calculateAchievements();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <div className="flex">
          <Sidebar variant="client" />
          <main className="flex-1 p-4 pb-20 md:pb-4">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                Estadísticas
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground">
                Analiza tu progreso y rendimiento
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="gym-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-primary/10 text-primary rounded-lg p-3 mr-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                        Entrenamientos Totales
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        {workouts?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gym-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-accent/10 text-accent rounded-lg p-3 mr-4">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                        Esta Semana
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        {stats?.weeklyWorkouts || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gym-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-orange/10 text-orange rounded-lg p-3 mr-4">
                      <Flame className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                        Calorías Quemadas
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        {stats?.caloriesBurned?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gym-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-success/10 text-success rounded-lg p-3 mr-4">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                        Logros
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        {achievements.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Weekly Progress */}
              <Card className="gym-card">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Progreso Semanal
                  </h3>
                </CardHeader>
                <CardContent>
                  {weeklyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="workouts" fill="#3B82F6" name="Entrenamientos" />
                        <Bar dataKey="volume" fill="#10B981" name="Volumen (t)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-gray-500">
                      No hay datos suficientes para mostrar
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exercise Distribution */}
              <Card className="gym-card">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Dumbbell className="h-5 w-5 mr-2" />
                    Distribución de Ejercicios
                  </h3>
                </CardHeader>
                <CardContent>
                  {exerciseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={exerciseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {exerciseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-gray-500">
                      No hay datos de ejercicios
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Personal Records & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Records */}
              <Card className="gym-card">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Récords Personales
                  </h3>
                </CardHeader>
                <CardContent>
                  {personalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {personalRecords.map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{record.exercise}</p>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">
                              {new Date(record.date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{record.weight}kg</p>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">
                              {record.reps} reps
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                      No hay récords registrados
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="gym-card">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Logros Desbloqueados
                  </h3>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="space-y-4">
                      {achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-2xl mr-3">{achievement.icon}</span>
                          <div>
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                      Sigue entrenando para desbloquear logros
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}