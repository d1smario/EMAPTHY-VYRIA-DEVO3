"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dumbbell, Search, Plus, Clock, Flame, X, RotateCcw, Save, Calendar, Loader2, FileDown } from "lucide-react"
import Image from "next/image"

// Types
interface Exercise {
  id: string
  name: string
  nameIt?: string
  bodyPart: string
  target: string
  secondaryMuscles: string[]
  equipment: string
  gifUrl: string
  instructions: string[]
  difficulty?: string
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
  onSaveWorkout?: (workout: GymWorkout) => void
  selectedDay?: number
  onDayChange?: (day: number) => void
  dayNames?: string[]
  athleteId?: string
}

const MUSCLE_GROUPS = [
  { id: "chest", name: "Petto", bodyPart: "chest", color: "bg-red-500" },
  { id: "back", name: "Dorsali", bodyPart: "back", color: "bg-blue-500" },
  { id: "shoulders", name: "Spalle", bodyPart: "shoulders", color: "bg-yellow-500" },
  { id: "arms", name: "Braccia", bodyPart: "upper arms", color: "bg-purple-500" },
  { id: "legs", name: "Gambe", bodyPart: "upper legs", color: "bg-green-500" },
  { id: "glutes", name: "Glutei", bodyPart: "upper legs", color: "bg-pink-500" },
  { id: "core", name: "Core", bodyPart: "waist", color: "bg-orange-500" },
  { id: "calves", name: "Polpacci", bodyPart: "lower legs", color: "bg-indigo-500" },
  { id: "cardio", name: "Cardio", bodyPart: "cardio", color: "bg-rose-500" },
  { id: "forearms", name: "Avambracci", bodyPart: "lower arms", color: "bg-teal-500" },
]

