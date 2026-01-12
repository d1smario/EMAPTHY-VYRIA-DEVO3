"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Bike,
  Footprints,
  Waves,
  Activity,
  Mountain,
  Dumbbell,
  Save,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  RotateCcw,
  CalendarRange,
  Target,
  Zap,
  Calendar,
  Heart,
  BookOpen,
  Settings,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AnnualPlanGenerator } from "./annual-plan-generator"
import { WorkoutLibrary } from "./workout-library"
import { GymExerciseLibrary } from "./gym-exercise-library"

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface AthleteDataType {
  id: string
  user_id: string
  primary_sport?: string
  metabolic_profiles?: Array<{
    id?: string
    ftp_watts?: number
    hr_max?: number
    hr_lt2?: number
    hr_rest?: number
    hr_zones?: Record<string, unknown>
    is_current?: boolean
    empathy_zones?: Record<string, unknown>
  }>
  user?: {
    full_name?: string
  }
  [key: string]: unknown
}

interface HRZoneData {
  z1: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z2: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z3: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z4: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z5: { name: string; min: number; max: number; percent: { min: number; max: number } }
}

interface PowerZoneData {
  z1: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z2: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z3: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z4: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z5: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z6: { name: string; min: number; max: number; percent: { min: number; max: number } }
  z7: { name: string; min: number; max: number; percent: { min: number; max: number } }
}

interface WorkoutBlock {
  id: string
  type: "warmup" | "steady" | "interval" | "recovery" | "cooldown"
  duration: number
  zone: string
  intensity: number
  cadenceTarget?: number
  intervalDuration?: number
  intervalDurationUnit?: "min" | "sec"
  numIntervals?: number
  restBetweenIntervals?: number
  description?: string
}

interface TrainingSession {
  sessionId: string
  dayIndex: number
  sport: string
  workoutType: string
  title: string
  description: string
  duration: number
  targetZone: string
  blocks: WorkoutBlock[]
  tss?: number
  metabolicGoal?: string
  gymExercises?: Array<{
    name: string
    sets: number
    reps: number
    weight?: number
    rest?: number
    notes?: string
  }>
}

interface VyriaTrainingPlanProps {
  athleteData: AthleteDataType | null
  userName?: string | null
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SPORTS = [
  { id: "cycling", name: "Ciclismo", icon: Bike },
  { id: "running", name: "Corsa", icon: Footprints },
  { id: "swimming", name: "Nuoto", icon: Waves },
  { id: "triathlon", name: "Triathlon", icon: Activity },
  { id: "trail_running", name: "Trail Running", icon: Mountain },
  { id: "mountain_bike", name: "MTB", icon: Bike },
  { id: "gravel", name: "Gravel", icon: Bike },
  { id: "gym", name: "Palestra", icon: Dumbbell },
]

const WORKOUT_TYPES = [
  { id: "endurance", name: "Endurance", zone: "Z2" },
  { id: "tempo", name: "Tempo", zone: "Z3" },
  { id: "threshold", name: "Soglia", zone: "Z4" },
  { id: "vo2max", name: "VO2max", zone: "Z5" },
  { id: "anaerobic", name: "Anaerobico", zone: "Z6" },
  { id: "sprint", name: "Sprint", zone: "Z7" },
  { id: "recovery", name: "Recupero", zone: "Z1" },
]

const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]

