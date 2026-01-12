"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dumbbell, Search, Plus, Minus, Info, Clock, Flame, X, RotateCcw, Save, Calendar, Loader2 } from "lucide-react"

// Types
interface ExerciseDBExercise {
  exerciseId: string
  name: string
  gifUrl: string
  targetMuscles: string[]
  bodyParts: string[]
  equipments: string[]
  secondaryMuscles: string[]
  instructions: string[]
}

interface Exercise {
  id: string
  name: string
  nameIt: string
  muscleGroup: string
  targetMuscles: string[]
  secondaryMuscles: string[]
  equipment: string
  difficulty: "principiante" | "intermedio" | "avanzato"
  instructions: string[]
  gifUrl: string
  calories_per_min: number
}

interface SelectedExercise extends Exercise {
  sets: number
  reps: number
  weight: number
  restSeconds: number
  notes: string
}

export interface GymWorkout {
  name: string
  exercises: SelectedExercise[]
  estimatedDuration: number
  estimatedCalories: number
  notes?: string
}

interface GymExerciseLibraryProps {
  onAddToWorkout?: (exercises: SelectedExercise[]) => void
  onSaveWorkout?: (workout: GymWorkout) => void
  selectedDay?: number
  onDayChange?: (day: number) => void
  dayNames?: string[]
  athleteId?: string
}

// Muscle groups mapping to ExerciseDB body parts
const MUSCLE_GROUPS = [
  { id: "chest", name: "Petto", bodyPart: "chest", icon: "💪", color: "bg-red-500" },
  { id: "back", name: "Dorsali", bodyPart: "back", icon: "🔙", color: "bg-green-500" },
  { id: "shoulders", name: "Spalle", bodyPart: "shoulders", icon: "🎯", color: "bg-orange-500" },
  { id: "upper arms", name: "Braccia", bodyPart: "upper arms", icon: "💪", color: "bg-yellow-500" },
  { id: "lower arms", name: "Avambracci", bodyPart: "lower arms", icon: "🤚", color: "bg-amber-500" },
  { id: "upper legs", name: "Gambe", bodyPart: "upper legs", icon: "🦵", color: "bg-blue-500" },
  { id: "lower legs", name: "Polpacci", bodyPart: "lower legs", icon: "🦶", color: "bg-blue-700" },
  { id: "waist", name: "Core/Addome", bodyPart: "waist", icon: "🎯", color: "bg-pink-500" },
  { id: "cardio", name: "Cardio", bodyPart: "cardio", icon: "❤️", color: "bg-red-600" },
  { id: "neck", name: "Collo", bodyPart: "neck", icon: "🧘", color: "bg-teal-500" },
]

// Translation mapping for common terms
const TRANSLATION_MAP: Record<string, string> = {
  // Body parts
  chest: "Petto",
  back: "Dorsali",
  shoulders: "Spalle",
  "upper arms": "Braccia",
  "lower arms": "Avambracci",
  "upper legs": "Gambe",
  "lower legs": "Polpacci",
  waist: "Addominali",
  cardio: "Cardio",
  neck: "Collo",
  // Equipment
  barbell: "Bilanciere",
  dumbbell: "Manubri",
  cable: "Cavi",
  "body weight": "Corpo Libero",
  machine: "Macchina",
  kettlebell: "Kettlebell",
  band: "Elastico",
  "medicine ball": "Palla Medica",
  "stability ball": "Fitball",
  "ez barbell": "Bilanciere EZ",
  "smith machine": "Multipower",
  "leverage machine": "Macchina a Leva",
  assisted: "Assistito",
  weighted: "Con Zavorra",
  rope: "Corda",
  roller: "Rullo",
  "wheel roller": "Rullo Ab",
  "bosu ball": "Bosu",
  "trap bar": "Trap Bar",
  "olympic barbell": "Bilanciere Olimpico",
  "sled machine": "Slitta",
  "elliptical machine": "Ellittica",
  "stationary bike": "Cyclette",
  "skierg machine": "SkiErg",
  tire: "Pneumatico",
  hammer: "Martello",
  "upper body ergometer": "Ergometro",
  "stepmill machine": "StepMill",
}

// Translate text
const translate = (text: string): string => {
  const lowerText = text.toLowerCase()
  return TRANSLATION_MAP[lowerText] || text
}

// Estimate difficulty based on equipment and muscles
const estimateDifficulty = (equipment: string[], muscles: string[]): "principiante" | "intermedio" | "avanzato" => {
  const advancedEquipment = ["barbell", "olympic barbell", "trap bar"]
  const advancedMuscles = ["glutes", "hamstrings", "lats"]

  if (
    equipment.some((e) => advancedEquipment.includes(e.toLowerCase())) ||
    muscles.some((m) => advancedMuscles.includes(m.toLowerCase()))
  ) {
    return "avanzato"
  }
  if (equipment.includes("body weight") || equipment.includes("dumbbell")) {
    return "principiante"
  }
  return "intermedio"
}

