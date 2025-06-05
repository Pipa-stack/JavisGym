import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarPlus, Camera, Trophy } from "lucide-react";
import { WorkoutLogger } from "./workout-logger";
import { PhotoUpload } from "./photo-upload";
import { Achievements } from "./achievements";
import { ClassReservation } from "./class-reservation";

export function QuickActions() {
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showClassReservation, setShowClassReservation] = useState(false);

  const actions = [
    {
      icon: Plus,
      label: "Nuevo Ejercicio",
      color: "text-accent",
      onClick: () => setShowWorkoutLogger(true),
    },
    {
      icon: CalendarPlus,
      label: "Reservar Clase",
      color: "text-orange-500",
      onClick: () => setShowClassReservation(true),
    },
    {
      icon: Camera,
      label: "Subir Foto",
      color: "text-primary",
      onClick: () => setShowPhotoUpload(true),
    },
    {
      icon: Trophy,
      label: "Ver Logros",
      color: "text-yellow-500",
      onClick: () => setShowAchievements(true),
    },
  ];

  return (
    <>
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
      
      {showWorkoutLogger && (
        <div className="mb-6">
          <WorkoutLogger />
        </div>
      )}

      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PhotoUpload onClose={() => setShowPhotoUpload(false)} />
        </div>
      )}

      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Achievements onClose={() => setShowAchievements(false)} />
        </div>
      )}

      {showClassReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ClassReservation onClose={() => setShowClassReservation(false)} />
        </div>
      )}
    </>
  );
}
