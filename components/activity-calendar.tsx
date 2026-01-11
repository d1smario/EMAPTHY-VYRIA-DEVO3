"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns"
import { it } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Bike,
  Sun as Run,
  Dumbbell,
  Waves,
  Calendar,
  TrendingUp,
  Heart,
  Zap,
  Plus,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getClient } from "@/lib/supabase/client"

interface Activity {
  id: string
  activity_date: string
  activity_type: string
  title: string
  duration_minutes: number | null
  distance_km: number | null
  tss: number | null
  average_power: number | null
  average_hr: number | null
  completed: boolean
  source: string
}

interface DailyMetric {
  metric_date: string
  tss_total: number
  ctl: number | null
  atl: number | null
  tsb: number | null
  recovery_score: number | null
  hrv_ms: number | null
  activities_count: number
}

interface ActivityCalendarProps {
  athleteId: string | undefined
  onSelectDate: (date: Date) => void
  onSelectActivity: (activity: Activity) => void
  selectedDate: Date | null
}

const activityIcons: Record<string, React.ReactNode> = {
  cycling: <Bike className="h-3 w-3" />,
  running: <Run className="h-3 w-3" />,
  swimming: <Waves className="h-3 w-3" />,
  strength: <Dumbbell className="h-3 w-3" />,
}

const getTssColor = (tss: number): string => {
  if (tss === 0) return "bg-muted"
  if (tss < 50) return "bg-emerald-500/20 border-emerald-500/50"
  if (tss < 100) return "bg-yellow-500/20 border-yellow-500/50"
  if (tss < 150) return "bg-orange-500/20 border-orange-500/50"
  return "bg-red-500/20 border-red-500/50"
}

const getTsbColor = (tsb: number | null): string => {
  if (tsb === null) return "text-muted-foreground"
  if (tsb > 25) return "text-emerald-400"
  if (tsb > 5) return "text-emerald-500"
  if (tsb > -10) return "text-yellow-500"
  if (tsb > -30) return "text-orange-500"
  return "text-red-500"
}

