"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Zap,
  Bike,
  Dumbbell,
  Heart,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Calendar,
  Clock,
  Gauge,
  Plus,
  Trash2,
  GripVertical,
  Target,
  Flame,
  Mountain,
  Waves,
  Footprints,
  BarChart3,
  CalendarRange,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AnnualPlanGenerator } from "@/components/annual-plan-generator"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
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

type ZoneType = "hr" | "power"

interface WorkoutBlock {
  id: string
  type: "warmup" | "work" | "recovery" | "cooldown" | "rest"
  duration: number // in minutes
  zone: string
  sport: string
  description: string
  repetitions?: number
}

const ADVANCED_BLOCK_TYPES = {
  constant: { label: "Blocco Costante", description: "Intensità fissa per tutto il blocco", icon: "▬" },
  increment: { label: "Incremento Power", description: "Intensità crescente durante il blocco", icon: "↗" },
  intervals_2: { label: "Intervalli 2 Intensità", description: "Alterna tra 2 zone (es. Z2/Z4)", icon: "⟷" },
  intervals_3: { label: "Intervalli 3 Intensità", description: "Alterna tra 3 zone (es. Z2/Z3/Z4)", icon: "⋯" },
  decrement: { label: "Decremento Power", description: "Intensità decrescente durante il blocco", icon: "↘" },
  cooldown: { label: "Defaticamento", description: "Ritorno graduale alla calma", icon: "↓" },
  warmup: { label: "Riscaldamento", description: "Attivazione progressiva", icon: "↑" },
} as const

type AdvancedBlockType = keyof typeof ADVANCED_BLOCK_TYPES

interface AdvancedWorkoutBlock {
  id: string
  blockType: AdvancedBlockType
  sport: string
  zoneType: ZoneType
  // Durata
  totalDuration: number // durata totale in minuti
  intervalDuration?: number // durata singolo intervallo in minuti (per intervalli)
  numIntervals?: number // numero di intervalli
  // Zone
  primaryZone: string // zona principale (Z1-Z7)
  secondaryZone?: string // zona secondaria (per intervalli a 2 intensità)
  tertiaryZone?: string // zona terziaria (per intervalli a 3 intensità)
  // Target
  hrMin?: number
  hrMax?: number
  powerMin?: number
  powerMax?: number
  // Altri
  description: string
  restBetweenIntervals?: number // secondi di recupero tra intervalli
}

interface GymExercise {
  id: string
  name: string
  category: "strength" | "core" | "flexibility" | "plyometric"
  sets: number
  reps: number
  weight?: number
  restBetweenSets: number
  notes?: string
}

interface TrainingSession {
  day: number
  dayName: string
  sport: string
  workoutType: string
  duration: number
  zone: string
  hrMin: number
  hrMax: number
  powerMin?: number
  powerMax?: number
  description: string
  tss?: number
  blocks?: WorkoutBlock[]
  gymExercises?: GymExercise[]
  zoneType?: ZoneType
  advancedBlocks?: AdvancedWorkoutBlock[] //
}

interface VyriaTrainingPlanProps {
  athleteData: AthleteDataType | null
  userName: string | null | undefined
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

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
  { id: "gym", name: "Palestra", icon: Dumbbell, supportsPower: false, color: "text-red-500" },
]

const ZONE_COLORS: Record<string, string> = {
  Z1: "bg-slate-500",
  Z2: "bg-green-500",
  Z3: "bg-yellow-500",
  Z4: "bg-orange-500",
  Z5: "bg-red-500",
  Z6: "bg-red-700",
  Z7: "bg-purple-600",
}

const BLOCK_TYPE_COLORS: Record<string, string> = {
  warmup: "bg-blue-500/20 border-blue-500",
  work: "bg-orange-500/20 border-orange-500",
  recovery: "bg-green-500/20 border-green-500",
  cooldown: "bg-cyan-500/20 border-cyan-500",
  rest: "bg-slate-500/20 border-slate-500",
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  warmup: "Riscaldamento",
  work: "Lavoro",
  recovery: "Recupero",
  cooldown: "Defaticamento",
  rest: "Riposo",
}

const HR_ZONE_DESCRIPTIONS: Record<string, string> = {
  Z1: "Recovery - Easy pace",
  Z2: "Endurance - Base aerobica",
  Z3: "Tempo - Ritmo sostenuto",
  Z4: "Threshold - Soglia",
  Z5: "VO2max - Alta intensità",
}

const POWER_ZONE_DESCRIPTIONS: Record<string, string> = {
  Z1: "Active Recovery - <55% FTP",
  Z2: "Endurance - 56-75% FTP",
  Z3: "Tempo - 76-90% FTP",
  Z4: "Threshold - 91-105% FTP",
  Z5: "VO2max - 106-120% FTP",
  Z6: "Anaerobic - 121-150% FTP",
  Z7: "Neuromuscular - >150% FTP",
}

const GYM_EXERCISES = {
  strength: [
    { id: "squat", name: "Squat", defaultSets: 4, defaultReps: 8 },
    { id: "deadlift", name: "Stacco", defaultSets: 4, defaultReps: 6 },
    { id: "bench_press", name: "Panca Piana", defaultSets: 4, defaultReps: 8 },
    { id: "row", name: "Rematore", defaultSets: 4, defaultReps: 10 },
    { id: "shoulder_press", name: "Military Press", defaultSets: 3, defaultReps: 10 },
    { id: "lunges", name: "Affondi", defaultSets: 3, defaultReps: 12 },
    { id: "leg_press", name: "Leg Press", defaultSets: 4, defaultReps: 10 },
    { id: "pull_up", name: "Trazioni", defaultSets: 3, defaultReps: 8 },
  ],
  core: [
    { id: "plank", name: "Plank", defaultSets: 3, defaultReps: 60 },
    { id: "russian_twist", name: "Russian Twist", defaultSets: 3, defaultReps: 20 },
    { id: "leg_raise", name: "Leg Raise", defaultSets: 3, defaultReps: 15 },
    { id: "crunch", name: "Crunch", defaultSets: 3, defaultReps: 20 },
    { id: "side_plank", name: "Side Plank", defaultSets: 3, defaultReps: 45 },
    { id: "dead_bug", name: "Dead Bug", defaultSets: 3, defaultReps: 12 },
  ],
  flexibility: [
    { id: "hip_flexor", name: "Stretching Flessori Anca", defaultSets: 2, defaultReps: 30 },
    { id: "hamstring", name: "Stretching Femorali", defaultSets: 2, defaultReps: 30 },
    { id: "quad", name: "Stretching Quadricipiti", defaultSets: 2, defaultReps: 30 },
    { id: "calf", name: "Stretching Polpacci", defaultSets: 2, defaultReps: 30 },
    { id: "shoulder", name: "Mobilità Spalle", defaultSets: 2, defaultReps: 30 },
  ],
  plyometric: [
    { id: "box_jump", name: "Box Jump", defaultSets: 3, defaultReps: 8 },
    { id: "burpee", name: "Burpee", defaultSets: 3, defaultReps: 10 },
    { id: "jump_squat", name: "Jump Squat", defaultSets: 3, defaultReps: 10 },
    { id: "tuck_jump", name: "Tuck Jump", defaultSets: 3, defaultReps: 8 },
    { id: "lateral_jump", name: "Salti Laterali", defaultSets: 3, defaultReps: 12 },
  ],
}

const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const calculateHRZones = (hrMax: number, hrThreshold: number): HRZoneData => {
  const z1Min = 0
  const z1Max = Math.round(hrThreshold * 0.81)
  const z2Min = z1Max + 1
  const z2Max = Math.round(hrThreshold * 0.89)
  const z3Min = z2Max + 1
  const z3Max = Math.round(hrThreshold * 0.93)
  const z4Min = z3Max + 1
  const z4Max = Math.round(hrThreshold * 0.99)
  const z5Min = z4Max + 1
  const z5Max = hrMax

  return {
    z1: { name: "Recovery", min: z1Min, max: z1Max, percent: { min: 0, max: 81 } },
    z2: { name: "Endurance", min: z2Min, max: z2Max, percent: { min: 81, max: 89 } },
    z3: { name: "Tempo", min: z3Min, max: z3Max, percent: { min: 89, max: 93 } },
    z4: { name: "Threshold", min: z4Min, max: z4Max, percent: { min: 93, max: 99 } },
    z5: { name: "VO2max", min: z5Min, max: z5Max, percent: { min: 99, max: 106 } },
  }
}

