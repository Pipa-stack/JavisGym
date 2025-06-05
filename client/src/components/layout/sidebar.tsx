import { useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Dumbbell, 
  BarChart3, 
  Users, 
  Settings,
  BarChart,
  UserCheck,
  CalendarDays
} from "lucide-react";

interface SidebarProps {
  variant: "client" | "admin";
}

export function Sidebar({ variant }: SidebarProps) {
  const [location] = useLocation();

  const clientNavItems = [
    { icon: Home, label: "Feed Social", href: "/", active: location === "/" },
    { icon: Calendar, label: "Mis Clases", href: "/classes", active: location === "/classes" },
    { icon: Dumbbell, label: "Mis Ejercicios", href: "/exercises", active: location === "/exercises" },
    { icon: BarChart3, label: "Estadísticas", href: "/stats", active: location === "/stats" },
    { icon: Users, label: "Comunidad", href: "/community", active: location === "/community" },
  ];

  const adminNavItems = [
    { icon: BarChart, label: "Dashboard", href: "/admin", active: location === "/admin" },
    { icon: CalendarDays, label: "Horarios", href: "/admin/schedule", active: false },
    { icon: Users, label: "Miembros", href: "/admin/members", active: false },
    { icon: UserCheck, label: "Entrenadores", href: "/admin/trainers", active: false },
    { icon: BarChart3, label: "Reportes", href: "/admin/reports", active: false },
    { icon: Settings, label: "Configuración", href: "/admin/settings", active: false },
  ];

  const navItems = variant === "client" ? clientNavItems : adminNavItems;

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <nav className="bg-white dark:bg-card shadow-sm h-full p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-primary text-white"
                      : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
