import { Button } from "@/components/ui/button";
import { Plus, CalendarPlus, Camera, Trophy } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Nuevo Ejercicio",
      color: "text-accent",
      onClick: () => console.log("Nuevo ejercicio"),
    },
    {
      icon: CalendarPlus,
      label: "Reservar Clase",
      color: "text-orange",
      onClick: () => console.log("Reservar clase"),
    },
    {
      icon: Camera,
      label: "Subir Foto",
      color: "text-primary",
      onClick: () => console.log("Subir foto"),
    },
    {
      icon: Trophy,
      label: "Ver Logros",
      color: "text-success",
      onClick: () => console.log("Ver logros"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="gym-button flex-col h-auto py-4 hover:shadow-md transition-all duration-200"
          onClick={action.onClick}
        >
          <action.icon className={`${action.color} w-6 h-6 mb-2`} />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