export default function GymExerciseLibrary({
  onSaveWorkout,
  selectedDay = 0,
  onDayChange,
  dayNames = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
  athleteId,
}: GymExerciseLibraryProps) {
  const [selectedGroup, setSelectedGroup] = useState("chest")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null)
  const [workoutName, setWorkoutName] = useState("")
  const [workoutNotes, setWorkoutNotes] = useState("")

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiSource, setApiSource] = useState<string>("")

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true)
      setError(null)
      try {
        const group = MUSCLE_GROUPS.find((g) => g.id === selectedGroup)
        const bodyPart = group?.bodyPart || selectedGroup

        const res = await fetch(`/api/exercises?bodyPart=${encodeURIComponent(bodyPart)}&limit=50`)
        if (!res.ok) throw new Error("Failed to fetch exercises")

        const data = await res.json()
        setExercises(data.exercises || [])
        setApiSource(data.source || "unknown")
        console.log(`[v0] Loaded ${data.exercises?.length || 0} exercises from ${data.source}`)
      } catch (err) {
        console.error("Error loading exercises:", err)
        setError("Errore nel caricamento degli esercizi")
      } finally {
        setLoading(false)
      }
    }
    loadExercises()
  }, [selectedGroup])

  // Filter exercises by search
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return exercises
    const query = searchQuery.toLowerCase()
    return exercises.filter(
      (ex) =>
        ex.name?.toLowerCase().includes(query) ||
        ex.nameIt?.toLowerCase().includes(query) ||
        ex.target?.toLowerCase().includes(query) ||
        ex.equipment?.toLowerCase().includes(query),
    )
  }, [exercises, searchQuery])

  // Add exercise to workout
  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.find((e) => e.id === exercise.id)) return
    setSelectedExercises([
      ...selectedExercises,
      {
        ...exercise,
        sets: 3,
        reps: 12,
        weight: 0,
        restSeconds: 60,
        notes: "",
      },
    ])
  }

  // Remove exercise from workout
  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== exerciseId))
  }

  // Update exercise in workout
  const updateExercise = (exerciseId: string, field: keyof SelectedExercise, value: number | string) => {
    setSelectedExercises(selectedExercises.map((e) => (e.id === exerciseId ? { ...e, [field]: value } : e)))
  }

  // Calculate totals
  const totals = useMemo(() => {
    const duration = selectedExercises.reduce((acc, ex) => {
      const setTime = ex.sets * (ex.reps * 3 + ex.restSeconds)
      return acc + setTime / 60
    }, 0)
    const calories = Math.round(duration * 6)
    return { duration: Math.round(duration), calories }
  }, [selectedExercises])

  // Save workout
  const handleSave = () => {
    if (!workoutName.trim() || selectedExercises.length === 0) {
      alert("Inserisci un nome e almeno un esercizio")
      return
    }
    const workout: GymWorkout = {
      name: workoutName,
      exercises: selectedExercises,
      estimatedDuration: totals.duration,
      estimatedCalories: totals.calories,
      notes: workoutNotes,
    }
    console.log("[v0] Saving gym workout:", workout.name, "with", workout.exercises.length, "exercises")
    if (onSaveWorkout) {
      console.log("[v0] Calling onSaveWorkout callback")
      onSaveWorkout(workout)
    } else {
      console.log("[v0] WARNING: onSaveWorkout callback is not defined!")
      alert("Errore: callback di salvataggio non definita")
      return
    }
    alert("Scheda salvata in Training!")
    // Reset
    setWorkoutName("")
    setWorkoutNotes("")
    setSelectedExercises([])
  }

  // Reset workout
  const handleReset = () => {
    setWorkoutName("")
    setWorkoutNotes("")
    setSelectedExercises([])
  }

  // PDF generation function
  const handleDownloadPDF = () => {
    if (!workoutName.trim() || selectedExercises.length === 0) {
      alert("Inserisci un nome e almeno un esercizio")
      return
    }

    // Create printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scheda Palestra - ${workoutName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .stats { display: flex; gap: 20px; margin-bottom: 20px; padding: 10px; background: #f3f4f6; border-radius: 8px; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .stat-label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #7c3aed; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9fafb; }
          .exercise-name { font-weight: bold; }
          .muscle { color: #666; font-size: 12px; }
          .notes { margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>Scheda Palestra: ${workoutName}</h1>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${selectedExercises.length}</div>
            <div class="stat-label">Esercizi</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totals.duration}</div>
            <div class="stat-label">Minuti</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totals.calories}</div>
            <div class="stat-label">Kcal stimate</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Esercizio</th>
              <th>Serie</th>
              <th>Reps</th>
              <th>Peso (kg)</th>
              <th>Recupero</th>
            </tr>
          </thead>
          <tbody>
            ${selectedExercises
              .map(
                (ex, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>
                  <div class="exercise-name">${ex.nameIt || ex.name}</div>
                  <div class="muscle">${ex.target}</div>
                </td>
                <td>${ex.sets}</td>
                <td>${ex.reps}</td>
                <td>${ex.weight || "-"}</td>
                <td>${ex.restSeconds}s</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        ${workoutNotes ? `<div class="notes"><strong>Note:</strong> ${workoutNotes}</div>` : ""}
        <div class="footer">
          Generato da EMPATHY Performance - ${new Date().toLocaleDateString("it-IT")}
        </div>
      </body>
      </html>
    `

    // Open print dialog
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Biblioteca Esercizi</h2>
          {apiSource && (
            <Badge variant="outline" className="text-xs">
              {apiSource === "exercisedb" ? "ExerciseDB API" : "Database Locale"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDay.toString()} onValueChange={(v) => onDayChange?.(Number.parseInt(v))}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dayNames.map((day, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {MUSCLE_GROUPS.map((group) => (
          <Button
            key={group.id}
            variant={selectedGroup === group.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGroup(group.id)}
            className={selectedGroup === group.id ? group.color : ""}
          >
            {group.name}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca esercizio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Exercise list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                Esercizi {MUSCLE_GROUPS.find((g) => g.id === selectedGroup)?.name} ({filteredExercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Caricamento esercizi...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                    {filteredExercises.map((exercise) => (
                      <Card
                        key={exercise.id}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedExercises.find((e) => e.id === exercise.id) ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => addExercise(exercise)}
                      >
                        <CardContent className="p-2">
                          <div className="relative aspect-square mb-2 rounded overflow-hidden bg-muted">
                            <Image
                              src={exercise.gifUrl || "/placeholder.svg?height=150&width=150"}
                              alt={exercise.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <p className="text-xs font-medium truncate">{exercise.nameIt || exercise.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{exercise.target}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs px-1">
                              {exercise.equipment}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected exercises / Workout builder */}
        <div>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Scheda ({selectedExercises.length})</span>
                {selectedExercises.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
              <Input
                placeholder="Nome scheda..."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />

              <ScrollArea className="h-[250px]">
                {selectedExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Clicca sugli esercizi per aggiungerli
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedExercises.map((ex, idx) => (
                      <Card key={ex.id} className="p-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium truncate flex-1">
                            {idx + 1}. {ex.nameIt || ex.name}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => removeExercise(ex.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <div>
                            <Label className="text-xs">Serie</Label>
                            <Input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => updateExercise(ex.id, "sets", Number.parseInt(e.target.value) || 0)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Reps</Label>
                            <Input
                              type="number"
                              value={ex.reps}
                              onChange={(e) => updateExercise(ex.id, "reps", Number.parseInt(e.target.value) || 0)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Kg</Label>
                            <Input
                              type="number"
                              value={ex.weight}
                              onChange={(e) => updateExercise(ex.id, "weight", Number.parseInt(e.target.value) || 0)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Rec</Label>
                            <Input
                              type="number"
                              value={ex.restSeconds}
                              onChange={(e) =>
                                updateExercise(ex.id, "restSeconds", Number.parseInt(e.target.value) || 0)
                              }
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {selectedExercises.length > 0 && (
                <>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {totals.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4" /> {totals.calories} kcal
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Salva in Training
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPDF}>
                      <FileDown className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exercise detail modal */}
      <Dialog open={!!showExerciseDetail} onOpenChange={() => setShowExerciseDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showExerciseDetail?.nameIt || showExerciseDetail?.name}</DialogTitle>
          </DialogHeader>
          {showExerciseDetail && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded overflow-hidden bg-muted">
                <Image
                  src={showExerciseDetail.gifUrl || "/placeholder.svg"}
                  alt={showExerciseDetail.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h4 className="font-medium mb-1">Muscoli Target</h4>
                <p className="text-sm text-muted-foreground">{showExerciseDetail.target}</p>
              </div>
              {showExerciseDetail.secondaryMuscles?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Muscoli Secondari</h4>
                  <p className="text-sm text-muted-foreground">{showExerciseDetail.secondaryMuscles.join(", ")}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-1">Attrezzatura</h4>
                <p className="text-sm text-muted-foreground">{showExerciseDetail.equipment}</p>
              </div>
              {showExerciseDetail.instructions?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Istruzioni</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground">
                    {showExerciseDetail.instructions.map((instr, i) => (
                      <li key={i}>{instr}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => showExerciseDetail && addExercise(showExerciseDetail)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi alla Scheda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
