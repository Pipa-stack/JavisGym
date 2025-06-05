import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserPlus, CalendarCheck, AlertTriangle, Star } from "lucide-react";
import type { Activity } from "@shared/schema";

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_member":
        return <UserPlus className="h-4 w-4" />;
      case "class_completed":
        return <CalendarCheck className="h-4 w-4" />;
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      default:
        return <CalendarCheck className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "new_member":
        return "bg-success/10 text-success";
      case "class_completed":
        return "bg-primary/10 text-primary";
      case "maintenance":
        return "bg-orange/10 text-orange";
      case "review":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const activityDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - activityDate.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays}d`;
    }
  };

  if (isLoading) {
    return (
      <Card className="gym-card">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 w-8 h-8"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities?.length) {
    return (
      <Card className="gym-card">
        <CardHeader>
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No hay actividad reciente
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gym-card">
      <CardHeader>
        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`${getActivityColor(activity.type)} rounded-full p-2`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-muted-foreground">
                {formatTimeAgo(activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
