"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Zap, Bike, Dumbbell, Clock, Target, CheckCircle2, Circle } from "lucide-react"
import { WorkoutDetailModal } from "@/components/workout-detail-modal"
import { createClient } from "@/lib/supabase/client"
import type { AthleteDataType, WorkoutType } from "@/components/dashboard-content"

interface WeeklyTrainingProps {
  athleteData: AthleteDataType | null
  userName: string | null | undefined
  workouts: WorkoutType[] | null
}

const dayNames = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]

const getZoneColor = (zone: string | null) => {
  switch (zone?.toUpperCase()) {
    case "Z1":
      return "bg-slate-500"
    case "Z2":
      return "bg-green-500"
    case "Z3":
      return "bg-yellow-500"
    case "Z4":
      return "bg-orange-500"
    case "Z5":
      return "bg-red-500"
    case "Z6":
      return "bg-red-600"
    case "Z7":
      return "bg-red-800"
    case "MIXED":
      return "bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
    case "GYM":
    case "STRENGTH":
      return "bg-orange-600"
    default:
      return "bg-fuchsia-500"
  }
}

const getWorkoutIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "cycling":
    case "bike":
      return <Bike className="h-5 w-5" />
    case "gym":
    case "strength":
    case "palestra":
      return <Dumbbell className="h-5 w-5" />
    default:
      return <CalendarDays className="h-5 w-5" />
  }
}

const getCurrentWeekRange = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const formatDate = (d: Date) => d.toLocaleDateString("it-IT", { day: "numeric", month: "short" })
  return `${formatDate(monday)} - ${formatDate(sunday)}`
}

export const WeeklyTraining = ({ athleteData, userName, workouts }: WeeklyTrainingProps) => {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null)
  const [selectedDayName, setSelectedDayName] = useState<string>("")
  const [athleteFTP, setAthleteFTP] = useState<number>(300)

  const hasTrainingPlan = workouts && workouts.length > 0
  const weekRange = getCurrentWeekRange()

  const today = new Date()
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

  useEffect(() => {
    const loadAthleteFTP = async () => {
      if (!athleteData?.id) return

      const supabase = createClient()

      const profiles = athleteData.metabolic_profiles
      if (profiles && profiles.length > 0) {
        const profileWithFTP = profiles.find((p) => p.ftp_watts && p.ftp_watts > 0)
        if (profileWithFTP?.ftp_watts) {
          setAthleteFTP(profileWithFTP.ftp_watts)
          return
        }
      }

      const { data: dbProfiles } = await supabase
        .from("metabolic_profiles")
        .select("ftp_watts")
        .eq("athlete_id", athleteData.id)
        .not("ftp_watts", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)

      if (dbProfiles && dbProfiles.length > 0 && dbProfiles[0].ftp_watts) {
        setAthleteFTP(dbProfiles[0].ftp_watts)
      }
    }

    loadAthleteFTP()
  }, [athleteData?.id, athleteData?.metabolic_profiles])

  const handleDayClick = (workout: WorkoutType | undefined, dayIndex: number) => {
    if (workout) {
      setSelectedWorkout(workout)
      setSelectedDayName(dayNames[dayIndex])
    }
  }

  if (!hasTrainingPlan) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <CalendarDays className="h-16 w-16 text-fuchsia-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Piano di Allenamento</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Il piano di allenamento viene generato automaticamente da VYRIA in base al tuo programma annuale. Vai alla
            tab <strong>VYRIA</strong> per creare il piano e generare la settimana.
          </p>
          <div className="flex gap-4 mb-8">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700">
              <Zap className="mr-2 h-4 w-4" />
              Vai a VYRIA
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
  const totalTSS = workouts.reduce((sum, w) => sum + ((w as any).tss || 0), 0)
  const cyclingWorkouts = workouts.filter((w) => w.workout_type === "cycling" || w.workout_type === "bike")
  const gymWorkouts = workouts.filter(
    (w) => w.workout_type === "gym" || w.workout_type === "strength" || w.workout_type === "palestra",
  )
  const completedWorkouts = workouts.filter((w) => (w as any).completed)

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Piano Settimanale</h2>
          <p className="text-muted-foreground">
            {weekRange} - {userName || "Atleta"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="border-fuchsia-500 text-fuchsia-400">
            {Math.round(totalMinutes / 60)}h totali
          </Badge>
          {totalTSS > 0 && (
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              {totalTSS} TSS
            </Badge>
          )}
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            {cyclingWorkouts.length} bike
          </Badge>
          <Badge variant="outline" className="border-orange-500 text-orange-400">
            {gymWorkouts.length} palestra
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-400">
            {completedWorkouts.length}/{workouts.length} completati
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-fuchsia-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Settimanale</p>
                <p className="text-2xl font-bold">
                  {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {totalTSS > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TSS Settimanale</p>
                  <p className="text-2xl font-bold">{totalTSS}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bike className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessioni Bike</p>
                <p className="text-2xl font-bold">{cyclingWorkouts.length} allenamenti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessioni Palestra</p>
                <p className="text-2xl font-bold">{gymWorkouts.length} allenamenti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {dayNames.map((dayName, dayIndex) => {
          const dayWorkout = workouts.find((w) => w.day_of_week === dayIndex)
          const isToday = dayIndex === todayIndex
          const isPast = dayIndex < todayIndex
          const isCompleted = dayWorkout && (dayWorkout as any).completed

          return (
            <Card
              key={dayIndex}
              className={`
                cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg
                ${dayWorkout ? "border-fuchsia-500/50" : "opacity-60"} 
                ${isToday ? "ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background" : ""}
                ${isCompleted ? "bg-green-500/5" : ""}
              `}
              onClick={() => handleDayClick(dayWorkout, dayIndex)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className={isToday ? "text-fuchsia-500 font-bold" : ""}>
                    {dayName}
                    {isToday && <span className="ml-1 text-xs">(Oggi)</span>}
                  </span>
                  {dayWorkout && (
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : isPast ? (
                        <Circle className="h-4 w-4 text-yellow-500" />
                      ) : null}
                      <Badge className={`${getZoneColor(dayWorkout.target_zone)} text-white text-xs`}>
                        {dayWorkout.target_zone || dayWorkout.workout_type}
                      </Badge>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayWorkout ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getWorkoutIcon(dayWorkout.workout_type)}
                      <span className="font-semibold text-sm">{dayWorkout.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{dayWorkout.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {dayWorkout.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dayWorkout.duration_minutes >= 60
                            ? `${Math.floor(dayWorkout.duration_minutes / 60)}h ${dayWorkout.duration_minutes % 60}m`
                            : `${dayWorkout.duration_minutes}m`}
                        </div>
                      )}
                      {(dayWorkout as any).tss && (
                        <Badge variant="secondary" className="text-xs">
                          {(dayWorkout as any).tss} TSS
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">Riposo</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <WorkoutDetailModal
        workout={selectedWorkout as any}
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        dayName={selectedDayName}
        athleteFTP={athleteFTP}
      />
    </div>
  )
}