const calculatePowerZones = (ftp: number): PowerZoneData => {
  return {
    z1: { name: "Active Recovery", min: 0, max: Math.round(ftp * 0.55), percent: { min: 0, max: 55 } },
    z2: { name: "Endurance", min: Math.round(ftp * 0.56), max: Math.round(ftp * 0.75), percent: { min: 56, max: 75 } },
    z3: { name: "Tempo", min: Math.round(ftp * 0.76), max: Math.round(ftp * 0.9), percent: { min: 76, max: 90 } },
    z4: { name: "Threshold", min: Math.round(ftp * 0.91), max: Math.round(ftp * 1.05), percent: { min: 91, max: 105 } },
    z5: { name: "VO2max", min: Math.round(ftp * 1.06), max: Math.round(ftp * 1.2), percent: { min: 106, max: 120 } },
    z6: { name: "Anaerobic", min: Math.round(ftp * 1.21), max: Math.round(ftp * 1.5), percent: { min: 121, max: 150 } },
    z7: {
      name: "Neuromuscular",
      min: Math.round(ftp * 1.51),
      max: Math.round(ftp * 2.0),
      percent: { min: 151, max: 200 },
    },
  }
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const calculateTSS = (duration: number, zone: string): number => {
  const zoneMultipliers: Record<string, number> = {
    z1: 0.5,
    z2: 1.0,
    z3: 1.5,
    z4: 2.0,
    z5: 3.0,
    z6: 4.0,
    z7: 5.0,
  }
  const multiplier = zoneMultipliers[zone.toLowerCase()] || 1.0
  return Math.round((duration / 60) * 100 * multiplier)
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function WorkoutBlockComponent({
  block,
  onUpdate,
  onDelete,
  zoneType,
  hrZones,
  powerZones,
}: {
  block: WorkoutBlock
  onUpdate: (block: WorkoutBlock) => void
  onDelete: () => void
  zoneType: ZoneType
  hrZones: HRZoneData | null
  powerZones: PowerZoneData | null
}) {
  const zones = zoneType === "power" ? ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"] : ["Z1", "Z2", "Z3", "Z4", "Z5"]

  return (
    <div className={`p-3 rounded-lg border-2 ${BLOCK_TYPE_COLORS[block.type]} flex items-center gap-3`}>
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
        <Select value={block.type} onValueChange={(v) => onUpdate({ ...block, type: v as WorkoutBlock["type"] })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BLOCK_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={block.duration}
            onChange={(e) => onUpdate({ ...block, duration: Number.parseInt(e.target.value) || 0 })}
            className="h-8 w-16 text-xs"
            min="1"
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>

        <Select value={block.zone} onValueChange={(v) => onUpdate({ ...block, zone: v })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Zona" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((z) => (
              <SelectItem key={z} value={z}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ZONE_COLORS[z]}`} />
                  {z}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {block.type === "work" && (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={block.repetitions || 1}
              onChange={(e) => onUpdate({ ...block, repetitions: Number.parseInt(e.target.value) || 1 })}
              className="h-8 w-12 text-xs"
              min="1"
            />
            <span className="text-xs text-muted-foreground">x</span>
          </div>
        )}

        <Input
          value={block.description}
          onChange={(e) => onUpdate({ ...block, description: e.target.value })}
          placeholder="Note..."
          className="h-8 text-xs"
        />
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}

function AdvancedWorkoutBlockComponent({
  block,
  onUpdate,
  onDelete,
  hrZones,
  powerZones,
}: {
  block: AdvancedWorkoutBlock
  onUpdate: (block: AdvancedWorkoutBlock) => void
  onDelete: () => void
  hrZones: HRZoneData | null
  powerZones: PowerZoneData | null
}) {
  const zones = block.zoneType === "power" ? ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"] : ["Z1", "Z2", "Z3", "Z4", "Z5"]

  const blockTypeInfo = ADVANCED_BLOCK_TYPES[block.blockType]
  const needsIntervals = block.blockType === "intervals_2" || block.blockType === "intervals_3"
  const needsSecondaryZone = block.blockType === "intervals_2" || block.blockType === "intervals_3"
  const needsTertiaryZone = block.blockType === "intervals_3"

  // Calcola target HR/Power dalla zona selezionata
  const getZoneTargets = (zoneName: string) => {
    if (block.zoneType === "power" && powerZones) {
      const zoneKey = zoneName.toLowerCase() as keyof PowerZoneData
      const zone = powerZones[zoneKey]
      if (zone) return { min: zone.min, max: zone.max, unit: "W" }
    } else if (hrZones) {
      const zoneKey = zoneName.toLowerCase() as keyof HRZoneData
      const zone = hrZones[zoneKey]
      if (zone) return { min: zone.min, max: zone.max, unit: "bpm" }
    }
    return null
  }

  const primaryTargets = getZoneTargets(block.primaryZone)
  const secondaryTargets = block.secondaryZone ? getZoneTargets(block.secondaryZone) : null
  const tertiaryTargets = block.tertiaryZone ? getZoneTargets(block.tertiaryZone) : null

  return (
    <div className="p-4 rounded-lg border-2 border-slate-600 bg-slate-900/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <span className="text-lg">{blockTypeInfo.icon}</span>
          <span className="font-semibold text-sm">{blockTypeInfo.label}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Tipo Blocco */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tipo Blocco</Label>
          <Select
            value={block.blockType}
            onValueChange={(v) => onUpdate({ ...block, blockType: v as AdvancedBlockType })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ADVANCED_BLOCK_TYPES).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <span className="mr-2">{info.icon}</span>
                  {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zones Type HR/Power */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Metrica</Label>
          <Select value={block.zoneType} onValueChange={(v) => onUpdate({ ...block, zoneType: v as ZoneType })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hr">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  HR Zones
                </div>
              </SelectItem>
              <SelectItem value="power">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-yellow-500" />
                  Power Zones
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Durata Totale */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Durata Totale (min)</Label>
          <Input
            type="number"
            value={block.totalDuration}
            onChange={(e) => onUpdate({ ...block, totalDuration: Number.parseInt(e.target.value) || 0 })}
            className="h-9"
            min="1"
          />
        </div>

        {/* Zona Principale */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Zona Principale</Label>
          <Select value={block.primaryZone} onValueChange={(v) => onUpdate({ ...block, primaryZone: v })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z} value={z}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${ZONE_COLORS[z]}`} />
                    {z}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Riga Intervalli (solo per tipi intervallo) */}
      {needsIntervals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-700">
          {/* Durata Intervallo */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Durata Intervallo (min)</Label>
            <Input
              type="number"
              value={block.intervalDuration || 3}
              onChange={(e) => onUpdate({ ...block, intervalDuration: Number.parseInt(e.target.value) || 1 })}
              className="h-9"
              min="1"
            />
          </div>

          {/* Numero Intervalli */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Numero Intervalli</Label>
            <Input
              type="number"
              value={block.numIntervals || 4}
              onChange={(e) => onUpdate({ ...block, numIntervals: Number.parseInt(e.target.value) || 1 })}
              className="h-9"
              min="1"
            />
          </div>

          {/* Recupero tra Intervalli */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Recupero (sec)</Label>
            <Input
              type="number"
              value={block.restBetweenIntervals || 60}
              onChange={(e) => onUpdate({ ...block, restBetweenIntervals: Number.parseInt(e.target.value) || 0 })}
              className="h-9"
              min="0"
              step="15"
            />
          </div>

          {/* Zona Secondaria */}
          {needsSecondaryZone && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Zona Secondaria</Label>
              <Select
                value={block.secondaryZone || "Z2"}
                onValueChange={(v) => onUpdate({ ...block, secondaryZone: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${ZONE_COLORS[z]}`} />
                        {z}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Zona Terziaria (solo per intervalli a 3 intensità) */}
      {needsTertiaryZone && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Zona Terziaria</Label>
            <Select value={block.tertiaryZone || "Z3"} onValueChange={(v) => onUpdate({ ...block, tertiaryZone: v })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z} value={z}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${ZONE_COLORS[z]}`} />
                      {z}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Preview Target */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
        {primaryTargets && (
          <Badge className={`${ZONE_COLORS[block.primaryZone]} text-xs`}>
            {block.primaryZone}: {primaryTargets.min}-{primaryTargets.max} {primaryTargets.unit}
          </Badge>
        )}
        {secondaryTargets && block.secondaryZone && (
          <Badge className={`${ZONE_COLORS[block.secondaryZone]} text-xs`}>
            {block.secondaryZone}: {secondaryTargets.min}-{secondaryTargets.max} {secondaryTargets.unit}
          </Badge>
        )}
        {tertiaryTargets && block.tertiaryZone && (
          <Badge className={`${ZONE_COLORS[block.tertiaryZone]} text-xs`}>
            {block.tertiaryZone}: {tertiaryTargets.min}-{tertiaryTargets.max} {tertiaryTargets.unit}
          </Badge>
        )}
      </div>

      {/* Descrizione */}
      <Input
        value={block.description}
        onChange={(e) => onUpdate({ ...block, description: e.target.value })}
        placeholder="Note sul blocco..."
        className="h-9 text-sm"
      />
    </div>
  )
}

// Add WorkoutVisualizationChart component here
function WorkoutVisualizationChart({
  blocks,
  hrZones,
  powerZones,
}: {
  blocks: AdvancedWorkoutBlock[]
  hrZones: HRZoneData | null
  powerZones: PowerZoneData | null
}) {
  if (blocks.length === 0) return null

  const totalDuration = blocks.reduce((sum, b) => sum + b.totalDuration, 0)

  // Calculate height based on zone intensity
  const getZoneHeight = (zone: string): number => {
    const zoneNum = Number.parseInt(zone.replace("Z", ""))
    return Math.min(100, (zoneNum / 7) * 100 + 20) // Min 20%, max 100%
  }

  // Generate visual blocks for each workout block
  const generateVisualSegments = (block: AdvancedWorkoutBlock) => {
    const segments: { zone: string; duration: number; label: string }[] = []

    switch (block.blockType) {
      case "constant":
        segments.push({ zone: block.primaryZone, duration: block.totalDuration, label: "Costante" })
        break
      case "increment":
        // Divide into 3-4 progressive segments
        const incSegments = 4
        const incDuration = block.totalDuration / incSegments
        for (let i = 0; i < incSegments; i++) {
          const zoneNum = Math.min(7, Number.parseInt(block.primaryZone.replace("Z", "")) - (incSegments - 1 - i))
          segments.push({ zone: `Z${Math.max(1, zoneNum)}`, duration: incDuration, label: `Incremento ${i + 1}` })
        }
        break
      case "decrement":
        // Divide into 3-4 regressive segments
        const decSegments = 4
        const decDuration = block.totalDuration / decSegments
        for (let i = 0; i < decSegments; i++) {
          const zoneNum = Math.max(1, Number.parseInt(block.primaryZone.replace("Z", "")) - i)
          segments.push({ zone: `Z${zoneNum}`, duration: decDuration, label: `Decremento ${i + 1}` })
        }
        break
      case "intervals_2":
        // Alternate between primary and secondary zones
        const numInt2 = block.numIntervals || 4
        const intDur2 = block.intervalDuration || 3
        const restDur2 = (block.restBetweenIntervals || 60) / 60 // Convert to minutes
        for (let i = 0; i < numInt2; i++) {
          segments.push({ zone: block.primaryZone, duration: intDur2, label: `Int ${i + 1}` })
          if (i < numInt2 - 1 && restDur2 > 0) {
            segments.push({ zone: block.secondaryZone || "Z1", duration: restDur2, label: "Rec" })
          }
        }
        break
      case "intervals_3":
        // Cycle through 3 zones
        const numInt3 = block.numIntervals || 3
        const intDur3 = block.intervalDuration || 3
        const restDur3 = (block.restBetweenIntervals || 60) / 60
        for (let i = 0; i < numInt3; i++) {
          segments.push({ zone: block.primaryZone, duration: intDur3 / 3, label: `Z1-${i + 1}` })
          segments.push({ zone: block.secondaryZone || "Z3", duration: intDur3 / 3, label: `Z2-${i + 1}` })
          segments.push({ zone: block.tertiaryZone || "Z4", duration: intDur3 / 3, label: `Z3-${i + 1}` })
          if (i < numInt3 - 1 && restDur3 > 0) {
            segments.push({ zone: "Z1", duration: restDur3, label: "Rec" })
          }
        }
        break
      case "cooldown":
        segments.push({ zone: "Z1", duration: block.totalDuration, label: "Defaticamento" })
        break
      default:
        segments.push({ zone: block.primaryZone, duration: block.totalDuration, label: "Blocco" })
    }

    return segments
  }

  const allSegments = blocks.flatMap(generateVisualSegments)
  const segmentTotalDuration = allSegments.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-fuchsia-500" />
          Visualizzazione Allenamento
        </h4>
        <span className="text-xs text-muted-foreground">{totalDuration} min totali</span>
      </div>

      {/* Chart Container */}
      <div className="relative h-32 bg-slate-900/50 rounded-lg border border-slate-700 p-2">
        <div className="flex items-end h-full gap-0.5">
          {allSegments.map((segment, index) => {
            const widthPercent = (segment.duration / segmentTotalDuration) * 100
            const heightPercent = getZoneHeight(segment.zone)

            return (
              <div
                key={index}
                className={`relative group transition-all ${ZONE_COLORS[segment.zone]} rounded-t`}
                style={{
                  width: `${Math.max(widthPercent, 2)}%`,
                  height: `${heightPercent}%`,
                  minWidth: "8px",
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    <div className="font-semibold">{segment.zone}</div>
                    <div>{segment.duration.toFixed(1)} min</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Time axis */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-2 -mb-5">
          <span>0</span>
          <span>{Math.round(segmentTotalDuration / 4)}</span>
          <span>{Math.round(segmentTotalDuration / 2)}</span>
          <span>{Math.round((segmentTotalDuration * 3) / 4)}</span>
          <span>{Math.round(segmentTotalDuration)} min</span>
        </div>
      </div>

      {/* Zone Legend */}
      <div className="flex flex-wrap gap-2 pt-4">
        {["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"].map((zone) => {
          const hasZone = allSegments.some((s) => s.zone === zone)
          if (!hasZone) return null
          return (
            <div key={zone} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${ZONE_COLORS[zone]}`} />
              <span className="text-xs">{zone}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GymExerciseRow({
  exercise,
  onUpdate,
  onDelete,
}: {
  exercise: GymExercise
  onUpdate: (exercise: GymExercise) => void
  onDelete: () => void
}) {
  const [localSets, setLocalSets] = useState(exercise.sets)
  const [localReps, setLocalReps] = useState(exercise.reps)
  const [localWeight, setLocalWeight] = useState(exercise.weight || 0)
  const [localRest, setLocalRest] = useState(exercise.restBetweenSets)

  const handleSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setLocalSets(value)
    onUpdate({ ...exercise, sets: value })
  }

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setLocalReps(value)
    onUpdate({ ...exercise, reps: value })
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setLocalWeight(value)
    onUpdate({ ...exercise, weight: value })
  }

  const handleRestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setLocalRest(value)
    onUpdate({ ...exercise, restBetweenSets: value })
  }

  // Category label mapping
  const categoryLabels: Record<string, string> = {
    strength: "Forza",
    core: "Core",
    flexibility: "Flex",
    plyometric: "Plio",
  }

  const inputClass =
    "h-8 w-14 text-xs text-center rounded-md border border-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
  const inputStyles: React.CSSProperties = {
    color: "#ffffff",
    backgroundColor: "#334155",
    WebkitAppearance: "none",
    MozAppearance: "textfield",
  }

  return (
    <div className="p-3 rounded-lg border border-slate-700 bg-slate-900/50 flex items-center gap-3">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

      <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
        <div className="col-span-2 md:col-span-1">
          <span className="font-medium text-sm text-white">{exercise.name}</span>
          <span className="text-[10px] text-muted-foreground ml-1">
            ({categoryLabels[exercise.category] || exercise.category})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={localSets}
            onChange={handleSetsChange}
            className={inputClass}
            style={inputStyles}
            min={1}
            max={20}
          />
          <span className="text-xs text-slate-400">set</span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={localReps}
            onChange={handleRepsChange}
            className={inputClass}
            style={inputStyles}
            min={1}
            max={100}
          />
          <span className="text-xs text-slate-400">rep</span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={localWeight}
            onChange={handleWeightChange}
            className={`${inputClass} w-16`}
            style={inputStyles}
            min={0}
            max={500}
          />
          <span className="text-xs text-slate-400">kg</span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={localRest}
            onChange={handleRestChange}
            className={inputClass}
            style={inputStyles}
            min={0}
            max={600}
          />
          <span className="text-xs text-slate-400">s</span>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}

function WeeklyCalendarView({
  sessions,
  onEditSession,
  onAddSession,
  zoneType,
}: {
  sessions: TrainingSession[]
  onEditSession: (dayIndex: number) => void
  onAddSession: (dayIndex: number) => void
  zoneType: ZoneType
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAY_NAMES.map((dayName, index) => {
        const session = sessions.find((s) => s.day === index)
        const sport = session ? SPORTS.find((s) => s.id === session.sport) : null
        const SportIcon = sport?.icon || Calendar

        return (
          <Card
            key={dayName}
            className={`cursor-pointer transition hover:border-fuchsia-500/50 ${
              session && session.duration > 0 ? "bg-slate-900/70" : "bg-slate-900/30 opacity-70"
            }`}
            onClick={() => (session ? onEditSession(index) : onAddSession(index))}
          >
            <CardContent className="p-3 min-h-[140px]">
              <div className="text-xs font-semibold text-muted-foreground mb-2">{dayName.substring(0, 3)}</div>

              {session && session.duration > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <SportIcon className={`h-4 w-4 ${sport?.color || "text-slate-400"}`} />
                    <span className="text-xs font-medium truncate">{sport?.name || session.sport}</span>
                  </div>

                  {session.zone && (
                    <Badge className={`${ZONE_COLORS[session.zone]} text-[10px] px-1.5 py-0`}>{session.zone}</Badge>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {session.duration}min
                  </div>

                  {session.zoneType === "power" && session.powerMin ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Gauge className="h-3 w-3 text-yellow-500" />
                      {session.powerMin}-{session.powerMax}W
                    </div>
                  ) : session.hrMin ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Heart className="h-3 w-3 text-red-500" />
                      {session.hrMin}-{session.hrMax}bpm
                    </div>
                  ) : null}

                  {session.blocks && session.blocks.length > 0 && (
                    <div className="text-[10px] text-muted-foreground">{session.blocks.length} blocchi</div>
                  )}

                  {session.gymExercises && session.gymExercises.length > 0 && (
                    <div className="text-[10px] text-muted-foreground">{session.gymExercises.length} esercizi</div>
                  )}

                  {session.advancedBlocks && session.advancedBlocks.length > 0 && (
                    <div className="text-[10px] text-muted-foreground">
                      {session.advancedBlocks.length} blocchi avanzati
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                  <Plus className="h-5 w-5 mb-1" />
                  <span className="text-[10px]">Aggiungi</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function VyriaTrainingPlan({ athleteData, userName }: VyriaTrainingPlanProps) {
  const supabase = createClient()

  // State - Sport & Zone Type
  const [primarySport, setPrimarySport] = useState<string>("cycling")
  const [zoneType, setZoneType] = useState<ZoneType>("hr")

  // State - HR Zones Configuration
  const [hrMax, setHrMax] = useState<number>(190)
  const [hrThreshold, setHrThreshold] = useState<number>(170)
  const [hrResting, setHrResting] = useState<number>(60)
  const [hrZones, setHRZones] = useState<HRZoneData | null>(null)

  // State - Power Zones
  const [ftp, setFtp] = useState<number>(250)
  const [powerZones, setPowerZones] = useState<PowerZoneData | null>(null)

  // State - Training Plan Generation
  const [trainingVolume, setTrainingVolume] = useState<"low" | "medium" | "high">("medium")
  const [trainingFocus, setTrainingFocus] = useState<"endurance" | "balanced" | "intensity">("balanced")
  const [generatedPlan, setGeneratedPlan] = useState<TrainingSession[]>([])

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)
  const [currentBlocks, setCurrentBlocks] = useState<WorkoutBlock[]>([])
  const [currentGymExercises, setCurrentGymExercises] = useState<GymExercise[]>([])
  // State for advanced blocks
  const [currentAdvancedBlocks, setCurrentAdvancedBlocks] = useState<AdvancedWorkoutBlock[]>([])
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false)
  const [builderSport, setBuilderSport] = useState<string>("cycling")
  const [builderZoneType, setBuilderZoneType] = useState<ZoneType>("hr")

  // State - UI
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [activeTab, setActiveTab] = useState("zones")

  // Add state for annual plan generation
  const [annualPlanSettings, setAnnualPlanSettings] = useState<{
    goal?: string
    focus?: string
    duration?: number
    weeks?: number
    startDate?: string
  }>({})
  const [isGeneratingAnnualPlan, setIsGeneratingAnnualPlan] = useState(false)
  const [generatedAnnualPlan, setGeneratedAnnualPlan] = useState<any[]>([]) // Type as needed

  useEffect(() => {
    if (athleteData?.metabolic_profiles) {
      const currentProfile =
        athleteData.metabolic_profiles.find((p) => p.is_current) || athleteData.metabolic_profiles[0]
      if (currentProfile) {
        // Load HR data
        if (currentProfile.hr_max && currentProfile.hr_max > 0) {
          setHrMax(currentProfile.hr_max)
        }
        if (currentProfile.hr_lt2 && currentProfile.hr_lt2 > 0) {
          setHrThreshold(currentProfile.hr_lt2)
        }
        if (currentProfile.hr_rest && currentProfile.hr_rest > 0) {
          setHrResting(currentProfile.hr_rest)
        }
        // Load FTP data
        if (currentProfile.ftp_watts && currentProfile.ftp_watts > 0) {
          setFtp(currentProfile.ftp_watts)
        }
        // Load saved HR zones if available
        if (currentProfile.hr_zones && typeof currentProfile.hr_zones === "object") {
          const savedZones = currentProfile.hr_zones as HRZoneData
          if (savedZones.z1 && savedZones.z2 && savedZones.z3 && savedZones.z4 && savedZones.z5) {
            setHRZones(savedZones)
          }
        }
        console.log("[v0] Loaded HR data from profile:", {
          hr_max: currentProfile.hr_max,
          hr_lt2: currentProfile.hr_lt2,
          hr_rest: currentProfile.hr_rest,
          ftp: currentProfile.ftp_watts,
          hr_zones: currentProfile.hr_zones ? "present" : "none",
        })
      }
    }
  }, [athleteData])

  const selectedSport = SPORTS.find((s) => s.id === primarySport)
  const sportSupportsPower = selectedSport?.supportsPower ?? false
  const builderSportData = SPORTS.find((s) => s.id === builderSport)
  const builderSupportsPower = builderSportData?.supportsPower ?? false

  // Initialize empty week if no plan
  const initializeEmptyWeek = (): TrainingSession[] => {
    return DAY_NAMES.map((dayName, index) => ({
      day: index,
      dayName,
      sport: "",
      workoutType: "rest",
      duration: 0,
      zone: "",
      hrMin: 0,
      hrMax: 0,
      description: "Giorno di riposo",
      blocks: [],
      gymExercises: [],
      // Initialize advancedBlocks
      advancedBlocks: [],
    }))
  }

  // Handle generate training plan
  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    setErrorMessage("")

    try {
      let currentHRZones = hrZones
      let currentPowerZones = powerZones

      if (zoneType === "hr" && !hrZones) {
        currentHRZones = calculateHRZones(hrMax, hrThreshold)
        setHRZones(currentHRZones)
      }
      if (zoneType === "power" && !powerZones) {
        currentPowerZones = calculatePowerZones(ftp)
        setPowerZones(currentPowerZones)
      }

      const plan = generateWeeklyTrainingPlan(
        primarySport,
        trainingVolume,
        trainingFocus,
        currentHRZones,
        currentPowerZones,
        zoneType,
      )
      setGeneratedPlan(plan)
      setActiveTab("week")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error generating training plan")
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate weekly training plan
  const generateWeeklyTrainingPlan = (
    sport: string,
    volume: "low" | "medium" | "high",
    focus: "endurance" | "balanced" | "intensity",
    hrZonesData: HRZoneData | null,
    powerZonesData: PowerZoneData | null,
    zType: ZoneType,
  ): TrainingSession[] => {
    const sessions: TrainingSession[] = []

    const baseStructure = {
      low: [
        { day: 0, type: "recovery", zone: "Z1", duration: 45 },
        { day: 1, type: "endurance", zone: "Z2", duration: 60 },
        { day: 2, type: "rest", zone: "", duration: 0 },
        { day: 3, type: "tempo", zone: "Z3", duration: 50 },
        { day: 4, type: "recovery", zone: "Z1", duration: 40 },
        { day: 5, type: "long", zone: "Z2", duration: 90 },
        { day: 6, type: "rest", zone: "", duration: 0 },
      ],
      medium: [
        { day: 0, type: "recovery", zone: "Z1", duration: 45 },
        { day: 1, type: "threshold", zone: "Z4", duration: 70 },
        { day: 2, type: "endurance", zone: "Z2", duration: 60 },
        { day: 3, type: "rest", zone: "", duration: 0 },
        { day: 4, type: "intervals", zone: "Z5", duration: 60 },
        { day: 5, type: "long", zone: "Z2", duration: 120 },
        { day: 6, type: "recovery", zone: "Z1", duration: 45 },
      ],
      high: [
        { day: 0, type: "recovery", zone: "Z1", duration: 45 },
        { day: 1, type: "threshold", zone: "Z4", duration: 80 },
        { day: 2, type: "endurance", zone: "Z2", duration: 75 },
        { day: 3, type: "intervals", zone: "Z5", duration: 70 },
        { day: 4, type: "tempo", zone: "Z3", duration: 60 },
        { day: 5, type: "long", zone: "Z2", duration: 150 },
        { day: 6, type: "recovery", zone: "Z1", duration: 50 },
      ],
    }

    const structure = baseStructure[volume]

    structure.forEach((session) => {
      const zoneKey = session.zone.toLowerCase() as keyof HRZoneData

      if (session.duration > 0 && session.zone) {
        if (zType === "power" && powerZonesData) {
          const powerZoneKey = session.zone.toLowerCase() as keyof PowerZoneData
          const zoneData = powerZonesData[powerZoneKey]

          sessions.push({
            day: session.day,
            dayName: DAY_NAMES[session.day],
            sport: sport,
            workoutType: session.type,
            duration: session.duration,
            zone: session.zone,
            hrMin: 0,
            hrMax: 0,
            powerMin: zoneData?.min || 0,
            powerMax: zoneData?.max || 0,
            description: `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} - ${zoneData?.name || session.zone}`,
            tss: calculateTSS(session.duration, session.zone),
            zoneType: "power",
            blocks: generateDefaultBlocks(session.type, session.zone, session.duration, sport),
          })
        } else if (hrZonesData) {
          const zoneData = hrZonesData[zoneKey]

          sessions.push({
            day: session.day,
            dayName: DAY_NAMES[session.day],
            sport: sport,
            workoutType: session.type,
            duration: session.duration,
            zone: session.zone,
            hrMin: zoneData?.min || 0,
            hrMax: zoneData?.max || 0,
            description: `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} - ${zoneData?.name || session.zone}`,
            tss: calculateTSS(session.duration, session.zone),
            zoneType: "hr",
            blocks: generateDefaultBlocks(session.type, session.zone, session.duration, sport),
          })
        }
      } else {
        sessions.push({
          day: session.day,
          dayName: DAY_NAMES[session.day],
          sport: sport,
          workoutType: "rest",
          duration: 0,
          zone: "",
          hrMin: 0,
          hrMax: 0,
          description: "Giorno di riposo",
          tss: 0,
          blocks: [],
        })
      }
    })

    return sessions
  }

  // Generate default blocks for a workout
  const generateDefaultBlocks = (type: string, zone: string, duration: number, sport: string): WorkoutBlock[] => {
    const blocks: WorkoutBlock[] = []

    // Warmup
    blocks.push({
      id: generateId(),
      type: "warmup",
      duration: Math.round(duration * 0.15),
      zone: "Z1",
      sport,
      description: "Riscaldamento progressivo",
    })

    // Main work
    if (type === "intervals") {
      const intervalDuration = Math.round(duration * 0.6)
      const reps = 4
      const workTime = Math.round(intervalDuration / reps / 2)

      blocks.push({
        id: generateId(),
        type: "work",
        duration: workTime,
        zone: zone,
        sport,
        description: `Intervallo ${zone}`,
        repetitions: reps,
      })
      blocks.push({
        id: generateId(),
        type: "recovery",
        duration: workTime,
        zone: "Z1",
        sport,
        description: "Recupero attivo",
        repetitions: reps,
      })
    } else {
      blocks.push({
        id: generateId(),
        type: "work",
        duration: Math.round(duration * 0.7),
        zone: zone,
        sport,
        description: `Lavoro principale in ${zone}`,
      })
    }

    // Cooldown
    blocks.push({
      id: generateId(),
      type: "cooldown",
      duration: Math.round(duration * 0.15),
      zone: "Z1",
      sport,
      description: "Defaticamento",
    })

    return blocks
  }

  // Handle save training plan
  const handleSavePlan = async () => {
    if (!athleteData?.id || generatedPlan.length === 0) {
      setErrorMessage("Missing required data to save plan")
      return
    }

    setIsSaving(true)
    setSaveStatus("idle")
    setErrorMessage("")

    try {
      const getNextWeekday = (dayIndex: number) => {
        const today = new Date()
        const currentDay = today.getDay()
        const targetDay = dayIndex + 1 // Monday = 1
        let daysUntil = targetDay - currentDay
        if (daysUntil <= 0) daysUntil += 7
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() + daysUntil)
        return targetDate.toISOString().split("T")[0]
      }

      const mondayDate = getNextWeekday(0) // Get Monday
      const sundayDate = getNextWeekday(6) // Get Sunday

      const { error: deleteError } = await supabase
        .from("training_activities")
        .delete()
        .eq("athlete_id", athleteData.id)
        .gte("activity_date", mondayDate)
        .lte("activity_date", sundayDate)

      if (deleteError) {
        console.log("[v0] Error deleting existing activities:", deleteError)
      }

      for (const session of generatedPlan) {
        // Only save sessions that have content
        if (
          session.duration > 0 ||
          (session.blocks && session.blocks.length > 0) ||
          (session.advancedBlocks && session.advancedBlocks.length > 0)
        ) {
          const activityDate = getNextWeekday(session.day)

          // Prepare workout data
          const workoutData = {
            blocks: session.blocks || [],
            advancedBlocks: session.advancedBlocks || [],
            gymExercises: session.gymExercises || [],
            zoneType: session.zoneType || zoneType,
            hrMin: session.hrMin,
            hrMax: session.hrMax,
            powerMin: session.powerMin,
            powerMax: session.powerMax,
          }

          const { error: insertError } = await supabase.from("training_activities").insert({
            athlete_id: athleteData.id,
            activity_date: activityDate,
            sport: session.sport || primarySport,
            activity_type: session.workoutType || session.sport || primarySport,
            duration_minutes: session.duration,
            title: `${session.dayName} - ${session.workoutType || session.sport || primarySport}`,
            description: session.description,
            target_zone: session.zone,
            tss: session.tss,
            workout_data: workoutData,
            source: "vyria_generated",
            completed: false,
          })

          if (insertError) {
            console.log("[v0] Error saving session:", insertError)
            throw insertError
          }
        }
      }

      // Save sport config
      const sportConfigPayload = {
        athlete_id: athleteData.id,
        sport: primarySport,
        use_hr_zones: zoneType === "hr",
        hr_max: hrMax,
        hr_threshold: hrThreshold,
        hr_resting: hrResting,
        ftp_watts: ftp,
        is_primary: true,
      }

      const { error: configError } = await supabase
        .from("sport_configs")
        .upsert(sportConfigPayload, { onConflict: "athlete_id,sport" })

      if (configError) {
        console.log("[v0] Sport config error (non-critical):", configError)
        // Don't throw - sport_configs might not exist
      }

      if (zoneType === "hr" && hrZones) {
        // Recovery = Z1 Power, Endurance = Z2 Power, etc.
        const hrZonesWithConsumption = {
          z1: {
            ...hrZones.z1,
            name: "Recovery",
            color: "#22c55e",
            consumption: { choGH: 43, fatGH: 29, proGH: 0, kcalH: 430 },
          },
          z2: {
            ...hrZones.z2,
            name: "Endurance",
            color: "#3b82f6",
            consumption: { choGH: 134, fatGH: 40, proGH: 0, kcalH: 896 },
          },
          z3: {
            ...hrZones.z3,
            name: "Tempo",
            color: "#eab308",
            consumption: { choGH: 221, fatGH: 25, proGH: 0, kcalH: 1105 },
          },
          z4: {
            ...hrZones.z4,
            name: "Threshold",
            color: "#f97316",
            consumption: { choGH: 276, fatGH: 11, proGH: 6, kcalH: 1226 },
          },
          z5: {
            ...hrZones.z5,
            name: "VO2max",
            color: "#ef4444",
            consumption: { choGH: 346, fatGH: 0, proGH: 7, kcalH: 1412 },
          },
        }

        const zonesPayload = {
          athlete_id: athleteData.id,
          sport: primarySport,
          zone_model: "threshold",
          z1_hr_min: hrZones.z1.min,
          z1_hr_max: hrZones.z1.max,
          z2_hr_min: hrZones.z2.min,
          z2_hr_max: hrZones.z2.max,
          z3_hr_min: hrZones.z3.min,
          z3_hr_max: hrZones.z3.max,
          z4_hr_min: hrZones.z4.min,
          z4_hr_max: hrZones.z4.max,
          z5_hr_min: hrZones.z5.min,
          z5_hr_max: hrZones.z5.max,
        }

        const { error: zonesError } = await supabase
          .from("hr_zones")
          .upsert(zonesPayload, { onConflict: "athlete_id,sport" })

        if (zonesError) {
          console.log("[v0] HR zones error (non-critical):", zonesError)
          // Don't throw - hr_zones might not exist
        }
      }

      console.log("[v0] Training plan saved successfully!")
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (err) {
      console.log("[v0] Error saving weekly plan:", err instanceof Error ? err.message : err)
      setErrorMessage(err instanceof Error ? err.message : "Error saving training plan")
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCalculateZones = async () => {
    if (zoneType === "hr") {
      const zones = calculateHRZones(hrMax, hrThreshold)
      setHRZones(zones)

      // Save to database
      if (athleteData?.id) {
        setIsSaving(true)
        try {
          const supabase = createClient()

          // Recovery = Z1 Power, Endurance = Z2 Power, etc.
          const hrZonesWithConsumption = {
            z1: {
              ...zones.z1,
              name: "Recovery",
              color: "#22c55e",
              consumption: { choGH: 43, fatGH: 29, proGH: 0, kcalH: 430 },
            },
            z2: {
              ...zones.z2,
              name: "Endurance",
              color: "#3b82f6",
              consumption: { choGH: 134, fatGH: 40, proGH: 0, kcalH: 896 },
            },
            z3: {
              ...zones.z3,
              name: "Tempo",
              color: "#eab308",
              consumption: { choGH: 221, fatGH: 25, proGH: 0, kcalH: 1105 },
            },
            z4: {
              ...zones.z4,
              name: "Threshold",
              color: "#f97316",
              consumption: { choGH: 276, fatGH: 11, proGH: 6, kcalH: 1226 },
            },
            z5: {
              ...zones.z5,
              name: "VO2max",
              color: "#ef4444",
              consumption: { choGH: 346, fatGH: 0, proGH: 7, kcalH: 1412 },
            },
          }

          const { error } = await supabase
            .from("metabolic_profiles")
            .update({
              hr_max: hrMax,
              hr_lt2: hrThreshold,
              hr_rest: hrResting,
              hr_zones: hrZonesWithConsumption,
            })
            .eq("athlete_id", athleteData.id)
            .eq("is_current", true)

          if (error) {
            console.log("[v0] Error saving HR zones:", error)
            // Try insert if update fails
            const { error: insertError } = await supabase.from("metabolic_profiles").insert({
              athlete_id: athleteData.id,
              hr_max: hrMax,
              hr_lt2: hrThreshold,
              hr_rest: hrResting,
              hr_zones: hrZonesWithConsumption,
              is_current: true,
            })
            if (insertError) {
              console.log("[v0] Insert error:", insertError)
            } else {
              console.log("[v0] HR zones inserted successfully")
            }
          } else {
            console.log("[v0] HR zones saved successfully")
          }
        } catch (err) {
          console.log("[v0] Exception saving HR zones:", err)
        } finally {
          setIsSaving(false)
        }
      }
    } else {
      const zones = calculatePowerZones(ftp)
      setPowerZones(zones)

      // Save FTP to database
      if (athleteData?.id) {
        setIsSaving(true)
        try {
          const supabase = createClient()
          const { error } = await supabase
            .from("metabolic_profiles")
            .update({ ftp_watts: ftp })
            .eq("athlete_id", athleteData.id)
            .eq("is_current", true)

          if (error) {
            console.log("[v0] Error saving FTP:", error)
          } else {
            console.log("[v0] FTP saved successfully")
          }
        } catch (err) {
          console.log("[v0] Exception saving FTP:", err)
        } finally {
          setIsSaving(false)
        }
      }
    }
  }

  const handleOpenWorkoutBuilder = (dayIndex: number) => {
    const session = generatedPlan.find((s) => s.day === dayIndex)
    setSelectedDay(dayIndex)
    setEditingSession(session || null)
    setCurrentBlocks(session?.blocks || [])
    setCurrentGymExercises(session?.gymExercises || [])
    // Load advanced blocks
    setCurrentAdvancedBlocks(session?.advancedBlocks || [])
    setBuilderSport(session?.sport || primarySport)
    setBuilderZoneType(session?.zoneType || zoneType)
    setShowWorkoutBuilder(true)
  }

  const handleAddBlock = () => {
    const newBlock: WorkoutBlock = {
      id: generateId(),
      type: "work",
      duration: 10,
      zone: "Z2",
      sport: builderSport,
      description: "",
    }
    setCurrentBlocks([...currentBlocks, newBlock])
  }

  const handleUpdateBlock = (updatedBlock: WorkoutBlock) => {
    setCurrentBlocks(currentBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)))
  }

  const handleDeleteBlock = (blockId: string) => {
    setCurrentBlocks(currentBlocks.filter((b) => b.id !== blockId))
  }

  // Handlers for Advanced Blocks
  const handleAddAdvancedBlock = () => {
    const newBlock: AdvancedWorkoutBlock = {
      id: generateId(),
      blockType: "constant", // default
      sport: builderSport,
      zoneType: builderZoneType,
      totalDuration: 15,
      primaryZone: "Z2", // default
      description: "",
    }
    setCurrentAdvancedBlocks([...currentAdvancedBlocks, newBlock])
  }

  const handleUpdateAdvancedBlock = (updatedBlock: AdvancedWorkoutBlock) => {
    setCurrentAdvancedBlocks(currentAdvancedBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)))
  }

  const handleDeleteAdvancedBlock = (blockId: string) => {
    setCurrentAdvancedBlocks(currentAdvancedBlocks.filter((b) => b.id !== blockId))
  }

  const handleAddGymExercise = (exerciseId: string, category: keyof typeof GYM_EXERCISES) => {
    const exerciseTemplate = GYM_EXERCISES[category].find((e) => e.id === exerciseId)
    if (!exerciseTemplate) return

    const newExercise: GymExercise = {
      id: generateId(),
      name: exerciseTemplate.name,
      category,
      sets: exerciseTemplate.defaultSets,
      reps: exerciseTemplate.defaultReps,
      restBetweenSets: 90,
    }
    setCurrentGymExercises([...currentGymExercises, newExercise])
  }

  const handleUpdateGymExercise = (updatedExercise: GymExercise) => {
    setCurrentGymExercises(currentGymExercises.map((e) => (e.id === updatedExercise.id ? updatedExercise : e)))
  }

  const handleDeleteGymExercise = (exerciseId: string) => {
    setCurrentGymExercises(currentGymExercises.filter((e) => e.id !== exerciseId))
  }

  const handleSaveWorkout = () => {
    if (selectedDay === null) return

    // Calculate total duration based on the active block type
    let totalDuration = 0
    let mainZone = "Z2" // Default zone

    if (builderSport !== "gym") {
      if (currentAdvancedBlocks.length > 0) {
        totalDuration = currentAdvancedBlocks.reduce((sum, b) => sum + b.totalDuration, 0)
        mainZone =
          currentAdvancedBlocks.find(
            (b) => b.blockType === "constant" || b.blockType === "increment" || b.blockType === "decrement",
          )?.primaryZone || currentAdvancedBlocks[0].primaryZone
      } else {
        // Fallback to legacy blocks if no advanced blocks
        totalDuration = currentBlocks.reduce((sum, b) => sum + b.duration * (b.repetitions || 1), 0)
        mainZone = currentBlocks.find((b) => b.type === "work")?.zone || "Z2"
      }
    } else {
      totalDuration = Math.round(currentGymExercises.reduce((sum, e) => sum + e.sets, 0) * 2) // Estimate ~2 min per set
      mainZone = "Z1" // Gym doesn't strictly follow zone model
    }

    const updatedSession: TrainingSession = {
      day: selectedDay,
      dayName: DAY_NAMES[selectedDay],
      sport: builderSport,
      workoutType: builderSport === "gym" ? "strength" : "custom",
      duration: totalDuration,
      zone: mainZone,
      hrMin: hrZones?.[mainZone.toLowerCase() as keyof HRZoneData]?.min || 0,
      hrMax: hrZones?.[mainZone.toLowerCase() as keyof HRZoneData]?.max || 0,
      powerMin: powerZones?.[mainZone.toLowerCase() as keyof PowerZoneData]?.min,
      powerMax: powerZones?.[mainZone.toLowerCase() as keyof PowerZoneData]?.max,
      description: builderSport === "gym" ? "Allenamento palestra" : "Allenamento personalizzato",
      tss: calculateTSS(totalDuration, mainZone),
      blocks: currentBlocks, // Keep legacy blocks for backward compatibility/simplicity if needed
      gymExercises: currentGymExercises,
      zoneType: builderZoneType,
      // Add advanced blocks
      advancedBlocks: currentAdvancedBlocks,
    }

    const updatedPlan = [...generatedPlan]
    const existingIndex = updatedPlan.findIndex((s) => s.day === selectedDay)
    if (existingIndex >= 0) {
      updatedPlan[existingIndex] = updatedSession
    } else {
      updatedPlan.push(updatedSession)
      updatedPlan.sort((a, b) => a.day - b.day)
    }

    setGeneratedPlan(updatedPlan)
    setShowWorkoutBuilder(false)
    setSelectedDay(null)
    setCurrentBlocks([])
    setCurrentGymExercises([])
    setCurrentAdvancedBlocks([]) // Reset advanced blocks
  }

  const zonesCalculated = zoneType === "hr" ? hrZones !== null : powerZones !== null

  // Initialize plan if empty
  if (generatedPlan.length === 0 && activeTab === "week") {
    setGeneratedPlan(initializeEmptyWeek())
  }

  if (!athleteData?.id) {
    return (
      <div className="p-4 md:p-8">
        <Card className="border-yellow-900/50 bg-yellow-950/20">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading athlete data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-fuchsia-500" />
            <h1 className="text-3xl font-bold">VYRIA Training Plan</h1>
          </div>
          <p className="text-muted-foreground mt-2">Multisport training plan for {userName || "Athlete"}</p>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <Card className="border-red-900/50 bg-red-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-400">{errorMessage}</div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="annual" className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" />
            <span className="hidden sm:inline">Piano Annuale</span>
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Zone</span>
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Genera</span>
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Settimana</span>
          </TabsTrigger>
          <TabsTrigger value="gym" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Palestra</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="space-y-4">
          <AnnualPlanGenerator
            athleteData={athleteData}
            userName={athleteData.user?.full_name}
            onPlanGenerated={(plan) => {
              setGeneratedAnnualPlan([plan])
              console.log("Annual plan generated:", plan)
            }}
          />
        </TabsContent>

        {/* Tab: Zones Configuration */}
        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {zoneType === "hr" ? (
                  <Heart className="h-5 w-5 text-red-500" />
                ) : (
                  <Gauge className="h-5 w-5 text-yellow-500" />
                )}
                Configurazione Zone di Allenamento
              </CardTitle>
              <CardDescription>Configura le zone per {selectedSport?.name || primarySport}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sport Selection */}
              <div className="grid gap-4">
                <Label>Sport Principale</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {SPORTS.map((sport) => {
                    const Icon = sport.icon
                    return (
                      <button
                        key={sport.id}
                        onClick={() => {
                          setPrimarySport(sport.id)
                          if (!sport.supportsPower && zoneType === "power") {
                            setZoneType("hr")
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                          primarySport === sport.id
                            ? "border-fuchsia-500 bg-fuchsia-500/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${sport.color}`} />
                        <span className="text-xs">{sport.name}</span>
                        {sport.supportsPower && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            PWR
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Zone Type Selection */}
              <div className="space-y-3">
                <Label>Tipo di Zone</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setZoneType("hr")}
                    className={`p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                      zoneType === "hr" ? "border-red-500 bg-red-500/10" : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${zoneType === "hr" ? "text-red-500" : "text-slate-400"}`} />
                    <div className="text-left">
                      <div className="font-semibold">HR Zones</div>
                      <div className="text-sm text-muted-foreground">Zone basate su frequenza cardiaca</div>
                    </div>
                  </button>
                  <button
                    onClick={() => sportSupportsPower && setZoneType("power")}
                    disabled={!sportSupportsPower}
                    className={`p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                      zoneType === "power"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : sportSupportsPower
                          ? "border-slate-700 hover:border-slate-600"
                          : "border-slate-800 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <Gauge className={`h-6 w-6 ${zoneType === "power" ? "text-yellow-500" : "text-slate-400"}`} />
                    <div className="text-left">
                      <div className="font-semibold">Power Zones</div>
                      <div className="text-sm text-muted-foreground">
                        {sportSupportsPower ? "Zone basate su potenza (FTP)" : "Non disponibile per questo sport"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* HR Parameters */}
              {zoneType === "hr" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hrMax">FC Massima (bpm)</Label>
                    <Input
                      id="hrMax"
                      type="number"
                      value={hrMax}
                      onChange={(e) => setHrMax(Number.parseInt(e.target.value) || 190)}
                      min="120"
                      max="220"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrThreshold">FC Soglia / LTHR (bpm)</Label>
                    <Input
                      id="hrThreshold"
                      type="number"
                      value={hrThreshold}
                      onChange={(e) => setHrThreshold(Number.parseInt(e.target.value) || 170)}
                      min="100"
                      max="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrResting">FC a Riposo (bpm)</Label>
                    <Input
                      id="hrResting"
                      type="number"
                      value={hrResting}
                      onChange={(e) => setHrResting(Number.parseInt(e.target.value) || 60)}
                      min="30"
                      max="100"
                    />
                  </div>
                </div>
              )}

              {/* Power Parameters */}
              {zoneType === "power" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ftp">FTP - Functional Threshold Power (Watt)</Label>
                    <Input
                      id="ftp"
                      type="number"
                      value={ftp}
                      onChange={(e) => setFtp(Number.parseInt(e.target.value) || 250)}
                      min="50"
                      max="500"
                    />
                    <p className="text-xs text-muted-foreground">La potenza massima sostenibile per 1 ora</p>
                  </div>
                  <div className="space-y-2">
                    <Label>W/kg (stimato)</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-slate-900/50 flex items-center">
                      <span className="font-mono">{(ftp / 70).toFixed(2)} W/kg</span>
                      <span className="text-xs text-muted-foreground ml-2">(peso stimato 70kg)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* HR Zones Display */}
              {zoneType === "hr" && hrZones && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold text-lg">Zone FC Calcolate</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {Object.entries(hrZones).map(([key, zone]) => (
                      <Card key={key} className="bg-slate-900/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{zone.name}</h4>
                            <Badge className={ZONE_COLORS[key.toUpperCase()]}>{key.toUpperCase()}</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-lg font-bold">
                              {zone.min} - {zone.max} bpm
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {zone.percent.min} - {zone.percent.max}% LTHR
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Power Zones Display */}
              {zoneType === "power" && powerZones && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold text-lg">Zone Potenza Calcolate</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                    {Object.entries(powerZones).map(([key, zone]) => (
                      <Card key={key} className="bg-slate-900/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{zone.name}</h4>
                            <Badge className={ZONE_COLORS[key.toUpperCase()]}>{key.toUpperCase()}</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-lg font-bold">
                              {zone.min} - {zone.max} W
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {zone.percent.min} - {zone.percent.max}% FTP
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleCalculateZones}
                  disabled={isSaving}
                  className={zoneType === "hr" ? "bg-green-600 hover:bg-green-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? "Salvataggio..." : `Calcola Zone ${zoneType === "hr" ? "FC" : "Potenza"} e Salva`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Plan Generation */}
        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Configurazione Piano di Allenamento
              </CardTitle>
              <CardDescription>Genera il tuo piano settimanale basato sui tuoi obiettivi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Training Volume */}
              <div className="space-y-3">
                <Label>Volume di Allenamento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(["low", "medium", "high"] as const).map((volume) => (
                    <button
                      key={volume}
                      onClick={() => setTrainingVolume(volume)}
                      className={`p-4 rounded-lg border-2 transition ${
                        trainingVolume === volume
                          ? "border-fuchsia-500 bg-fuchsia-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-semibold capitalize">
                        {volume === "low" && "Basso"}
                        {volume === "medium" && "Medio"}
                        {volume === "high" && "Alto"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {volume === "low" && "3-5 ore/settimana"}
                        {volume === "medium" && "5-8 ore/settimana"}
                        {volume === "high" && "8+ ore/settimana"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Focus */}
              <div className="space-y-3">
                <Label>Focus Allenamento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(["endurance", "balanced", "intensity"] as const).map((focus) => (
                    <button
                      key={focus}
                      onClick={() => setTrainingFocus(focus)}
                      className={`p-4 rounded-lg border-2 transition ${
                        trainingFocus === focus
                          ? "border-fuchsia-500 bg-fuchsia-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-semibold capitalize">
                        {focus === "endurance" && "Resistenza"}
                        {focus === "balanced" && "Bilanciato"}
                        {focus === "intensity" && "Intensità"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {focus === "endurance" && "Costruzione base aerobica"}
                        {focus === "balanced" && "Mix equilibrato"}
                        {focus === "intensity" && "Focus performance"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone Type Reminder */}
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2 text-sm">
                  {zoneType === "hr" ? (
                    <>
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>
                        Piano basato su <strong>Zone FC</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <Gauge className="h-4 w-4 text-yellow-500" />
                      <span>
                        Piano basato su <strong>Zone Potenza</strong> (FTP: {ftp}W)
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={handleGeneratePlan}
                disabled={!zonesCalculated || isGenerating}
                size="lg"
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Genera Piano Settimanale
                  </>
                )}
              </Button>

              {!zonesCalculated && (
                <p className="text-sm text-muted-foreground text-center">
                  Prima calcola le zone {zoneType === "hr" ? "FC" : "Potenza"} nella tab "Zone"
                </p>
              )}
            </CardContent>
          </Card>

          {/* Add Annual Plan Generator section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-blue-500" />
                Generatore Piano Annuale
              </CardTitle>
              <CardDescription>Definisci gli obiettivi e le fasi per creare un piano annuale completo</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnualPlanGenerator
                athleteData={athleteData}
                userName={athleteData.user?.full_name}
                onPlanGenerated={(plan) => {
                  setGeneratedAnnualPlan([plan])
                  console.log("Annual plan generated:", plan)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Weekly View */}
        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-fuchsia-500" />
                    Vista Settimanale
                  </CardTitle>
                  <CardDescription>Clicca su un giorno per modificare o aggiungere un allenamento</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePlan}
                    disabled={isSaving || generatedPlan.length === 0}
                    variant="outline"
                    className="border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10 bg-transparent"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salva Piano
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Save Status */}
              {saveStatus === "success" && (
                <div className="mb-4 p-3 rounded-lg border border-green-900/50 bg-green-950/20 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="text-green-400">Piano salvato con successo!</p>
                </div>
              )}

              {/* Weekly Calendar */}
              <WeeklyCalendarView
                sessions={generatedPlan}
                onEditSession={handleOpenWorkoutBuilder}
                onAddSession={handleOpenWorkoutBuilder}
                zoneType={zoneType}
              />

              {/* Weekly Stats */}
              {generatedPlan.length > 0 && (
                <Card className="mt-4 bg-slate-900/50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Durata Totale</p>
                        <p className="text-2xl font-bold">
                          {Math.floor(generatedPlan.reduce((sum, s) => sum + s.duration, 0) / 60)}h{" "}
                          {generatedPlan.reduce((sum, s) => sum + s.duration, 0) % 60}m
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">TSS Totale</p>
                        <p className="text-2xl font-bold">{generatedPlan.reduce((sum, s) => sum + (s.tss || 0), 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Sessioni</p>
                        <p className="text-2xl font-bold">{generatedPlan.filter((s) => s.duration > 0).length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Giorni Riposo</p>
                        <p className="text-2xl font-bold">{generatedPlan.filter((s) => s.duration === 0).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gym" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-red-500" />
                Scheda Palestra
              </CardTitle>
              <CardDescription>Crea allenamenti di forza e condizionamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exercise Categories */}
              {(Object.keys(GYM_EXERCISES) as Array<keyof typeof GYM_EXERCISES>).map((category) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold capitalize flex items-center gap-2">
                    {category === "strength" && <Dumbbell className="h-4 w-4" />}
                    {category === "core" && <Target className="h-4 w-4" />}
                    {category === "flexibility" && <Activity className="h-4 w-4" />}
                    {category === "plyometric" && <Flame className="h-4 w-4" />}
                    {category === "strength" && "Forza"}
                    {category === "core" && "Core"}
                    {category === "flexibility" && "Flessibilità"}
                    {category === "plyometric" && "Pliometria"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {GYM_EXERCISES[category].map((exercise) => (
                      <Button
                        key={exercise.id}
                        variant="outline"
                        className="justify-start h-auto py-2 px-3 bg-transparent"
                        onClick={() => {
                          handleAddGymExercise(exercise.id, category)
                          setBuilderSport("gym")
                          setShowWorkoutBuilder(true)
                          // Try to find a rest day or the first available day to add the gym session
                          const restDayIndex = generatedPlan.findIndex((s) => s.duration === 0 && s.sport === "")
                          const firstAvailableIndex = generatedPlan.findIndex((s) => s.duration === 0 || s.sport === "")
                          setSelectedDay(
                            restDayIndex !== -1 ? restDayIndex : firstAvailableIndex !== -1 ? firstAvailableIndex : 0,
                          )
                        }}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        <span className="text-sm">{exercise.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Gym sessions in the week */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Sessioni Palestra nella Settimana</h3>
                <div className="space-y-2">
                  {generatedPlan.filter((s) => s.sport === "gym").length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nessuna sessione palestra. Clicca su un esercizio per aggiungerlo.
                    </p>
                  ) : (
                    generatedPlan
                      .filter((s) => s.sport === "gym")
                      .map((session) => (
                        <Card key={session.day} className="bg-slate-900/50">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <span className="font-medium">{session.dayName}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {session.gymExercises?.length || 0} esercizi
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenWorkoutBuilder(session.day)}>
                              Modifica
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showWorkoutBuilder} onOpenChange={setShowWorkoutBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDay !== null ? DAY_NAMES[selectedDay] : "Nuovo Allenamento"} - Workout Builder
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Sport Selection in Builder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select value={builderSport} onValueChange={setBuilderSport}>
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

              {/* Zone Type in Builder */}
              {builderSport !== "gym" && (
                <div className="space-y-2">
                  <Label>Tipo Zone</Label>
                  <Select
                    value={builderZoneType}
                    onValueChange={(v) => setBuilderZoneType(v as ZoneType)}
                    disabled={!builderSupportsPower}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          HR Zones
                        </div>
                      </SelectItem>
                      <SelectItem value="power" disabled={!builderSupportsPower}>
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-yellow-500" />
                          Power Zones
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Workout Blocks (for non-gym sports) */}
            {builderSport !== "gym" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Blocchi Allenamento Avanzati</Label>
                  <Button variant="outline" size="sm" onClick={handleAddAdvancedBlock}>
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi Blocco
                  </Button>
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {currentAdvancedBlocks.map((block) => (
                      <AdvancedWorkoutBlockComponent
                        key={block.id}
                        block={block}
                        onUpdate={handleUpdateAdvancedBlock}
                        onDelete={() => handleDeleteAdvancedBlock(block.id)}
                        hrZones={hrZones}
                        powerZones={powerZones}
                      />
                    ))}
                    {currentAdvancedBlocks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nessun blocco avanzato. Clicca "Aggiungi Blocco" per iniziare.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Block Summary */}
                {currentAdvancedBlocks.length > 0 && (
                  <>
                    <WorkoutVisualizationChart
                      blocks={currentAdvancedBlocks}
                      hrZones={hrZones}
                      powerZones={powerZones}
                    />

                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Durata Totale:</span>
                          <span className="font-bold ml-2">
                            {currentAdvancedBlocks.reduce((sum, b) => sum + b.totalDuration, 0)} min
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Blocchi:</span>
                          <span className="font-bold ml-2">{currentAdvancedBlocks.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">TSS stimato:</span>
                          <span className="font-bold ml-2">
                            {calculateTSS(
                              currentAdvancedBlocks.reduce((sum, b) => sum + b.totalDuration, 0),
                              currentAdvancedBlocks.find(
                                (b) =>
                                  b.blockType === "constant" ||
                                  b.blockType === "increment" ||
                                  b.blockType === "decrement",
                              )?.primaryZone ||
                                currentAdvancedBlocks[0].primaryZone ||
                                "Z2",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Fallback to legacy blocks if no advanced blocks are present or for simplicity */}
            {builderSport !== "gym" && currentAdvancedBlocks.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Blocchi Allenamento Semplici</Label>
                  <Button variant="outline" size="sm" onClick={handleAddBlock}>
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi Blocco Semplice
                  </Button>
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {currentBlocks.map((block) => (
                      <WorkoutBlockComponent
                        key={block.id}
                        block={block}
                        onUpdate={handleUpdateBlock}
                        onDelete={() => handleDeleteBlock(block.id)}
                        zoneType={builderZoneType}
                        hrZones={hrZones}
                        powerZones={powerZones}
                      />
                    ))}
                    {currentBlocks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nessun blocco semplice. Clicca "Aggiungi Blocco Semplice" per iniziare.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Block Summary */}
                {currentBlocks.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Durata Totale:</span>
                        <span className="font-bold ml-2">
                          {currentBlocks.reduce((sum, b) => sum + b.duration * (b.repetitions || 1), 0)} min
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blocchi:</span>
                        <span className="font-bold ml-2">{currentBlocks.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TSS stimato:</span>
                        <span className="font-bold ml-2">
                          {calculateTSS(
                            currentBlocks.reduce((sum, b) => sum + b.duration * (b.repetitions || 1), 0),
                            currentBlocks.find((b) => b.type === "work")?.zone || "Z2",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gym Exercises */}
            {builderSport === "gym" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Esercizi</Label>
                </div>

                {/* Quick Add Exercise */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.keys(GYM_EXERCISES) as Array<keyof typeof GYM_EXERCISES>).map((category) => (
                    <Select key={category} onValueChange={(v) => handleAddGymExercise(v, category)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder={`+ ${category}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {GYM_EXERCISES[category].map((ex) => (
                          <SelectItem key={ex.id} value={ex.id}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {currentGymExercises.map((exercise) => (
                      <GymExerciseRow
                        key={exercise.id}
                        exercise={exercise}
                        onUpdate={handleUpdateGymExercise}
                        onDelete={() => handleDeleteGymExercise(exercise.id)}
                      />
                    ))}
                    {currentGymExercises.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nessun esercizio. Seleziona una categoria per aggiungere.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Gym Summary */}
                {currentGymExercises.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Esercizi:</span>
                        <span className="font-bold ml-2">{currentGymExercises.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Set Totali:</span>
                        <span className="font-bold ml-2">
                          {currentGymExercises.reduce((sum, e) => sum + e.sets, 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Durata stimata:</span>
                        <span className="font-bold ml-2">
                          {Math.round(currentGymExercises.reduce((sum, e) => sum + e.sets, 0) * 2)} min
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkoutBuilder(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveWorkout} className="bg-fuchsia-600 hover:bg-fuchsia-700">
              <Save className="mr-2 h-4 w-4" />
              Salva Allenamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