const ZONE_COLORS: Record<string, string> = {
  Z1: "bg-slate-500",
  Z2: "bg-green-500",
  Z3: "bg-yellow-500",
  Z4: "bg-orange-500",
  Z5: "bg-red-500",
  Z6: "bg-red-600",
  Z7: "bg-red-800",
  GYM: "bg-purple-600",
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const generateId = () => Math.random().toString(36).substring(2, 9)

const calculateBlockTotalDuration = (block: WorkoutBlock): number => {
  if (block.type === "interval" && block.numIntervals && block.intervalDuration) {
    const intervalSeconds = block.intervalDurationUnit === "sec" ? block.intervalDuration : block.intervalDuration * 60
    const restSeconds = block.restBetweenIntervals || 0
    return intervalSeconds * block.numIntervals + restSeconds * (block.numIntervals - 1)
  }
  return block.duration * 60
}

const getWeekDateRange = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { monday, sunday }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function VyriaTrainingPlan({ athleteData, userName }: VyriaTrainingPlanProps) {
  const supabase = createClient()

  // State - Main
  const [activeTab, setActiveTab] = useState("zones")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // State - Zones
  const [hrMax, setHrMax] = useState(190)
  const [hrThreshold, setHrThreshold] = useState(170)
  const [hrRest, setHrRest] = useState(50)
  const [ftpWatts, setFtpWatts] = useState(250)
  const [hrZones, setHrZones] = useState<HRZoneData | null>(null)
  const [powerZones, setPowerZones] = useState<PowerZoneData | null>(null)
  const [zonesCalculated, setZonesCalculated] = useState(false)

  // State - Weekly Plan
  const [generatedPlan, setGeneratedPlan] = useState<TrainingSession[]>([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSport, setSelectedSport] = useState("cycling")
  const [selectedWorkoutType, setSelectedWorkoutType] = useState("endurance")

  // State - Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [resetWeekDialogOpen, setResetWeekDialogOpen] = useState(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD DATA ON MOUNT
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (athleteData?.metabolic_profiles) {
      const currentProfile =
        athleteData.metabolic_profiles.find((p) => p.is_current) || athleteData.metabolic_profiles[0]
      if (currentProfile) {
        if (currentProfile.hr_max) setHrMax(currentProfile.hr_max)
        if (currentProfile.hr_lt2) setHrThreshold(currentProfile.hr_lt2)
        if (currentProfile.hr_rest) setHrRest(currentProfile.hr_rest)
        if (currentProfile.ftp_watts) setFtpWatts(currentProfile.ftp_watts)

        // Load saved zones
        if (currentProfile.empathy_zones) {
          const zones = currentProfile.empathy_zones as { hr?: { zones: HRZoneData }; power?: { zones: PowerZoneData } }
          if (zones.hr?.zones) {
            setHrZones(zones.hr.zones)
            setZonesCalculated(true)
          }
          if (zones.power?.zones) {
            setPowerZones(zones.power.zones)
          }
        }
      }
    }
  }, [athleteData])

  // Load existing workouts for current week
  useEffect(() => {
    const loadWeeklyWorkouts = async () => {
      if (!athleteData?.id) return

      setLoading(true)
      try {
        const { monday, sunday } = getWeekDateRange()

        const { data: workouts, error } = await supabase
          .from("training_activities")
          .select("*")
          .eq("athlete_id", athleteData.id)
          .gte("activity_date", monday.toISOString().split("T")[0])
          .lte("activity_date", sunday.toISOString().split("T")[0])
          .order("activity_date", { ascending: true })

        if (error) throw error

        if (workouts && workouts.length > 0) {
          const sessions: TrainingSession[] = workouts.map((w: any) => {
            const activityDate = new Date(w.activity_date)
            const dayOfWeek = activityDate.getDay()
            const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

            return {
              sessionId: w.id || generateId(),
              dayIndex,
              sport: w.activity_type || w.workout_type || "cycling",
              workoutType: w.workout_type || "endurance",
              title: w.title || "Allenamento",
              description: w.description || "",
              duration: w.duration_minutes || 60,
              targetZone: w.target_zone || "Z2",
              blocks: w.intervals?.blocks || [],
              tss: w.tss,
              gymExercises: w.gym_exercises || [],
            }
          })
          setGeneratedPlan(sessions)
        }
      } catch (err) {
        console.error("Error loading workouts:", err)
      } finally {
        setLoading(false)
      }
    }

    loadWeeklyWorkouts()
  }, [athleteData?.id, supabase])

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const calculateZones = () => {
    // HR Zones (5-zone model based on LTHR)
    const calculatedHRZones: HRZoneData = {
      z1: { name: "Recupero", min: hrRest, max: Math.round(hrThreshold * 0.81), percent: { min: 0, max: 81 } },
      z2: {
        name: "Endurance",
        min: Math.round(hrThreshold * 0.81),
        max: Math.round(hrThreshold * 0.89),
        percent: { min: 81, max: 89 },
      },
      z3: {
        name: "Tempo",
        min: Math.round(hrThreshold * 0.9),
        max: Math.round(hrThreshold * 0.93),
        percent: { min: 90, max: 93 },
      },
      z4: {
        name: "Soglia",
        min: Math.round(hrThreshold * 0.94),
        max: Math.round(hrThreshold * 0.99),
        percent: { min: 94, max: 99 },
      },
      z5: { name: "VO2max", min: Math.round(hrThreshold * 1.0), max: hrMax, percent: { min: 100, max: 106 } },
    }

    // Power Zones (7-zone Coggan model)
    const calculatedPowerZones: PowerZoneData = {
      z1: { name: "Recupero", min: 0, max: Math.round(ftpWatts * 0.55), percent: { min: 0, max: 55 } },
      z2: {
        name: "Endurance",
        min: Math.round(ftpWatts * 0.56),
        max: Math.round(ftpWatts * 0.75),
        percent: { min: 56, max: 75 },
      },
      z3: {
        name: "Tempo",
        min: Math.round(ftpWatts * 0.76),
        max: Math.round(ftpWatts * 0.9),
        percent: { min: 76, max: 90 },
      },
      z4: {
        name: "Soglia",
        min: Math.round(ftpWatts * 0.91),
        max: Math.round(ftpWatts * 1.05),
        percent: { min: 91, max: 105 },
      },
      z5: {
        name: "VO2max",
        min: Math.round(ftpWatts * 1.06),
        max: Math.round(ftpWatts * 1.2),
        percent: { min: 106, max: 120 },
      },
      z6: {
        name: "Anaerobico",
        min: Math.round(ftpWatts * 1.21),
        max: Math.round(ftpWatts * 1.5),
        percent: { min: 121, max: 150 },
      },
      z7: { name: "Neuromuscolare", min: Math.round(ftpWatts * 1.5), max: 9999, percent: { min: 150, max: 999 } },
    }

    setHrZones(calculatedHRZones)
    setPowerZones(calculatedPowerZones)
    setZonesCalculated(true)
  }

  const saveZones = async () => {
    if (!athleteData?.id || !athleteData.metabolic_profiles?.[0]?.id) return

    setSaving(true)
    try {
      const profileId = athleteData.metabolic_profiles[0].id
      const empathyZones = {
        hr: { hr_max: hrMax, hr_threshold: hrThreshold, hr_rest: hrRest, zones: hrZones },
        power: { ftp_watts: ftpWatts, zones: powerZones },
      }

      const { error } = await supabase
        .from("metabolic_profiles")
        .update({
          hr_max: hrMax,
          hr_lt2: hrThreshold,
          hr_rest: hrRest,
          ftp_watts: ftpWatts,
          empathy_zones: empathyZones,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId)

      if (error) throw error
      alert("Zone salvate con successo!")
    } catch (err) {
      console.error("Error saving zones:", err)
      alert("Errore nel salvataggio delle zone")
    } finally {
      setSaving(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKOUT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const addWorkoutToDay = (dayIndex: number, workout?: Partial<TrainingSession>) => {
    const newSession: TrainingSession = {
      sessionId: generateId(),
      dayIndex,
      sport: workout?.sport || selectedSport,
      workoutType: workout?.workoutType || selectedWorkoutType,
      title:
        workout?.title ||
        `${SPORTS.find((s) => s.id === selectedSport)?.name || "Allenamento"} - ${WORKOUT_TYPES.find((w) => w.id === selectedWorkoutType)?.name || ""}`,
      description: workout?.description || "",
      duration: workout?.duration || 60,
      targetZone: workout?.targetZone || WORKOUT_TYPES.find((w) => w.id === selectedWorkoutType)?.zone || "Z2",
      blocks: workout?.blocks || [],
      tss: workout?.tss,
      gymExercises: workout?.gymExercises,
    }

    setGeneratedPlan((prev) => [...prev, newSession])
  }

  const deleteSession = (sessionId: string) => {
    setGeneratedPlan((prev) => prev.filter((s) => s.sessionId !== sessionId))
    setDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  const resetWeek = () => {
    setGeneratedPlan([])
    setResetWeekDialogOpen(false)
  }

  const saveWeekToTraining = async () => {
    if (!athleteData?.id || generatedPlan.length === 0) return

    setSaving(true)
    try {
      const { monday } = getWeekDateRange()

      // Delete existing workouts for this week
      const { monday: weekStart, sunday: weekEnd } = getWeekDateRange()
      await supabase
        .from("training_activities")
        .delete()
        .eq("athlete_id", athleteData.id)
        .gte("activity_date", weekStart.toISOString().split("T")[0])
        .lte("activity_date", weekEnd.toISOString().split("T")[0])

      // Insert new workouts
      const workoutsToInsert = generatedPlan.map((session) => {
        const activityDate = new Date(monday)
        activityDate.setDate(monday.getDate() + session.dayIndex)

        return {
          athlete_id: athleteData.id,
          activity_date: activityDate.toISOString().split("T")[0],
          activity_type: session.sport,
          workout_type: session.workoutType,
          title: session.title,
          description: session.description,
          duration_minutes: session.duration,
          target_zone: session.targetZone,
          tss: session.tss || Math.round(session.duration * 0.8),
          intervals: { blocks: session.blocks },
          gym_exercises: session.gymExercises,
          planned: true,
          completed: false,
          source: "vyria_generated",
        }
      })

      const { error } = await supabase.from("training_activities").insert(workoutsToInsert)
      if (error) throw error

      alert("Piano settimanale salvato!")
    } catch (err) {
      console.error("Error saving week:", err)
      alert("Errore nel salvataggio")
    } finally {
      setSaving(false)
    }
  }

  const handleGymWorkoutSave = (workout: any) => {
    const newSession: TrainingSession = {
      sessionId: generateId(),
      dayIndex: selectedDay,
      sport: "gym",
      workoutType: "strength",
      title: workout.name || "Scheda Palestra",
      description: workout.notes || "",
      duration: workout.estimatedTime || 60,
      targetZone: "GYM",
      blocks: [],
      gymExercises: workout.exercises.map((ex: any) => ({
        name: ex.exercise.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest: ex.rest,
        notes: ex.notes,
      })),
    }
    setGeneratedPlan((prev) => [...prev, newSession])
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - ZONE DISPLAY
  // ═══════════════════════════════════════════════════════════════════════════

  const renderZoneBar = (zones: HRZoneData | PowerZoneData | null, type: "hr" | "power") => {
    if (!zones) return null
    const zoneKeys = Object.keys(zones) as (keyof typeof zones)[]

    return (
      <div className="space-y-2">
        {zoneKeys.map((key, idx) => {
          const zone = zones[key]
          const zoneNum = idx + 1
          const color = ZONE_COLORS[`Z${zoneNum}`] || "bg-gray-500"

          return (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}
              >
                Z{zoneNum}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{zone.name}</span>
                  <span className="text-muted-foreground">
                    {zone.min} - {zone.max === 9999 ? "Max" : zone.max} {type === "hr" ? "bpm" : "W"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${color}`}
                    style={{ width: `${Math.min(100, (zone.max / (type === "hr" ? hrMax : ftpWatts * 1.5)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - WEEKLY CALENDAR
  // ═══════════════════════════════════════════════════════════════════════════

  const renderWeeklyCalendar = () => {
    const today = new Date()
    const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

    return (
      <div className="grid grid-cols-7 gap-2">
        {DAY_NAMES.map((day, idx) => {
          const daySessions = generatedPlan.filter((s) => s.dayIndex === idx)
          const isToday = idx === todayIndex
          const isSelected = idx === selectedDay

          return (
            <Card
              key={idx}
              className={`cursor-pointer transition-all hover:shadow-md ${isToday ? "ring-2 ring-fuchsia-500" : ""} ${isSelected ? "bg-fuchsia-500/10 border-fuchsia-500" : ""}`}
              onClick={() => setSelectedDay(idx)}
            >
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs font-medium flex items-center justify-between">
                  <span className={isToday ? "text-fuchsia-500" : ""}>{day.slice(0, 3)}</span>
                  {daySessions.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1">
                      {daySessions.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 min-h-[80px]">
                {daySessions.length > 0 ? (
                  <div className="space-y-1">
                    {daySessions.map((session) => {
                      const SportIcon = SPORTS.find((s) => s.id === session.sport)?.icon || Activity
                      return (
                        <div
                          key={session.sessionId}
                          className="flex items-center gap-1 text-[10px] p-1 rounded bg-muted/50 group"
                        >
                          <div
                            className={`w-4 h-4 rounded-full ${ZONE_COLORS[session.targetZone] || "bg-fuchsia-500"} flex items-center justify-center`}
                          >
                            <SportIcon className="h-2 w-2 text-white" />
                          </div>
                          <span className="flex-1 truncate">{session.title.slice(0, 10)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSessionToDelete(session.sessionId)
                              setDeleteDialogOpen(true)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground text-center py-2">Riposo</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-fuchsia-500" />
            VYRIA Training System
          </h2>
          <p className="text-muted-foreground">Pianificazione e periodizzazione per {userName || "Atleta"}</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="zones" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Zone</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Settimana</span>
          </TabsTrigger>
          <TabsTrigger value="gym" className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Palestra</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Biblioteca</span>
          </TabsTrigger>
          <TabsTrigger value="annual" className="flex items-center gap-1">
            <CalendarRange className="h-4 w-4" />
            <span className="hidden sm:inline">Piano Annuale</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Impostazioni</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: ZONE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="zones" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-fuchsia-500" />
                  Parametri Fisiologici
                </CardTitle>
                <CardDescription>Inserisci i tuoi valori per calcolare le zone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex justify-between">
                      <span>FC Massima</span>
                      <span className="text-fuchsia-500 font-bold">{hrMax} bpm</span>
                    </Label>
                    <Slider
                      value={[hrMax]}
                      onValueChange={([v]) => setHrMax(v)}
                      min={150}
                      max={220}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="flex justify-between">
                      <span>FC Soglia (LTHR)</span>
                      <span className="text-fuchsia-500 font-bold">{hrThreshold} bpm</span>
                    </Label>
                    <Slider
                      value={[hrThreshold]}
                      onValueChange={([v]) => setHrThreshold(v)}
                      min={120}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="flex justify-between">
                      <span>FC Riposo</span>
                      <span className="text-fuchsia-500 font-bold">{hrRest} bpm</span>
                    </Label>
                    <Slider
                      value={[hrRest]}
                      onValueChange={([v]) => setHrRest(v)}
                      min={35}
                      max={80}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="flex justify-between">
                      <span>FTP (Potenza Soglia)</span>
                      <span className="text-fuchsia-500 font-bold">{ftpWatts} W</span>
                    </Label>
                    <Slider
                      value={[ftpWatts]}
                      onValueChange={([v]) => setFtpWatts(v)}
                      min={100}
                      max={450}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateZones} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Calcola Zone
                  </Button>
                  {zonesCalculated && (
                    <Button onClick={saveZones} disabled={saving} variant="outline">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Zone Display */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Zone Frequenza Cardiaca
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hrZones ? (
                    renderZoneBar(hrZones, "hr")
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Calcola le zone per visualizzarle</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Zone Potenza (Coggan)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {powerZones ? (
                    renderZoneBar(powerZones, "power")
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Calcola le zone per visualizzarle</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: SETTIMANA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="weekly" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-fuchsia-500" />
                    Piano Settimanale
                  </CardTitle>
                  <CardDescription>Settimana corrente - {generatedPlan.length} allenamenti</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResetWeekDialogOpen(true)}
                    disabled={generatedPlan.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveWeekToTraining}
                    disabled={saving || generatedPlan.length === 0}
                    className="bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Salva
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
                </div>
              ) : (
                <>
                  {renderWeeklyCalendar()}

                  {/* Quick Add */}
                  <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-3">Aggiungi allenamento a {DAY_NAMES[selectedDay]}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Select value={selectedSport} onValueChange={setSelectedSport}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORTS.map((sport) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              <div className="flex items-center gap-2">
                                <sport.icon className="h-4 w-4" />
                                {sport.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKOUT_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <Badge className={`${ZONE_COLORS[type.zone]} text-white text-[10px]`}>
                                  {type.zone}
                                </Badge>
                                {type.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => addWorkoutToDay(selectedDay)}
                        className="bg-fuchsia-600 hover:bg-fuchsia-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Aggiungi
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PALESTRA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="gym" className="space-y-6 mt-6">
          <GymExerciseLibrary
            onSaveWorkout={handleGymWorkoutSave}
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            dayNames={DAY_NAMES}
          />
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: BIBLIOTECA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="library" className="space-y-6 mt-6">
          <WorkoutLibrary
            athleteId={athleteData?.id || ""}
            onSelectWorkout={(workout) => {
              if (workout) {
                addWorkoutToDay(selectedDay, {
                  sport: workout.sport,
                  workoutType: workout.workout_type,
                  title: workout.name,
                  description: workout.description,
                  duration: workout.duration_minutes,
                  targetZone: workout.primary_zone,
                  blocks: workout.intervals?.blocks || [],
                  tss: workout.tss_estimate,
                })
              }
            }}
          />
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PIANO ANNUALE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="annual" className="space-y-6 mt-6">
          <AnnualPlanGenerator
            athleteData={athleteData}
            userName={userName}
            onPlanGenerated={(mesocycles) => {
              console.log("Plan generated:", mesocycles)
            }}
          />
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: IMPOSTAZIONI */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Impostazioni VYRIA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Sport Principale</Label>
                <Select value={athleteData?.primary_sport || "cycling"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        <div className="flex items-center gap-2">
                          <sport.icon className="h-4 w-4" />
                          {sport.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">Altre impostazioni verranno aggiunte in futuro.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Session Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare allenamento?</AlertDialogTitle>
            <AlertDialogDescription>Questa azione non può essere annullata.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && deleteSession(sessionToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Week Dialog */}
      <AlertDialog open={resetWeekDialogOpen} onOpenChange={setResetWeekDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset settimana?</AlertDialogTitle>
            <AlertDialogDescription>Tutti gli allenamenti della settimana verranno eliminati.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={resetWeek} className="bg-red-600 hover:bg-red-700">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default VyriaTrainingPlan
