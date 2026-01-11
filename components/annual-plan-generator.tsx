"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Target, TrendingUp, Plus, Trash2, ChevronRight, ChevronDown, Settings, Save, RefreshCw, CheckCircle2, Loader2, Flag, Trophy, Timer, Activity, BarChart3, Layers, Bike, Footprints, Waves, Mountain, Heart, Zap, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { AthleteDataType } from "@/components/dashboard-content"

interface EmpathyZone {
  name: string
  power_min: number
  power_max: number
  consumption?: {
    cho_g_h: number
    fat_g_h: number
    total_kcal_h: number
  }
}

interface HRZone {
  name: string
  min: number
  max: number
  color?: string
  consumption?: {
    cho_g_h: number
    fat_g_h: number
    total_kcal_h: number
  }
}

const SPORTS = [
  { id: "cycling", name: "Ciclismo", icon: Bike, supportsPower: true, color: "text-yellow-500" },
  { id: "running", name: "Corsa", icon: Footprints, supportsPower: false, color: "text-green-500" },
  { id: "swimming", name: "Nuoto", icon: Waves, supportsPower: false, color: "text-blue-500" },
  { id: "triathlon", name: "Triathlon", icon: Activity, supportsPower: true, color: "text-fuchsia-500" },
  { id: "trail_running", name: "Trail Running", icon: Mountain, supportsPower: false, color: "text-emerald-500" },
  { id: "mountain_bike", name: "MTB", icon: Bike, supportsPower: true, color: "text-orange-500" },
  { id: "gravel", name: "Gravel", icon: Bike, supportsPower: true, color: "text-amber-500" },
  { id: "cross_country_ski", name: "Sci Fondo", icon: Activity, supportsPower: false, color: "text-cyan-500" },
  { id: "ski_mountaineering", name: "Scialpinismo", icon: Mountain, supportsPower: false, color: "text-sky-500" },
  { id: "rowing", name: "Canottaggio", icon: Waves, supportsPower: true, color: "text-indigo-500" },
]

const ZONE_COLORS: Record<string, string> = {
  z1: "bg-gray-500",
  z2: "bg-blue-500",
  z3: "bg-green-500",
  z4: "bg-yellow-500",
  z5: "bg-orange-500",
  z6: "bg-red-500",
  z7: "bg-purple-500",
}

// Types
interface Event {
  id: string
  name: string
  date: string
  type: "event_a" | "event_b" | "event_c" | "training_camp" | "performance_test"
  priority: number
  powerTarget?: number
  durationMinutes?: number
  description?: string
}

interface Mesocycle {
  id: string
  name: string
  phase: "base" | "build" | "peak" | "race" | "recovery" | "transition"
  startDate: string
  endDate: string
  weeks: number
  focus: "endurance" | "threshold" | "vo2max" | "anaerobic" | "sprint" | "mixed"
  weeklyHoursTarget: number
  intensityDistribution: { [key: string]: number }
  weeksData: WeekData[]
}

interface WeekData {
  weekNumber: number
  startDate: string
  weekType: "load" | "load_high" | "recovery" | "test" | "race" | "taper"
  loadFactor: number
  plannedHours: number
  plannedTSS: number
}

interface AnnualPlanConfig {
  mesocycleLength: 3 | 4
  loadProgression: {
    week1: number
    week2: number
    week3: number
    week4?: number
  }
  baseWeeksMultiplier: number
  buildWeeksMultiplier: number
  peakWeeksMultiplier: number
  recoveryWeeksAfterRace: number
}

interface PhysiologicalGoals {
  targetFTP?: number
  targetVO2max?: number
  targetWeight?: number
  targetBodyFat?: number
  targetPowerToWeight?: number
}

interface AnnualPlanGeneratorProps {
  athleteData: AthleteDataType | null
  userName?: string | null
  onPlanGenerated?: (plan: any) => void
}

// Constants
const PHASE_COLORS: Record<string, string> = {
  base: "bg-blue-500",
  build: "bg-orange-500",
  peak: "bg-red-500",
  race: "bg-purple-500",
  recovery: "bg-green-500",
  transition: "bg-slate-500",
}

const PHASE_LABELS: Record<string, string> = {
  base: "Base",
  build: "Costruzione",
  peak: "Picco",
  race: "Gara",
  recovery: "Recupero",
  transition: "Transizione",
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  event_a: "Gara A (Obiettivo principale)",
  event_b: "Gara B (Importante)",
  event_c: "Gara C (Allenamento)",
  training_camp: "Training Camp",
  performance_test: "Test Performance",
}

const FOCUS_LABELS: Record<string, string> = {
  endurance: "Resistenza",
  threshold: "Soglia",
  vo2max: "VO2max",
  anaerobic: "Anaerobico",
  sprint: "Sprint",
  mixed: "Misto",
}

const DEFAULT_INTENSITY_DISTRIBUTION: Record<string, { [key: string]: number }> = {
  base: { z1: 25, z2: 55, z3: 15, z4: 5, z5: 0, z6: 0, z7: 0 },
  build: { z1: 15, z2: 45, z3: 20, z4: 15, z5: 5, z6: 0, z7: 0 },
  peak: { z1: 10, z2: 35, z3: 20, z4: 20, z5: 10, z6: 5, z7: 0 },
  race: { z1: 20, z2: 40, z3: 15, z4: 15, z5: 5, z6: 3, z7: 2 },
  recovery: { z1: 40, z2: 50, z3: 10, z4: 0, z5: 0, z6: 0, z7: 0 },
  transition: { z1: 50, z2: 40, z3: 10, z4: 0, z5: 0, z6: 0, z7: 0 },
}

const DEFAULT_3_WEEK_LOAD = { week1: 1.0, week2: 1.1, week3: 0.85 }
const DEFAULT_4_WEEK_LOAD = { week1: 1.0, week2: 1.1, week3: 1.15, week4: 0.8 }

