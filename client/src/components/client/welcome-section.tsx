import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

interface Stats {
  weeklyWorkouts: number;
  caloriesBurned: number;
}

export function WelcomeSection() {
  const { user } = useAuth();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <Card className="gradient-primary rounded-2xl p-6 text-white mb-6">
      <h2 className="text-2xl font-bold mb-2">
        ¡Hola {user?.fullName || "Usuario"}! 💪
      </h2>
      <p className="opacity-90 mb-4">
        ¿Listo para entrenar hoy? Mantén tu progreso constante.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="bg-white/20 backdrop-blur rounded-lg p-3 flex-1">
          <div className="text-sm opacity-75">Entrenamientos esta semana</div>
          <div className="text-xl font-bold">{stats?.weeklyWorkouts || 0}</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-3 flex-1">
          <div className="text-sm opacity-75">Calorías quemadas</div>
          <div className="text-xl font-bold">{stats?.caloriesBurned?.toLocaleString() || 0}</div>
        </div>
      </div>
    </Card>
  );
}
