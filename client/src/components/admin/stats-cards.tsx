import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarCheck, DollarSign, Star } from "lucide-react";

interface Stats {
  activeMembers: number;
  todayClasses: number;
  monthlyRevenue: number;
  satisfaction: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 w-12 h-12"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="gym-card">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-primary/10 text-primary rounded-lg p-3">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Miembros Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{stats.activeMembers.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success text-sm font-medium">+12%</span>
            <span className="text-gray-500 dark:text-muted-foreground text-sm ml-1">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gym-card">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-accent/10 text-accent rounded-lg p-3">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Clases Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{stats.todayClasses}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success text-sm font-medium">98%</span>
            <span className="text-gray-500 dark:text-muted-foreground text-sm ml-1">ocupación</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gym-card">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-orange/10 text-orange rounded-lg p-3">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground">€{stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success text-sm font-medium">+8%</span>
            <span className="text-gray-500 dark:text-muted-foreground text-sm ml-1">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gym-card">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg p-3">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Satisfacción</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{stats.satisfaction}/5</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success text-sm font-medium">+0.2</span>
            <span className="text-gray-500 dark:text-muted-foreground text-sm ml-1">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