export function AnnualPlanGenerator({ athleteData, userName, onPlanGenerated }: AnnualPlanGeneratorProps) {
  const supabase = createClient()

  // Plan state
  const [planName, setPlanName] = useState(`Piano ${new Date().getFullYear()}`)
  const [planYear, setPlanYear] = useState(new Date().getFullYear())
  const [mainGoalType, setMainGoalType] = useState<"event" | "performance" | "fitness">("event")
  const [mainGoalEvent, setMainGoalEvent] = useState("")
  const [mainGoalDate, setMainGoalDate] = useState("")
  const [mainGoalPower, setMainGoalPower] = useState<number | undefined>()
  const [mainGoalDuration, setMainGoalDuration] = useState<number | undefined>()

  const [primarySport, setPrimarySport] = useState("cycling")
  const [zoneType, setZoneType] = useState<"power" | "hr">("power")

  const [athleteFTP, setAthleteFTP] = useState<number | undefined>()
  const [athleteHRMax, setAthleteHRMax] = useState<number | undefined>()
  const [athleteHRThreshold, setAthleteHRThreshold] = useState<number | undefined>()
  const [athleteHRRest, setAthleteHRRest] = useState<number | undefined>()
  const [athleteVO2max, setAthleteVO2max] = useState<number | undefined>()

  const [empathyZones, setEmpathyZones] = useState<Record<string, EmpathyZone> | null>(null)
  const [hrZones, setHrZones] = useState<Record<string, HRZone> | null>(null)
  const [zonesLoaded, setZonesLoaded] = useState(false)

  // Volume targets
  const [annualHoursTarget, setAnnualHoursTarget] = useState(500)
  const [weeklyHoursMin, setWeeklyHoursMin] = useState(6)
  const [weeklyHoursMax, setWeeklyHoursMax] = useState(15)
  const [weeklyTSSCapacity, setWeeklyTSSCapacity] = useState(500)

  // Events
  const [events, setEvents] = useState<Event[]>([])

  // Mesocycles
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>([])

  // Configuration
  const [config, setConfig] = useState<AnnualPlanConfig>({
    mesocycleLength: 3,
    loadProgression: DEFAULT_3_WEEK_LOAD,
    baseWeeksMultiplier: 1.2,
    buildWeeksMultiplier: 1.0,
    peakWeeksMultiplier: 0.8,
    recoveryWeeksAfterRace: 1,
  })

  // Physiological goals
  const [physioGoals, setPhysioGoals] = useState<PhysiologicalGoals>({})

  // UI state
  const [activeTab, setActiveTab] = useState("setup")
  const [expandedMesocycle, setExpandedMesocycle] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [existingPlanId, setExistingPlanId] = useState<string | null>(null)

  const selectedSport = SPORTS.find((s) => s.id === primarySport)
  const sportSupportsPower = selectedSport?.supportsPower ?? false

  // Load athlete zones from metabolic profile
  useEffect(() => {
    const loadAthleteZones = async () => {
      if (!athleteData?.id) return

      console.log("[v0] AnnualPlan: Loading zones from DB for athlete:", athleteData.id)

      const supabase = createClient()

      const { data: profiles, error } = await supabase
        .from("metabolic_profiles")
        .select("ftp_watts, vo2max, hr_max, hr_lt2, hr_rest, empathy_zones, hr_zones, is_current, updated_at")
        .eq("athlete_id", athleteData.id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.log("[v0] AnnualPlan: Error loading profiles:", error.message)
        setZonesLoaded(true)
        return
      }

      // Find best profile: prefer one with FTP and empathy_zones
      let profile =
        profiles?.find((p) => p.ftp_watts && p.empathy_zones) || profiles?.find((p) => p.ftp_watts) || profiles?.[0]

      // Fallback to props
      if (!profile && athleteData.metabolic_profiles?.[0]) {
        console.log("[v0] AnnualPlan: Using props fallback")
        profile = athleteData.metabolic_profiles[0]
      }

      if (profile) {
        console.log(
          "[v0] AnnualPlan: Using profile with FTP:",
          profile.ftp_watts,
          "VO2max:",
          profile.vo2max,
          "HR Max:",
          profile.hr_max,
        )

        if (profile.ftp_watts) setAthleteFTP(profile.ftp_watts)
        if (profile.vo2max) setAthleteVO2max(profile.vo2max)
        if (profile.hr_max) setAthleteHRMax(profile.hr_max)
        if (profile.hr_lt2) setAthleteHRThreshold(profile.hr_lt2)
        if (profile.hr_rest) setAthleteHRRest(profile.hr_rest)

        if (profile.empathy_zones && typeof profile.empathy_zones === "object") {
          setEmpathyZones(profile.empathy_zones as Record<string, EmpathyZone>)
          console.log("[v0] AnnualPlan: Loaded empathy zones:", Object.keys(profile.empathy_zones))
        }

        if (profile.hr_zones && typeof profile.hr_zones === "object") {
          setHrZones(profile.hr_zones as Record<string, HRZone>)
          console.log("[v0] AnnualPlan: Loaded HR zones:", Object.keys(profile.hr_zones))
        }

        setZonesLoaded(true)
      } else {
        console.log("[v0] AnnualPlan: No profile found")
        setZonesLoaded(true)
      }
    }

    loadAthleteZones()

    // Load primary sport from athlete data
    if (athleteData?.primary_sport) {
      setPrimarySport(athleteData.primary_sport)
      const sport = SPORTS.find((s) => s.id === athleteData.primary_sport)
      if (sport && !sport.supportsPower) {
        setZoneType("hr")
      }
    }
  }, [athleteData])

  // Load existing plan if any
  useEffect(() => {
    const loadExistingPlan = async () => {
      if (!athleteData?.id) return

      console.log("[v0] loadExistingPlan: Loading plan for athlete", athleteData.id, "year", planYear)

      const { data: existingPlan, error } = await supabase
        .from("annual_training_plans")
        .select("*")
        .eq("athlete_id", athleteData.id)
        .eq("year", planYear)
        .maybeSingle()

      if (error) {
        console.log("[v0] loadExistingPlan: Error loading plan:", error.message)
        return
      }

      if (existingPlan) {
        console.log("[v0] loadExistingPlan: Found existing plan:", existingPlan.id, existingPlan.name)
        setExistingPlanId(existingPlan.id)
        setPlanName(existingPlan.name)

        const cfg = existingPlan.config_json || {}
        console.log("[v0] loadExistingPlan: Config keys:", Object.keys(cfg))

        setMainGoalType(cfg.main_goal_type || "event")
        setMainGoalEvent(cfg.main_goal_event || "")
        setMainGoalDate(cfg.main_goal_date || "")
        setMainGoalPower(cfg.main_goal_power_target)
        setMainGoalDuration(cfg.main_goal_duration_target)
        setAnnualHoursTarget(cfg.annual_hours_target || 500)
        setWeeklyHoursMin(cfg.weekly_hours_min || 6)
        setWeeklyHoursMax(cfg.weekly_hours_max || 15)
        setWeeklyTSSCapacity(cfg.weekly_tss_capacity || 600)
        if (cfg.plan_config) setConfig(cfg.plan_config)
        if (cfg.physio_goals) setPhysioGoals(cfg.physio_goals)
        if (cfg.sport) setPrimarySport(cfg.sport)
        if (cfg.zone_type) setZoneType(cfg.zone_type)

        // Load empathy and HR zones from config_json
        if (cfg.empathy_zones) {
          setEmpathyZones(cfg.empathy_zones)
          console.log("[v0] loadExistingPlan: Loaded empathy zones from config")
        }
        if (cfg.hr_zones) {
          setHrZones(cfg.hr_zones)
          console.log("[v0] loadExistingPlan: Loaded HR zones from config")
        }

        // Load events from config_json (since training_goals table may not exist)
        if (cfg.events && Array.isArray(cfg.events)) {
          setEvents(cfg.events)
          console.log("[v0] loadExistingPlan: Loaded", cfg.events.length, "events from config")
        }

        // Load mesocycles from config_json (since training_mesocycles table may not exist)
        if (cfg.mesocycles && Array.isArray(cfg.mesocycles)) {
          setMesocycles(cfg.mesocycles)
          console.log("[v0] loadExistingPlan: Loaded", cfg.mesocycles.length, "mesocycles from config")
        }

        console.log("[v0] loadExistingPlan: Plan loaded successfully")
      } else {
        console.log("[v0] loadExistingPlan: No existing plan found for year", planYear)
      }
    }

    loadExistingPlan()
  }, [athleteData?.id, planYear])

  // Set initial physio goals from athlete data
  useEffect(() => {
    if (athleteData?.metabolic_profiles?.[0]) {
      const profile = athleteData.metabolic_profiles[0]
      setPhysioGoals((prev) => ({
        ...prev,
        targetFTP: prev.targetFTP || (profile.ftp_watts ? Math.round(profile.ftp_watts * 1.05) : undefined),
        targetVO2max: prev.targetVO2max || (profile.vo2max ? Math.round(profile.vo2max * 1.03) : undefined),
      }))

      // Estimate weekly TSS capacity from FTP
      if (profile.ftp_watts) {
        const estimatedWeeklyTSS = Math.round(profile.ftp_watts * 1.5)
        setWeeklyTSSCapacity(estimatedWeeklyTSS)
      }
    }
    if (athleteData?.weight_kg) {
      setPhysioGoals((prev) => ({
        ...prev,
        targetWeight: prev.targetWeight || athleteData.weight_kg,
      }))
    }
  }, [athleteData])

  // Update load progression when mesocycle length changes
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      loadProgression: prev.mesocycleLength === 3 ? DEFAULT_3_WEEK_LOAD : DEFAULT_4_WEEK_LOAD,
    }))
  }, [config.mesocycleLength])

  // Add event
  const addEvent = () => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      name: "",
      date: "",
      type: "event_c",
      priority: 3,
    }
    setEvents([...events, newEvent])
  }

  // Update event
  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }

  // Remove event
  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  // Calculate weeks between dates
  const weeksBetween = (start: string, end: string): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = endDate.getTime() - startDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  }

  // Generate mesocycles automatically
  const generateMesocycles = () => {
    setGenerating(true)

    // Sort events by date
    const sortedEvents = [...events]
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Find main goal date (either from events or manual input)
    let targetDate = mainGoalDate
    if (!targetDate && sortedEvents.length > 0) {
      const mainEvent = sortedEvents.find((e) => e.type === "event_a") || sortedEvents[sortedEvents.length - 1]
      targetDate = mainEvent.date
    }

    if (!targetDate) {
      alert("Inserisci almeno una data obiettivo o un evento")
      setGenerating(false)
      return
    }

    const mesocycleWeeks = config.mesocycleLength
    const generatedMesocycles: Mesocycle[] = []

    // Start from beginning of year or 12 weeks before first event
    const yearStart = new Date(planYear, 0, 1)
    const firstEventDate = sortedEvents.length > 0 ? new Date(sortedEvents[0].date) : new Date(targetDate)
        const planStartDate = yearStart < firstEventDate ? yearStart : new Date(firstEventDate.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)

    // Calculate total weeks available
    const mainTargetDate = new Date(targetDate)
    const totalWeeks = weeksBetween(planStartDate.toISOString().split("T")[0], targetDate)

    // Allocate phases (approximate)
    const raceWeek = 1
    const peakWeeks = Math.max(2, Math.floor(totalWeeks * 0.1))
    const buildWeeks = Math.max(4, Math.floor(totalWeeks * 0.35))
    const baseWeeks = totalWeeks - peakWeeks - buildWeeks - raceWeek
    const recoveryWeeksAfterMain = 2

    let currentDate = new Date(planStartDate)
    let mesocycleIndex = 0

    // Generate BASE mesocycles
    let remainingBaseWeeks = baseWeeks
    while (remainingBaseWeeks > 0) {
      const weeks = Math.min(mesocycleWeeks, remainingBaseWeeks)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + weeks * 7 - 1)

      const weeksData = generateWeeksData(currentDate, weeks, "base", config)

      generatedMesocycles.push({
        id: crypto.randomUUID(),
        name: `Base ${mesocycleIndex + 1}`,
        phase: "base",
        startDate: currentDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        weeks,
        focus: "endurance",
        weeklyHoursTarget: weeklyHoursMin + (weeklyHoursMax - weeklyHoursMin) * 0.5,
        intensityDistribution: { ...DEFAULT_INTENSITY_DISTRIBUTION.base },
        weeksData,
      })

      currentDate = new Date(endDate)
      currentDate.setDate(currentDate.getDate() + 1)
      remainingBaseWeeks -= weeks
      mesocycleIndex++
    }

    // Generate BUILD mesocycles
    let remainingBuildWeeks = buildWeeks
    while (remainingBuildWeeks > 0) {
      const weeks = Math.min(mesocycleWeeks, remainingBuildWeeks)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + weeks * 7 - 1)

      const weeksData = generateWeeksData(currentDate, weeks, "build", config)

      generatedMesocycles.push({
        id: crypto.randomUUID(),
        name: `Build ${mesocycleIndex + 1 - Math.ceil(baseWeeks / mesocycleWeeks)}`,
        phase: "build",
        startDate: currentDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        weeks,
        focus: "threshold",
        weeklyHoursTarget: weeklyHoursMin + (weeklyHoursMax - weeklyHoursMin) * 0.7,
        intensityDistribution: { ...DEFAULT_INTENSITY_DISTRIBUTION.build },
        weeksData,
      })

      currentDate = new Date(endDate)
      currentDate.setDate(currentDate.getDate() + 1)
      remainingBuildWeeks -= weeks
      mesocycleIndex++
    }

    // Generate PEAK mesocycle
    if (peakWeeks > 0) {
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + peakWeeks * 7 - 1)

      const weeksData = generateWeeksData(currentDate, peakWeeks, "peak", config)

      generatedMesocycles.push({
        id: crypto.randomUUID(),
        name: "Peak",
        phase: "peak",
        startDate: currentDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        weeks: peakWeeks,
        focus: "vo2max",
        weeklyHoursTarget: weeklyHoursMin + (weeklyHoursMax - weeklyHoursMin) * 0.6,
        intensityDistribution: { ...DEFAULT_INTENSITY_DISTRIBUTION.peak },
        weeksData,
      })

      currentDate = new Date(endDate)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Generate RACE week
    const raceEndDate = new Date(mainTargetDate)
    const weeksData = generateWeeksData(currentDate, raceWeek, "race", config)

    generatedMesocycles.push({
      id: crypto.randomUUID(),
      name: "Race Week",
      phase: "race",
      startDate: currentDate.toISOString().split("T")[0],
      endDate: raceEndDate.toISOString().split("T")[0],
      weeks: raceWeek,
      focus: "mixed",
      weeklyHoursTarget: weeklyHoursMin * 0.5,
      intensityDistribution: { ...DEFAULT_INTENSITY_DISTRIBUTION.race },
      weeksData,
    })

    // Generate RECOVERY after race
    if (recoveryWeeksAfterMain > 0) {
      const recoveryStart = new Date(raceEndDate)
      recoveryStart.setDate(recoveryStart.getDate() + 1)
      const recoveryEnd = new Date(recoveryStart)
      recoveryEnd.setDate(recoveryEnd.getDate() + recoveryWeeksAfterMain * 7 - 1)

      const recoveryWeeksData = generateWeeksData(recoveryStart, recoveryWeeksAfterMain, "recovery", config)

      generatedMesocycles.push({
        id: crypto.randomUUID(),
        name: "Recovery",
        phase: "recovery",
        startDate: recoveryStart.toISOString().split("T")[0],
        endDate: recoveryEnd.toISOString().split("T")[0],
        weeks: recoveryWeeksAfterMain,
        focus: "endurance",
        weeklyHoursTarget: weeklyHoursMin * 0.4,
        intensityDistribution: { ...DEFAULT_INTENSITY_DISTRIBUTION.recovery },
        weeksData: recoveryWeeksData,
      })
    }

    setMesocycles(generatedMesocycles)
    setGenerating(false)
    console.log("[v0] Generated", generatedMesocycles.length, "mesocycles")
  }

  // Generate weeks data for a mesocycle
  const generateWeeksData = (
    startDate: Date,
    numWeeks: number,
    phase: string,
    config: AnnualPlanConfig
  ): WeekData[] => {
    const weeksData: WeekData[] = []
    const loadPattern =
      numWeeks === 3
        ? [config.loadProgression.week1, config.loadProgression.week2, config.loadProgression.week3]
        : [
            config.loadProgression.week1,
            config.loadProgression.week2,
            config.loadProgression.week3,
            config.loadProgression.week4 || 0.8,
          ]

    const baseHours =
      phase === "base"
        ? weeklyHoursMin + (weeklyHoursMax - weeklyHoursMin) * 0.5
        : phase === "build"
          ? weeklyHoursMin + (weeklyHoursMax - weeklyHoursMin) * 0.7
          : phase === "peak"
            ? weeklyHoursMin + (weeklyHoursMax - weeklyHoursMin) * 0.6
            : phase === "race"
              ? weeklyHoursMin * 0.5
              : weeklyHoursMin * 0.4

    const baseTSS = weeklyTSSCapacity * (phase === "race" ? 0.4 : phase === "recovery" ? 0.3 : 1)

    for (let i = 0; i < numWeeks; i++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(weekStart.getDate() + i * 7)

      const loadFactor = loadPattern[i % loadPattern.length]
      const isRecoveryWeek = loadFactor < 0.9

      weeksData.push({
        weekNumber: i + 1,
        startDate: weekStart.toISOString().split("T")[0],
        weekType: isRecoveryWeek ? "recovery" : loadFactor > 1.1 ? "load_high" : "load",
        loadFactor,
        plannedHours: Math.round(baseHours * loadFactor * 10) / 10,
        plannedTSS: Math.round(baseTSS * loadFactor),
      })
    }

    return weeksData
  }

  // Save plan to database
  const savePlan = async () => {
    if (!athleteData?.id) {
      alert("Errore: ID atleta mancante")
      return
    }

    setSaving(true)
    setSaveSuccess(false)
    console.log("[v0] savePlan: Starting save for athlete", athleteData.id)

    try {
      // Build config JSON with all plan data
      const configJson = {
        main_goal_type: mainGoalType,
        main_goal_event: mainGoalEvent,
        main_goal_date: mainGoalDate,
        main_goal_power_target: mainGoalPower,
        main_goal_duration_target: mainGoalDuration,
        annual_hours_target: annualHoursTarget,
        weekly_hours_min: weeklyHoursMin,
        weekly_hours_max: weeklyHoursMax,
        weekly_tss_capacity: weeklyTSSCapacity,
        plan_config: config,
        physio_goals: physioGoals,
        sport: primarySport,
        zone_type: zoneType,
        events: events,
        mesocycles: mesocycles,
        athlete_ftp: athleteFTP,
        athlete_hr_max: athleteHRMax,
        athlete_hr_threshold: athleteHRThreshold,
        athlete_vo2max: athleteVO2max,
        empathy_zones: empathyZones,
        hr_zones: hrZones,
      }

      // Check if plan exists
      const { data: existing, error: checkErr } = await supabase
        .from("annual_training_plans")
        .select("id")
        .eq("athlete_id", athleteData.id)
        .eq("year", planYear)
        .maybeSingle()

      if (checkErr) console.log("[v0] savePlan: Check error:", checkErr.message)

      const planId = existingPlanId || existing?.id

      if (planId) {
        console.log("[v0] savePlan: Updating existing plan", planId)
        const { error } = await supabase
          .from("annual_training_plans")
          .update({
            name: planName,
            status: "active",
            config_json: configJson,
          })
          .eq("id", planId)

        if (error) throw error
      } else {
        console.log("[v0] savePlan: Creating new plan")
        const { data: newPlan, error } = await supabase
          .from("annual_training_plans")
          .insert({
            athlete_id: athleteData.id,
            year: planYear,
            name: planName,
            status: "active",
            config_json: configJson,
          })
          .select("id")
          .single()

        if (error) throw error
        if (newPlan) setExistingPlanId(newPlan.id)
      }

      console.log("[v0] savePlan: Success")
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      if (onPlanGenerated) {
        onPlanGenerated({ mesocycles, events, physioGoals })
      }
    } catch (error: any) {
      console.error("[v0] savePlan: Error:", error.message)
      alert("Errore nel salvataggio del piano")
    } finally {
      setSaving(false)
    }
  }

  // Generate workouts for all weeks
  const generateWorkouts = async () => {
    if (!athleteData?.id || mesocycles.length === 0) {
      alert("Genera prima i mesocicli")
      return
    }

    setGenerating(true)
    console.log("[v0] generateWorkouts: Starting")

    try {
      const workouts: any[] = []

      for (const meso of mesocycles) {
        for (const week of meso.weeksData) {
          const weekWorkouts = generateWeekWorkouts(week, meso.phase, meso.intensityDistribution)
          workouts.push(...weekWorkouts)
        }
      }

      // Delete existing planned workouts
      await supabase
        .from("training_activities")
        .delete()
        .eq("athlete_id", athleteData.id)
        .eq("status", "planned")
        .gte("activity_date", `${planYear}-01-01`)
        .lte("activity_date", `${planYear}-12-31`)

      // Insert in batches
      const batchSize = 50
      for (let i = 0; i < workouts.length; i += batchSize) {
        const batch = workouts.slice(i, i + batchSize).map((w) => ({
          ...w,
          athlete_id: athleteData.id,
        }))
        await supabase.from("training_activities").insert(batch)
      }

      console.log("[v0] generateWorkouts: Inserted", workouts.length, "workouts")
      alert(`${workouts.length} allenamenti generati!`)
    } catch (error: any) {
      console.error("[v0] generateWorkouts: Error:", error.message)
      alert("Errore nella generazione")
    } finally {
      setGenerating(false)
    }
  }

  // Generate workouts for a single week
  const generateWeekWorkouts = (week: WeekData, phase: string, distribution: { [key: string]: number }): any[] => {
    const workouts: any[] = []
    const weekStart = new Date(week.startDate)
    const ftp = athleteFTP || 250

    // Workout templates by phase
    const templates: Record<string, any[]> = {
      base: [
        { day: 1, title: "Endurance Z2", zone: "Z2", durationFactor: 0.35, tssFactor: 0.3 },
        { day: 2, title: "Recovery", zone: "Z1", durationFactor: 0.1, tssFactor: 0.08 },
        { day: 4, title: "Endurance Z2", zone: "Z2", durationFactor: 0.25, tssFactor: 0.22 },
        { day: 6, title: "Long Ride", zone: "Z2", durationFactor: 0.3, tssFactor: 0.4 },
      ],
      build: [
        { day: 1, title: "Threshold 2x20'", zone: "Z4", durationFactor: 0.25, tssFactor: 0.28 },
        { day: 2, title: "Recovery", zone: "Z1", durationFactor: 0.1, tssFactor: 0.08 },
        { day: 4, title: "VO2max 5x3'", zone: "Z5", durationFactor: 0.2, tssFactor: 0.22 },
        { day: 6, title: "Endurance + Tempo", zone: "Z3", durationFactor: 0.35, tssFactor: 0.42 },
      ],
      peak: [
        { day: 1, title: "Race Pace", zone: "Z4", durationFactor: 0.25, tssFactor: 0.3 },
        { day: 2, title: "Recovery", zone: "Z1", durationFactor: 0.08, tssFactor: 0.05 },
        { day: 4, title: "VO2max Short", zone: "Z5", durationFactor: 0.18, tssFactor: 0.25 },
        { day: 5, title: "Openers", zone: "Z3", durationFactor: 0.12, tssFactor: 0.15 },
      ],
      race: [
        { day: 5, title: "Openers", zone: "Z3", durationFactor: 0.15, tssFactor: 0.1 },
        { day: 6, title: "RACE", zone: "Z4", durationFactor: 0.5, tssFactor: 0.7 },
      ],
      recovery: [
        { day: 1, title: "Easy Spin", zone: "Z1", durationFactor: 0.3, tssFactor: 0.2 },
        { day: 4, title: "Light Activity", zone: "Z1", durationFactor: 0.2, tssFactor: 0.15 },
      ],
      transition: [
        { day: 2, title: "Easy Activity", zone: "Z1", durationFactor: 0.25, tssFactor: 0.15 },
        { day: 5, title: "Fun Ride", zone: "Z2", durationFactor: 0.25, tssFactor: 0.2 },
      ],
    }

    const phaseTemplates = templates[phase] || templates.base

    for (const template of phaseTemplates) {
      const workoutDate = new Date(weekStart)
      workoutDate.setDate(workoutDate.getDate() + template.day)

      workouts.push({
        title: template.title,
        workout_type: primarySport,
        activity_date: workoutDate.toISOString().split("T")[0],
        planned_duration_minutes: Math.round(week.plannedHours * 60 * template.durationFactor),
        target_tss: Math.round(week.plannedTSS * template.tssFactor),
        target_zone: template.zone,
        status: "planned",
        phase: phase,
      })
    }

    return workouts
  }

  // Timeline visualization helpers
  const getPhaseWidth = (weeks: number) => `${(weeks / 52) * 100}%`
  
  const totalPlannedHours = useMemo(() => {
    return mesocycles.reduce((sum, meso) => {
      return sum + meso.weeksData.reduce((wSum, w) => wSum + w.plannedHours, 0)
    }, 0)
  }, [mesocycles])

  const totalPlannedTSS = useMemo(() => {
    return mesocycles.reduce((sum, meso) => {
      return sum + meso.weeksData.reduce((wSum, w) => wSum + w.plannedTSS, 0)
    }, 0)
  }, [mesocycles])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-fuchsia-500" />
            Piano Annuale {planYear}
          </h2>
          <p className="text-muted-foreground">
            {userName ? `Piano di ${userName}` : "Configura e genera il tuo piano di allenamento"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generateMesocycles} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Genera Piano
          </Button>
          <Button variant="outline" onClick={generateWorkouts} disabled={generating || mesocycles.length === 0}>
            <Activity className="mr-2 h-4 w-4" />
            Genera Allenamenti
          </Button>
          <Button onClick={savePlan} disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-700">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saveSuccess ? "Salvato!" : "Salva Piano"}
          </Button>
        </div>
      </div>

      {/* Stats summary */}
      {mesocycles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Mesocicli</p>
                  <p className="text-xl font-bold">{mesocycles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ore Totali</p>
                  <p className="text-xl font-bold">{Math.round(totalPlannedHours)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">TSS Totale</p>
                  <p className="text-xl font-bold">{Math.round(totalPlannedTSS).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-fuchsia-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Eventi</p>
                  <p className="text-xl font-bold">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="events">Eventi</TabsTrigger>
          <TabsTrigger value="mesocycles">Mesocicli</TabsTrigger>
          <TabsTrigger value="goals">Obiettivi</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurazione Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Piano</Label>
                  <Input value={planName} onChange={(e) => setPlanName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Anno</Label>
                  <Select value={planYear.toString()} onValueChange={(v) => setPlanYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                        {new Date().getFullYear() - 1}
                      </SelectItem>
                      <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                      <SelectItem value={(new Date().getFullYear() + 1).toString()}>
                        {new Date().getFullYear() + 1}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sport Principale</Label>
                  <Select value={primarySport} onValueChange={setPrimarySport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          <div className="flex items-center gap-2">
                            <sport.icon className={`h-4 w-4 ${sport.color}`} />
                            {sport.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo Zone</Label>
                  <Select
                    value={zoneType}
                    onValueChange={(v) => setZoneType(v as "power" | "hr")}
                    disabled={!sportSupportsPower}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sportSupportsPower && <SelectItem value="power">Potenza (Watt)</SelectItem>}
                      <SelectItem value="hr">Frequenza Cardiaca</SelectItem>
                    </SelectContent>
                  </Select>
                  {!sportSupportsPower && (
                    <p className="text-xs text-muted-foreground">
                      {selectedSport?.name} non supporta la misurazione della potenza
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Athlete Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Dati Atleta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {zonesLoaded ? (
                  <>
                    {zoneType === "power" && athleteFTP && (
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">FTP Attuale</span>
                        <Badge variant="secondary" className="text-lg">
                          {athleteFTP}W
                        </Badge>
                      </div>
                    )}
                    {athleteHRMax && (
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">HR Max</span>
                        <Badge variant="secondary" className="text-lg">
                          {athleteHRMax} bpm
                        </Badge>
                      </div>
                    )}
                    {athleteHRThreshold && (
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">HR Soglia (LT2)</span>
                        <Badge variant="secondary" className="text-lg">
                          {athleteHRThreshold} bpm
                        </Badge>
                      </div>
                    )}
                    {athleteVO2max && (
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">VO2max</span>
                        <Badge variant="secondary" className="text-lg">
                          {athleteVO2max} ml/kg/min
                        </Badge>
                      </div>
                    )}
                    {empathyZones && (
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                        <span className="text-sm text-green-400">Zone Empathy</span>
                        <Badge className="bg-green-600">{Object.keys(empathyZones).length} zone</Badge>
                      </div>
                    )}
                    {hrZones && (
                      <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-sm text-blue-400">Zone HR</span>
                        <Badge className="bg-blue-600">{Object.keys(hrZones).length} zone</Badge>
                      </div>
                    )}
                    {!athleteFTP && !athleteHRMax && (
                      <div className="text-center p-4 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nessun dato fisiologico disponibile</p>
                        <p className="text-xs">Completa il profilo metabolico</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Volume Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Volume e Carico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ore Annuali Target: {annualHoursTarget}h</Label>
                    <Slider
                      value={[annualHoursTarget]}
                      onValueChange={([v]) => setAnnualHoursTarget(v)}
                      min={200}
                      max={1000}
                      step={25}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Ore Settimanali: {weeklyHoursMin}h - {weeklyHoursMax}h
                    </Label>
                    <div className="flex gap-4">
                      <Slider
                        value={[weeklyHoursMin]}
                        onValueChange={([v]) => setWeeklyHoursMin(Math.min(v, weeklyHoursMax - 1))}
                        min={3}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <Slider
                        value={[weeklyHoursMax]}
                        onValueChange={([v]) => setWeeklyHoursMax(Math.max(v, weeklyHoursMin + 1))}
                        min={5}
                        max={30}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>TSS Settimanale Sostenibile: {weeklyTSSCapacity}</Label>
                    <Slider
                      value={[weeklyTSSCapacity]}
                      onValueChange={([v]) => setWeeklyTSSCapacity(v)}
                      min={200}
                      max={1200}
                      step={25}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durata Mesociclo</Label>
                    <Select
                      value={config.mesocycleLength.toString()}
                      onValueChange={(v) => setConfig({ ...config, mesocycleLength: parseInt(v) as 3 | 4 })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 settimane (2+1)</SelectItem>
                        <SelectItem value="4">4 settimane (3+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Pattern Carico Settimane</Label>
                <div className="flex gap-4">
                  {config.mesocycleLength === 3 ? (
                    <>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 1</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week1}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week1: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 2</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week2}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week2: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 3 (Rec)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week3}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week3: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 1</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week1}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week1: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 2</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week2}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week2: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 3</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week3}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week3: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Sett. 4 (Rec)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={config.loadProgression.week4 || 0.8}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              loadProgression: { ...config.loadProgression, week4: parseFloat(e.target.value) },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
                {/* Events Tab */}
        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Eventi e Gare
                </span>
                <Button size="sm" onClick={addEvent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Evento
                </Button>
              </CardTitle>
              <CardDescription>Inserisci le gare e gli eventi importanti per generare il piano</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nessun evento inserito</p>
                  <p className="text-sm">Aggiungi almeno un evento obiettivo per generare il piano</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            event.type === "event_a"
                              ? "bg-fuchsia-600"
                              : event.type === "event_b"
                                ? "bg-orange-600"
                                : event.type === "event_c"
                                  ? "bg-blue-600"
                                  : "bg-slate-600"
                          }
                        >
                          {EVENT_TYPE_LABELS[event.type]}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeEvent(event.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome Evento</Label>
                          <Input
                            value={event.name}
                            onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                            placeholder="es. Granfondo Dolomiti"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Data</Label>
                          <Input
                            type="date"
                            value={event.date}
                            onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Select
                            value={event.type}
                            onValueChange={(v) =>
                              updateEvent(event.id, {
                                type: v as Event["type"],
                                priority: v === "event_a" ? 1 : v === "event_b" ? 2 : 3,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="event_a">Gara A (Obiettivo)</SelectItem>
                              <SelectItem value="event_b">Gara B (Importante)</SelectItem>
                              <SelectItem value="event_c">Gara C (Allenamento)</SelectItem>
                              <SelectItem value="training_camp">Training Camp</SelectItem>
                              <SelectItem value="performance_test">Test Performance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {(event.type === "event_a" || event.type === "event_b") && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Potenza Target (W)</Label>
                            <Input
                              type="number"
                              value={event.powerTarget || ""}
                              onChange={(e) =>
                                updateEvent(event.id, { powerTarget: parseInt(e.target.value) || undefined })
                              }
                              placeholder="es. 250"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Durata (minuti)</Label>
                            <Input
                              type="number"
                              value={event.durationMinutes || ""}
                              onChange={(e) =>
                                updateEvent(event.id, { durationMinutes: parseInt(e.target.value) || undefined })
                              }
                              placeholder="es. 180"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mesocycles Tab */}
        <TabsContent value="mesocycles" className="space-y-6 mt-6">
          {mesocycles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">Nessun mesociclo generato</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Inserisci almeno un evento e clicca "Genera Piano"
                </p>
                <Button onClick={generateMesocycles} disabled={generating || events.length === 0}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Genera Mesocicli
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mesocycles.map((meso) => (
                <Card key={meso.id} className="overflow-hidden">
                  <div
                    className={`h-2 ${PHASE_COLORS[meso.phase]}`}
                    style={{ width: "100%" }}
                  />
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedMesocycle(expandedMesocycle === meso.id ? null : meso.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={PHASE_COLORS[meso.phase]}>{PHASE_LABELS[meso.phase]}</Badge>
                        <CardTitle className="text-base">{meso.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{meso.weeks} settimane</span>
                        <span>{meso.startDate} → {meso.endDate}</span>
                        {expandedMesocycle === meso.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedMesocycle === meso.id && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Focus</p>
                          <p className="font-medium">{FOCUS_LABELS[meso.focus]}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Ore/Settimana</p>
                          <p className="font-medium">{meso.weeklyHoursTarget.toFixed(1)}h</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Distribuzione Zone</p>
                          <div className="flex gap-1 mt-1">
                            {Object.entries(meso.intensityDistribution).map(([zone, pct]) =>
                              pct > 0 ? (
                                <div
                                  key={zone}
                                  className={`h-4 ${ZONE_COLORS[zone]} rounded`}
                                  style={{ width: `${pct}%` }}
                                  title={`${zone.toUpperCase()}: ${pct}%`}
                                />
                              ) : null
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Settimane</Label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          {meso.weeksData.map((week) => (
                            <div
                              key={week.weekNumber}
                              className={`p-3 rounded-lg border ${
                                week.weekType === "recovery"
                                  ? "border-green-500/50 bg-green-500/10"
                                  : week.weekType === "load_high"
                                    ? "border-orange-500/50 bg-orange-500/10"
                                    : "border-border"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Sett. {week.weekNumber}</span>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(week.loadFactor * 100)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{week.plannedHours}h / {week.plannedTSS} TSS</p>
                              <p className="text-xs text-muted-foreground">{week.startDate}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-fuchsia-500" />
                  Obiettivi Fisiologici
                </CardTitle>
                <CardDescription>Target da raggiungere entro fine piano</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sportSupportsPower && (
                  <div className="space-y-2">
                    <Label>FTP Target (W)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={physioGoals.targetFTP || ""}
                        onChange={(e) =>
                          setPhysioGoals({ ...physioGoals, targetFTP: parseInt(e.target.value) || undefined })
                        }
                        placeholder="es. 300"
                      />
                      {athleteFTP && (
                        <Badge variant="outline">
                          Attuale: {athleteFTP}W (+
                          {physioGoals.targetFTP ? Math.round(((physioGoals.targetFTP - athleteFTP) / athleteFTP) * 100) : 0}
                          %)
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>VO2max Target (ml/kg/min)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={physioGoals.targetVO2max || ""}
                      onChange={(e) =>
                        setPhysioGoals({ ...physioGoals, targetVO2max: parseFloat(e.target.value) || undefined })
                      }
                      placeholder="es. 55"
                    />
                    {athleteVO2max && <Badge variant="outline">Attuale: {athleteVO2max}</Badge>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Peso Target (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={physioGoals.targetWeight || ""}
                    onChange={(e) =>
                      setPhysioGoals({ ...physioGoals, targetWeight: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="es. 72"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body Fat Target (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={physioGoals.targetBodyFat || ""}
                    onChange={(e) =>
                      setPhysioGoals({ ...physioGoals, targetBodyFat: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="es. 12"
                  />
                </div>
                {sportSupportsPower && physioGoals.targetFTP && physioGoals.targetWeight && (
                  <div className="p-3 bg-fuchsia-500/10 rounded-lg">
                    <p className="text-sm text-fuchsia-400">W/kg Target</p>
                    <p className="text-2xl font-bold text-fuchsia-400">
                      {(physioGoals.targetFTP / physioGoals.targetWeight).toFixed(2)} W/kg
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Obiettivo Principale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo Obiettivo</Label>
                  <Select
                    value={mainGoalType}
                    onValueChange={(v) => setMainGoalType(v as "event" | "performance" | "fitness")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Evento/Gara</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="fitness">Fitness Generale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {mainGoalType === "event" && (
                  <>
                    <div className="space-y-2">
                      <Label>Nome Evento</Label>
                      <Input
                        value={mainGoalEvent}
                        onChange={(e) => setMainGoalEvent(e.target.value)}
                        placeholder="es. Maratona Dles Dolomites"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Evento</Label>
                      <Input type="date" value={mainGoalDate} onChange={(e) => setMainGoalDate(e.target.value)} />
                    </div>
                    {sportSupportsPower && (
                      <div className="space-y-2">
                        <Label>Potenza Target Gara (W)</Label>
                        <Input
                          type="number"
                          value={mainGoalPower || ""}
                          onChange={(e) => setMainGoalPower(parseInt(e.target.value) || undefined)}
                          placeholder="es. 220"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Durata Prevista (minuti)</Label>
                      <Input
                        type="number"
                        value={mainGoalDuration || ""}
                        onChange={(e) => setMainGoalDuration(parseInt(e.target.value) || undefined)}
                        placeholder="es. 300"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Timeline Annuale
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mesocycles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Genera il piano per visualizzare la timeline</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Phase Legend */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(PHASE_LABELS).map(([phase, label]) => (
                      <div key={phase} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${PHASE_COLORS[phase]}`} />
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative">
                    <div className="flex h-12 rounded-lg overflow-hidden">
                      {mesocycles.map((meso) => (
                        <div
                          key={meso.id}
                          className={`${PHASE_COLORS[meso.phase]} flex items-center justify-center text-white text-xs font-medium transition-all hover:opacity-80 cursor-pointer`}
                          style={{ width: getPhaseWidth(meso.weeks) }}
                          title={`${meso.name}: ${meso.startDate} - ${meso.endDate}`}
                        >
                          {meso.weeks >= 3 && meso.name}
                        </div>
                      ))}
                    </div>

                    {/* Events markers */}
                    <div className="relative h-8 mt-2">
                      {events
                        .filter((e) => e.date)
                        .map((event) => {
                          const eventDate = new Date(event.date)
                          const yearStart = new Date(planYear, 0, 1)
                          const yearEnd = new Date(planYear, 11, 31)
                          const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
                          const eventDay = (eventDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
                          const leftPercent = (eventDay / totalDays) * 100

                          return (
                            <div
                              key={event.id}
                              className="absolute -top-2 transform -translate-x-1/2"
                              style={{ left: `${leftPercent}%` }}
                              title={`${event.name} - ${event.date}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 border-white ${
                                  event.type === "event_a"
                                    ? "bg-fuchsia-500"
                                    : event.type === "event_b"
                                      ? "bg-orange-500"
                                      : "bg-blue-500"
                                }`}
                              />
                              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                                {event.name || "Evento"}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Monthly breakdown */}
                  <div className="mt-8">
                    <Label className="text-sm mb-3 block">Riepilogo Mensile</Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthStart = new Date(planYear, i, 1)
                        const monthEnd = new Date(planYear, i + 1, 0)
                        const monthMesos = mesocycles.filter((m) => {
                          const mStart = new Date(m.startDate)
                          const mEnd = new Date(m.endDate)
                          return mStart <= monthEnd && mEnd >= monthStart
                        })
                        const primaryPhase = monthMesos[0]?.phase || "transition"

                        return (
                          <div key={i} className="text-center">
                            <div className={`h-8 rounded ${PHASE_COLORS[primaryPhase]} mb-1`} />
                            <span className="text-xs text-muted-foreground">
                              {monthStart.toLocaleString("it", { month: "short" })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
                {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Timeline Annuale
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mesocycles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Genera il piano per visualizzare la timeline</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Phase Legend */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(PHASE_LABELS).map(([phase, label]) => (
                      <div key={phase} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${PHASE_COLORS[phase]}`} />
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative">
                    <div className="flex h-12 rounded-lg overflow-hidden">
                      {mesocycles.map((meso) => (
                        <div
                          key={meso.id}
                          className={`${PHASE_COLORS[meso.phase]} flex items-center justify-center text-white text-xs font-medium transition-all hover:opacity-80 cursor-pointer`}
                          style={{ width: getPhaseWidth(meso.weeks) }}
                          title={`${meso.name}: ${meso.startDate} - ${meso.endDate}`}
                        >
                          {meso.weeks >= 3 && meso.name}
                        </div>
                      ))}
                    </div>

                    {/* Month labels */}
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      {["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"].map(
                        (month) => (
                          <span key={month}>{month}</span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Events on timeline */}
                  {events.filter((e) => e.date).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Eventi</h4>
                      {events
                        .filter((e) => e.date)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((event) => {
                          const eventDate = new Date(event.date)
                          const yearStart = new Date(planYear, 0, 1)
                          const yearEnd = new Date(planYear, 11, 31)
                          const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
                          const eventDay = (eventDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
                          const leftPercent = Math.max(0, Math.min(100, (eventDay / totalDays) * 100))

                          return (
                            <div key={event.id} className="relative h-8">
                              <div
                                className="absolute top-0 flex items-center gap-2"
                                style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
                              >
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    event.type === "event_a"
                                      ? "bg-fuchsia-500"
                                      : event.type === "event_b"
                                        ? "bg-orange-500"
                                        : event.type === "event_c"
                                          ? "bg-blue-500"
                                          : "bg-slate-500"
                                  }`}
                                />
                                <div className="text-xs whitespace-nowrap">
                                  <p className="font-medium">{event.name || "Evento"}</p>
                                  <p className="text-muted-foreground">
                                    {new Date(event.date).toLocaleDateString("it-IT")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}

                  {/* Weekly TSS chart */}
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">Distribuzione TSS Settimanale</h4>
                    <div className="h-40 flex items-end gap-1">
                      {mesocycles.flatMap((meso) =>
                        meso.weeksData.map((week, wIndex) => {
                          const maxTSS = Math.max(...mesocycles.flatMap((m) => m.weeksData.map((w) => w.plannedTSS)))
                          const height = (week.plannedTSS / maxTSS) * 100
                          return (
                            <div
                              key={`${meso.id}-${week.weekNumber}`}
                              className={`flex-1 ${PHASE_COLORS[meso.phase]} rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative`}
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 text-xs">
                                <p className="font-medium">
                                  {meso.name} - Sett {week.weekNumber}
                                </p>
                                <p>{week.plannedTSS} TSS</p>
                                <p>{week.plannedHours}h</p>
                                <p className="text-muted-foreground">{week.weekType}</p>
                              </div>
                            </div>
                          )
                        }),
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        {mesocycles.length > 0 &&
                          new Date(mesocycles[0].startDate).toLocaleDateString("it-IT", {
                            month: "short",
                          })}
                      </span>
                      <span>
                        {mesocycles.length > 0 &&
                          new Date(mesocycles[mesocycles.length - 1].endDate).toLocaleDateString("it-IT", {
                            month: "short",
                          })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
