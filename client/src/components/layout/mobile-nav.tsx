import { useState } from "react";
import { Home, Calendar, BarChart3, Users, User } from "lucide-react";

export function MobileNav() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", icon: Home, label: "Inicio" },
    { id: "classes", icon: Calendar, label: "Clases" },
    { id: "progress", icon: BarChart3, label: "Progreso" },
    { id: "social", icon: Users, label: "Social" },
    { id: "profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-200 dark:border-border z-40 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center transition-colors ${
              activeTab === item.id 
                ? "text-primary" 
                : "text-gray-400 dark:text-muted-foreground"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