// Convert ExerciseDB exercise to our format
const convertExercise = (ex: ExerciseDBExercise, muscleGroup: string): Exercise => ({
  id: ex.exerciseId,
  name: ex.name,
  nameIt: ex.name, // Keep original name, could add translation
  muscleGroup: muscleGroup,
  targetMuscles: ex.targetMuscles.map((m) => translate(m)),
  secondaryMuscles: ex.secondaryMuscles.map((m) => translate(m)),
  equipment: ex.equipments.map((e) => translate(e)).join(", ") || "Corpo Libero",
  difficulty: estimateDifficulty(ex.equipments, ex.targetMuscles),
  instructions: ex.instructions,
  gifUrl: ex.gifUrl,
  calories_per_min: 5 + Math.random() * 5, // Estimate based on intensity
})

export function GymExerciseLibrary({
  onAddToWorkout,
  onSaveWorkout,
  selectedDay = 0,
  onDayChange,
  dayNames = ["Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica"],
  athleteId,
}: GymExerciseLibraryProps) {
  const [selectedGroup, setSelectedGroup] = useState(MUSCLE_GROUPS[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null)
  const [workoutName, setWorkoutName] = useState("")
  const [workoutNotes, setWorkoutNotes] = useState("")

  // Fetch exercises from ExerciseDB API
  const fetchExercises = async (bodyPart: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://www.exercisedb.dev/api/v1/bodyparts/${encodeURIComponent(bodyPart)}/exercises?limit=25`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        const convertedExercises = data.data.map((ex: ExerciseDBExercise) => convertExercise(ex, bodyPart))
        setExercises(convertedExercises)
      } else {
        setExercises([])
      }
    } catch (err) {
      console.error("Error fetching exercises:", err)
      setError("Errore nel caricamento degli esercizi. Riprova più tardi.")
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  // Search exercises
  const searchExercises = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://www.exercisedb.dev/api/v1/exercises/search?q=${encodeURIComponent(query)}&limit=25`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        const convertedExercises = data.data.map((ex: ExerciseDBExercise) =>
          convertExercise(ex, ex.bodyParts[0] || "general"),
        )
        setExercises(convertedExercises)
      } else {
        setExercises([])
      }
    } catch (err) {
      console.error("Error searching exercises:", err)
      setError("Errore nella ricerca. Riprova.")
    } finally {
      setLoading(false)
    }
  }

  // Load exercises when muscle group changes
  useEffect(() => {
    const group = MUSCLE_GROUPS.find((g) => g.id === selectedGroup)
    if (group) {
      fetchExercises(group.bodyPart)
    }
  }, [selectedGroup])

  // Filter exercises by search
  const filteredExercises = searchQuery
    ? exercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.nameIt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.targetMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : exercises

  // Add exercise to workout
  const addExercise = (exercise: Exercise) => {
    const selected: SelectedExercise = {
      ...exercise,
      sets: 3,
      reps: 12,
      weight: 0,
      restSeconds: 60,
      notes: "",
    }
    setSelectedExercises([...selectedExercises, selected])
  }

  // Remove exercise from workout
  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  // Update exercise parameters
  const updateExercise = (index: number, updates: Partial<SelectedExercise>) => {
    setSelectedExercises(selectedExercises.map((ex, i) => (i === index ? { ...ex, ...updates } : ex)))
  }

  // Calculate totals
  const totalDuration = selectedExercises.reduce((total, ex) => {
    const setTime = (ex.reps * 3 + ex.restSeconds) * ex.sets // 3 sec per rep + rest
    return total + setTime
  }, 0)

  const totalCalories = selectedExercises.reduce((total, ex) => {
    const minutes = ((ex.reps * 3 + ex.restSeconds) * ex.sets) / 60
    return total + minutes * ex.calories_per_min
  }, 0)

  // Save workout
  const handleSaveWorkout = () => {
    if (selectedExercises.length === 0) return

    const workout: GymWorkout = {
      name: workoutName || `Scheda Palestra - ${dayNames[selectedDay]}`,
      exercises: selectedExercises,
      estimatedDuration: Math.round(totalDuration / 60),
      estimatedCalories: Math.round(totalCalories),
      notes: workoutNotes,
    }

    onSaveWorkout?.(workout)

    // Reset
    setSelectedExercises([])
    setWorkoutName("")
    setWorkoutNotes("")
  }

  // Clear workout
  const clearWorkout = () => {
    setSelectedExercises([])
    setWorkoutName("")
    setWorkoutNotes("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Exercise Browser */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header with search and day selector */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca esercizio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchExercises(searchQuery)
                }
              }}
              className="pl-10"
            />
          </div>
          {onDayChange && (
            <Select value={selectedDay.toString()} onValueChange={(v) => onDayChange(Number.parseInt(v))}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayNames.map((day, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Muscle Group Tabs */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {MUSCLE_GROUPS.map((group) => (
              <Button
                key={group.id}
                variant={selectedGroup === group.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGroup(group.id)}
                className={selectedGroup === group.id ? group.color : ""}
              >
                <span className="mr-1">{group.icon}</span>
                {group.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Exercises Grid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Esercizi - {MUSCLE_GROUPS.find((g) => g.id === selectedGroup)?.name}
            </CardTitle>
            <CardDescription>Clicca su un esercizio per aggiungerlo alla scheda</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Caricamento esercizi...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    const group = MUSCLE_GROUPS.find((g) => g.id === selectedGroup)
                    if (group) fetchExercises(group.bodyPart)
                  }}
                >
                  Riprova
                </Button>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nessun esercizio trovato</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="group relative rounded-lg border bg-card overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addExercise(exercise)}
                  >
                    {/* GIF Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={exercise.gifUrl || "/placeholder.svg"}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder if GIF fails
                          ;(e.target as HTMLImageElement).src =
                            `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(exercise.name)}`
                        }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                      {/* Difficulty badge */}
                      <Badge
                        className={`absolute top-1 right-1 text-[10px] ${
                          exercise.difficulty === "principiante"
                            ? "bg-green-500"
                            : exercise.difficulty === "intermedio"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      >
                        {exercise.difficulty.charAt(0).toUpperCase()}
                      </Badge>
                    </div>
                    {/* Exercise info */}
                    <div className="p-2">
                      <p className="text-xs font-medium truncate capitalize">{exercise.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{exercise.equipment}</p>
                    </div>
                    {/* Info button */}
                    <button
                      className="absolute top-1 left-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowExerciseDetail(exercise)
                      }}
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Workout Builder */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Scheda Allenamento</CardTitle>
              {selectedExercises.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearWorkout}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Workout name */}
            <div className="space-y-2">
              <Label>Nome Scheda</Label>
              <Input
                placeholder="Es: Upper Body A"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            {/* Selected exercises */}
            {selectedExercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aggiungi esercizi dalla lista</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {selectedExercises.map((exercise, index) => (
                    <div key={`${exercise.id}-${index}`} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={exercise.gifUrl || "/placeholder.svg"}
                            alt={exercise.name}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(exercise.name)}`
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium capitalize">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">{exercise.equipment}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExercise(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Parameters */}
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-[10px]">Serie</Label>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-r-none bg-transparent"
                              onClick={() => updateExercise(index, { sets: Math.max(1, exercise.sets - 1) })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="h-6 w-8 flex items-center justify-center border-y text-xs">
                              {exercise.sets}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-l-none bg-transparent"
                              onClick={() => updateExercise(index, { sets: exercise.sets + 1 })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px]">Reps</Label>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-r-none bg-transparent"
                              onClick={() => updateExercise(index, { reps: Math.max(1, exercise.reps - 1) })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="h-6 w-8 flex items-center justify-center border-y text-xs">
                              {exercise.reps}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-l-none bg-transparent"
                              onClick={() => updateExercise(index, { reps: exercise.reps + 1 })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px]">Kg</Label>
                          <Input
                            type="number"
                            className="h-6 text-xs text-center"
                            value={exercise.weight || ""}
                            onChange={(e) => updateExercise(index, { weight: Number.parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Rest (s)</Label>
                          <Input
                            type="number"
                            className="h-6 text-xs text-center"
                            value={exercise.restSeconds}
                            onChange={(e) =>
                              updateExercise(index, { restSeconds: Number.parseInt(e.target.value) || 60 })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Totals */}
            {selectedExercises.length > 0 && (
              <>
                <div className="flex justify-between text-sm border-t pt-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Durata stimata:</span>
                  </div>
                  <span className="font-medium">{Math.round(totalDuration / 60)} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    <span>Calorie stimate:</span>
                  </div>
                  <span className="font-medium">{Math.round(totalCalories)} kcal</span>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input
                    placeholder="Note aggiuntive..."
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                  />
                </div>

                {/* Save button */}
                <Button className="w-full" onClick={handleSaveWorkout}>
                  <Save className="h-4 w-4 mr-2" />
                  Salva Scheda in {dayNames[selectedDay]}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise Detail Dialog */}
      <Dialog open={!!showExerciseDetail} onOpenChange={() => setShowExerciseDetail(null)}>
        <DialogContent className="max-w-md">
          {showExerciseDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">{showExerciseDetail.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* GIF */}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={showExerciseDetail.gifUrl || "/placeholder.svg"}
                    alt={showExerciseDetail.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(showExerciseDetail.name)}`
                    }}
                  />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{showExerciseDetail.equipment}</Badge>
                    <Badge
                      className={
                        showExerciseDetail.difficulty === "principiante"
                          ? "bg-green-500"
                          : showExerciseDetail.difficulty === "intermedio"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    >
                      {showExerciseDetail.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Muscoli Target</Label>
                    <p className="text-sm">{showExerciseDetail.targetMuscles.join(", ")}</p>
                  </div>

                  {showExerciseDetail.secondaryMuscles.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Muscoli Secondari</Label>
                      <p className="text-sm">{showExerciseDetail.secondaryMuscles.join(", ")}</p>
                    </div>
                  )}

                  {showExerciseDetail.instructions.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Istruzioni</Label>
                      <ol className="text-sm list-decimal list-inside space-y-1">
                        {showExerciseDetail.instructions.map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    addExercise(showExerciseDetail)
                    setShowExerciseDetail(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi alla Scheda
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GymExerciseLibrary
