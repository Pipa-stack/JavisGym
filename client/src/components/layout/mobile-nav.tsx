import { useLocation } from "wouter";
import { Home, Calendar, Dumbbell, BarChart3, User } from "lucide-react";

export function MobileNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Inicio", href: "/" },
    { id: "exercises", icon: Dumbbell, label: "Ejercicios", href: "/exercises" },
    { id: "classes", icon: Calendar, label: "Clases", href: "/classes" },
    { id: "progress", icon: BarChart3, label: "Progreso", href: "/stats" },
    { id: "profile", icon: User, label: "Perfil", href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-200 dark:border-border z-40 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center transition-colors ${
              location === item.href 
                ? "text-primary" 
                : "text-gray-400 dark:text-muted-foreground"
            }`}
            onClick={() => setLocation(item.href)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
