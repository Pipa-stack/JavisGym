import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Dumbbell, Minus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Set {
  reps: number;
  weight: number;
}

const COMMON_EXERCISES = [
  "Press Banca",
  "Sentadillas",
  "Peso Muerto",
  "Press Militar",
  "Dominadas",
  "Flexiones",
  "Remo con Barra",
  "Press Inclinado",
  "Curl de Bíceps",
  "Extensiones de Tríceps",
  "Prensa de Piernas",
  "Elevaciones Laterales",
];

export function WorkoutLogger() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState<Set[]>([{ reps: 0, weight: 0 }]);

  const workoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      return apiRequest("POST", "/api/workouts", workoutData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/user"] });
      toast({
        title: "Entrenamiento registrado",
        description: "Tu ejercicio ha sido guardado exitosamente.",
      });
      setIsOpen(false);
      setExerciseName("");
      setSets([{ reps: 0, weight: 0 }]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar el entrenamiento.",
        variant: "destructive",
      });
    },
  });

  const addSet = () => {
    setSets([...sets, { reps: 0, weight: 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleSubmit = () => {
    if (!exerciseName || !user) return;

    // Calculate best set for main record
    const bestSet = sets.reduce((best, current) => {
      const currentVolume = current.reps * current.weight;
      const bestVolume = best.reps * best.weight;
      return currentVolume > bestVolume ? current : best;
    });

    const workoutData = {
      userId: user.id,
      exerciseName,
      weight: bestSet.weight.toString(),
      reps: bestSet.reps,
      sets: sets.length,
      type: "strength",
    };

    workoutMutation.mutate(workoutData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2" />
            Nuevo Ejercicio
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="exercise">Ejercicio</Label>
            <Select value={exerciseName} onValueChange={setExerciseName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_EXERCISES.map((exercise) => (
                  <SelectItem key={exercise} value={exercise}>
                    {exercise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Series</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSet}
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar Serie
              </Button>
            </div>
            
            <div className="space-y-2">
              {sets.map((set, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium w-8">#{index + 1}</span>
                  
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Peso (kg)</Label>
                    <Input
                      type="number"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(index, 'weight', Number(e.target.value))}
                      className="h-8"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Reps</Label>
                    <Input
                      type="number"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(index, 'reps', Number(e.target.value))}
                      className="h-8"
                      min="0"
                    />
                  </div>
                  
                  {sets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSet(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!exerciseName || workoutMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {workoutMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}