export function ActivityCalendar({ athleteId, onSelectDate, onSelectActivity, selectedDate }: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activities, setActivities] = useState<Activity[]>([])
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const firstDayOfWeek = startOfMonth(currentMonth).getDay()
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  useEffect(() => {
    if (!athleteId) return

    const fetchData = async () => {
      setIsLoading(true)
      const supabase = getClient()
      if (!supabase) return

      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd")
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd")

      const { data: activitiesData } = await supabase
        .from("training_activities")
        .select(
          "id, activity_date, activity_type, title, duration_minutes, distance_km, tss, average_power, average_hr, completed, source",
        )
        .eq("athlete_id", athleteId)
        .gte("activity_date", startDate)
        .lte("activity_date", endDate)
        .order("activity_date", { ascending: true })

      if (activitiesData) {
        setActivities(activitiesData)
      }

      const { data: metricsData } = await supabase
        .from("daily_metrics")
        .select("metric_date, tss_total, ctl, atl, tsb, recovery_score, hrv_ms, activities_count")
        .eq("athlete_id", athleteId)
        .gte("metric_date", startDate)
        .lte("metric_date", endDate)

      if (metricsData) {
        setDailyMetrics(metricsData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [athleteId, currentMonth])

  const getActivitiesForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return activities.filter((a) => a.activity_date === dateStr)
  }

  const getMetricsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return dailyMetrics.find((m) => m.metric_date === dateStr)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSyncing(false)
  }

  const currentWeekStats = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)

    const weekActivities = activities.filter((a) => {
      const actDate = parseISO(a.activity_date)
      return actDate >= weekStart && actDate <= now
    })

    return {
      totalTss: weekActivities.reduce((sum, a) => sum + (a.tss || 0), 0),
      totalDuration: weekActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0),
      totalDistance: weekActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0),
      activitiesCount: weekActivities.length,
    }
  }, [activities])

  const latestMetrics = useMemo(() => {
    if (dailyMetrics.length === 0) return null
    return dailyMetrics.reduce((latest, m) => {
      if (!latest || m.metric_date > latest.metric_date) return m
      return latest
    }, dailyMetrics[0])
  }, [dailyMetrics])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>CTL (Fitness)</span>
            </div>
            <p className="text-xl font-bold">{latestMetrics?.ctl?.toFixed(0) || "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Zap className="h-3 w-3" />
              <span>ATL (Fatigue)</span>
            </div>
            <p className="text-xl font-bold">{latestMetrics?.atl?.toFixed(0) || "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Heart className="h-3 w-3" />
              <span>TSB (Form)</span>
            </div>
            <p className={cn("text-xl font-bold", getTsbColor(latestMetrics?.tsb ?? null))}>
              {latestMetrics?.tsb !== null && latestMetrics?.tsb !== undefined
                ? (latestMetrics.tsb > 0 ? "+" : "") + latestMetrics.tsb.toFixed(0)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>Week TSS</span>
            </div>
            <p className="text-xl font-bold">{currentWeekStats.totalTss}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy", { locale: it })}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
                Sync
              </Button>
              <Button size="sm" onClick={() => onSelectDate(new Date())}>
                <Plus className="h-4 w-4 mr-2" />
                Nuova
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const dayActivities = getActivitiesForDay(day)
              const metrics = getMetricsForDay(day)
              const totalTss = dayActivities.reduce((sum, a) => sum + (a.tss || 0), 0)
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onSelectDate(day)}
                  className={cn(
                    "aspect-square p-1 rounded-lg border transition-all relative",
                    "hover:border-primary/50 hover:bg-accent/50",
                    isToday(day) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isSelected && "border-primary bg-primary/10",
                    dayActivities.length > 0 ? getTssColor(totalTss) : "border-border/30",
                    isLoading && "animate-pulse",
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span className={cn("text-xs font-medium", isToday(day) && "text-primary")}>
                      {format(day, "d")}
                    </span>

                    {dayActivities.length > 0 && (
                      <div className="flex-1 flex flex-col justify-end gap-0.5">
                        <div className="flex items-center justify-center gap-0.5">
                          {dayActivities.slice(0, 3).map((activity, i) => (
                            <span key={i} className="text-primary">
                              {activityIcons[activity.activity_type] || <Bike className="h-2.5 w-2.5" />}
                            </span>
                          ))}
                        </div>
                        {totalTss > 0 && <span className="text-[10px] font-medium text-center">{totalTss}</span>}
                      </div>
                    )}

                    {metrics?.recovery_score && (
                      <div className="absolute top-0.5 right-0.5">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            metrics.recovery_score >= 67
                              ? "bg-emerald-500"
                              : metrics.recovery_score >= 34
                                ? "bg-yellow-500"
                                : "bg-red-500",
                          )}
                        />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
              <span>{"<50 TSS"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
              <span>50-100</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/50" />
              <span>100-150</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
              <span>{">150"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{format(selectedDate, "EEEE d MMMM", { locale: it })}</CardTitle>
          </CardHeader>
          <CardContent>
            {getActivitiesForDay(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getActivitiesForDay(selectedDate).map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => onSelectActivity(activity)}
                    className="w-full p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {activityIcons[activity.activity_type] || <Bike className="h-4 w-4" />}
                        <span className="font-medium">{activity.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {activity.duration_minutes && (
                          <span>
                            {Math.floor(activity.duration_minutes / 60)}h {activity.duration_minutes % 60}m
                          </span>
                        )}
                        {activity.distance_km && <span>{activity.distance_km.toFixed(1)} km</span>}
                        {activity.tss && <Badge>{activity.tss} TSS</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {activity.average_power && <span>{activity.average_power}W avg</span>}
                      {activity.average_hr && <span>{activity.average_hr} bpm avg</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nessuna attività in questo giorno</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => onSelectDate(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi attività
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
