"use client"
import type { AthleteDataType } from "@/components/dashboard-content"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Utensils,
  Pill,
  FlaskConical,
  Activity,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  AlertTriangle,
  Package,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface NutritionPlanProps {
  athleteData: AthleteDataType | null
  userName: string | null | undefined
}

// ============================================
// EMPATHY PERFORMANCE bioMAP CONSTITUTION v2
// Metabolic-Layer + Microbiota/Epigenetic Merge (LOCK)
// ============================================

// LOCK: Substrati per zona (fallback se Metabolic Layer assente)
const ZONE_SUBSTRATES: Record<string, { cho: number; fat: number; pro: number; name: string }> = {
  z1: { cho: 0.4, fat: 0.6, pro: 0, name: "Recovery" },
  z2: { cho: 0.6, fat: 0.4, pro: 0, name: "Endurance" },
  z3: { cho: 0.8, fat: 0.2, pro: 0, name: "Tempo" },
  z4: { cho: 0.9, fat: 0.08, pro: 0.02, name: "Threshold" },
  z5: { cho: 0.98, fat: 0, pro: 0.02, name: "VO2max" },
  z6: { cho: 1.0, fat: 0, pro: 0, name: "Anaerobic" },
  z7: { cho: 1.0, fat: 0, pro: 0, name: "Neuromuscular" },
  gym: { cho: 0.6, fat: 0.3, pro: 0.1, name: "Palestra" },
}

// LOCK: Zone definitions for calculation (same as metabolic-profile-generator)
const ZONE_DEFINITIONS = [
  { id: "Z1", name: "Recovery", cpMin: 0, cpMax: 0.7, color: "#94a3b8" },
  { id: "Z2", name: "Endurance", cpMin: 0.7, cpMax: 0.76, color: "#22c55e" },
  { id: "Z3", name: "Tempo", cpMin: 0.88, cpMax: 0.92, color: "#eab308" },
  { id: "Z4", name: "Threshold", cpMin: 0.98, cpMax: 1.02, color: "#f97316" },
  { id: "Z5", name: "VO2max", cpMin: 1.1, cpMax: 1.2, color: "#ef4444" },
  { id: "Z6", name: "Anaerobic", cpMin: 1.25, cpMax: 1.8, color: "#dc2626" },
  { id: "Z7", name: "Neuromuscular", cpMin: 1.8, cpMax: 3.0, color: "#991b1b" },
]

// LOCK: Classi fueling
const FUELING_CLASS = {
  LOW: { cho_target: 0.3, type: "solido", description: "Training LOW → quasi zero CHO, adattamento" },
  MEDIUM: { cho_target: 0.5, type: "misto", description: "Training MEDIUM → misto solido/liquido" },
  HIGH: { cho_target: 0.5, type: "liquido", description: "Training HIGH → liquido altamente digeribile" },
}

// LOCK: Distribuzione kcal in base a orario allenamento
const MEAL_DISTRIBUTION = {
  morning: {
    colazione: { pct: 0.3, macro: { cho: 0.75, fat: 0.15, pro: 0.1 } },
    pranzo: { pct: 0.25, macro: { cho: 0.65, fat: 0.25, pro: 0.15 } },
    post_workout: { pct: 0.05, macro: { cho: 0.6, fat: 0.1, pro: 0.3 } },
    spuntino: { pct: 0.1, macro: { cho: 0.5, fat: 0.25, pro: 0.25 } },
    merenda: { pct: 0.05, macro: { cho: 0.4, fat: 0.4, pro: 0.2 } },
    cena: { pct: 0.2, macro: { cho: 0.4, fat: 0.4, pro: 0.3 } },
    pre_sonno: { pct: 0.05, macro: { cho: 0.2, fat: 0.3, pro: 0.5 } },
  },
  afternoon: {
    colazione: { pct: 0.22, macro: { cho: 0.65, fat: 0.25, pro: 0.1 } },
    pranzo: { pct: 0.25, macro: { cho: 0.75, fat: 0.15, pro: 0.1 } },
    post_workout: { pct: 0.05, macro: { cho: 0.6, fat: 0.1, pro: 0.3 } },
    spuntino: { pct: 0.1, macro: { cho: 0.5, fat: 0.25, pro: 0.25 } },
    merenda: { pct: 0.08, macro: { cho: 0.4, fat: 0.4, pro: 0.2 } },
    cena: { pct: 0.25, macro: { cho: 0.55, fat: 0.2, pro: 0.25 } },
    pre_sonno: { pct: 0.05, macro: { cho: 0.2, fat: 0.3, pro: 0.5 } },
  },
}

const MICRONUTRIENT_TARGETS = {
  vitamins: {
    b1: { name: "Vitamina B1", target: 1.2, unit: "mg", role: "Metabolismo carboidrati" },
    b6: { name: "Vitamina B6", target: 1.7, unit: "mg", role: "Metabolismo proteine" },
    b12: { name: "Vitamina B12", target: 2.4, unit: "μg", role: "Formazione globuli rossi" },
    c: { name: "Vitamina C", target: 90, unit: "mg", role: "Antiossidante, recupero" },
    d: { name: "Vitamina D", target: 20, unit: "μg", role: "Salute ossea, immunità" },
    e: { name: "Vitamina E", target: 15, unit: "mg", role: "Antiossidante" },
  },
  minerals: {
    iron: { name: "Ferro", target: 18, unit: "mg", role: "Trasporto ossigeno" },
    zinc: { name: "Zinco", target: 11, unit: "mg", role: "Recupero, immunità" },
    magnesium: { name: "Magnesio", target: 420, unit: "mg", role: "Funzione muscolare" },
    calcium: { name: "Calcio", target: 1000, unit: "mg", role: "Salute ossea" },
    sodium: { name: "Sodio", target: 2300, unit: "mg", role: "Bilancio elettroliti" },
    potassium: { name: "Potassio", target: 3500, unit: "mg", role: "Funzione muscolare" },
  },
}

const DAILY_SUPPLEMENT_STACK = {
  base: [
    { name: "Omega-3", dose: "2g", timing: "Colazione", benefit: "Anti-infiammatorio, salute cardiovascolare" },
    { name: "Vitamina D3", dose: "2000 UI", timing: "Colazione", benefit: "Immunità, salute ossea" },
    { name: "Magnesio", dose: "400mg", timing: "Pre-sonno", benefit: "Recupero muscolare, qualità sonno" },
  ],
  training_day: [
    { name: "Caffeina", dose: "200mg", timing: "Pre-workout (-60min)", benefit: "Performance, focus" },
    { name: "Beta-Alanina", dose: "3.2g", timing: "Pre-workout (-30min)", benefit: "Buffer acido lattico" },
    { name: "Creatina", dose: "5g", timing: "Post-workout", benefit: "Forza, recupero ATP" },
    { name: "BCAA", dose: "10g", timing: "Intra-workout", benefit: "Preservazione muscolare" },
    { name: "Glutammina", dose: "10g", timing: "Post-workout", benefit: "Recupero, immunità" },
  ],
  high_intensity: [
    { name: "Citrullina", dose: "6g", timing: "Pre-workout (-45min)", benefit: "Vasodilatazione, NO+" },
    { name: "Sodio Bicarbonato", dose: "0.3g/kg", timing: "Pre-workout (-90min)", benefit: "Buffer acidità" },
  ],
  endurance: [
    { name: "Sale elettrolitico", dose: "500mg", timing: "Ogni 60min", benefit: "Prevenzione crampi" },
    { name: "Ferro (se necessario)", dose: "14mg", timing: "Lontano dai pasti", benefit: "Capacità aerobica" },
  ],
  recovery: [
    { name: "Tart Cherry", dose: "500mg", timing: "Post-workout", benefit: "Anti-infiammatorio naturale" },
    { name: "Collagene", dose: "10g", timing: "Colazione", benefit: "Salute tendini e articolazioni" },
    { name: "ZMA", dose: "30mg Zn + 450mg Mg", timing: "Pre-sonno", benefit: "Recupero ormonale" },
  ],
}

// Brand products database
const BRAND_PRODUCTS: Record<string, Record<string, { name: string; dose: string; note: string }[]>> = {
  Enervit: {
    gel: [{ name: "Enervit Gel", dose: "1 gel (25g CHO)", note: "Ogni 30-45min" }],
    maltodestrine: [{ name: "Enervit Carbo Flow", dose: "30-60g/h", note: "Sciogliere in 500ml" }],
    "carbo-polvere": [{ name: "Enervit G Sport", dose: "40-80g/h", note: "Concentrazione 6-8%" }],
    whey: [{ name: "Enervit Protein", dose: "30g (0.4g/kg)", note: "Post workout entro 30min" }],
    recovery: [{ name: "Enervit Recovery Drink", dose: "1 porzione", note: "CHO:PRO ratio 3:1" }],
    elettroliti: [{ name: "Enervit Isotonic Drink", dose: "500-750ml/h", note: "Durante attività" }],
    barrette: [{ name: "Enervit Power Sport", dose: "1 barretta", note: "Pre o durante attività lunga" }],
  },
  SIS: {
    gel: [{ name: "SIS GO Isotonic Gel", dose: "1 gel (22g CHO)", note: "No acqua necessaria" }],
    maltodestrine: [{ name: "SIS GO Energy", dose: "40-90g/h", note: "In 500-750ml acqua" }],
    "carbo-polvere": [{ name: "SIS Beta Fuel", dose: "80-120g/h", note: "Ratio 1:0.8 per alta intensità" }],
    whey: [{ name: "SIS REGO Rapid Recovery", dose: "50g porzione", note: "20g proteine + 23g CHO" }],
    recovery: [{ name: "SIS REGO Rapid Recovery+", dose: "1 porzione", note: "Con elettroliti e vitamine" }],
    caffeina: [{ name: "SIS GO Caffeine Shot", dose: "150mg caffeina", note: "30min pre o durante" }],
    elettroliti: [{ name: "SIS GO Hydro", dose: "1 tab in 500ml", note: "Zero calorie" }],
    barrette: [{ name: "SIS GO Energy Bar", dose: "1 barretta (26g CHO)", note: "Facile digestione" }],
  },
  "+Watt": {
    gel: [{ name: "+Watt Energel", dose: "1 gel (25g CHO)", note: "Con elettroliti" }],
    maltodestrine: [{ name: "+Watt Maltodex", dose: "40-80g/h", note: "DE 19" }],
    whey: [{ name: "+Watt Whey Protein", dose: "30g", note: "Isolate 90%" }],
    bcaa: [{ name: "+Watt BCAA 8:1:1", dose: "5-10g", note: "Durante o post" }],
    creatina: [{ name: "+Watt Creatina", dose: "3-5g/die", note: "Monoidrato micronizzata" }],
    "beta-alanina": [{ name: "+Watt Beta Alanine", dose: "3-6g/die", note: "Suddivisa in 2 dosi" }],
  },
  Maurten: {
    gel: [{ name: "Maurten Gel 100", dose: "1 gel (25g CHO)", note: "Idrogel technology" }],
    maltodestrine: [{ name: "Maurten Drink Mix 320", dose: "80g/500ml", note: "Per alta intensità" }],
    "carbo-polvere": [{ name: "Maurten Drink Mix 160", dose: "40g/500ml", note: "Per intensità moderata" }],
    caffeina: [{ name: "Maurten Gel 100 CAF", dose: "1 gel + 100mg caffeina", note: "Ultimi 60min" }],
  },
  "226ers": {
    gel: [{ name: "226ers Energy Gel", dose: "1 gel (25g CHO)", note: "Bio ingredients" }],
    maltodestrine: [{ name: "226ers Energy Drink", dose: "40-80g/h", note: "Con amilopectina" }],
    recovery: [{ name: "226ers Recovery Drink", dose: "1 porzione", note: "Vegano disponibile" }],
    bcaa: [{ name: "226ers BCAA", dose: "5g", note: "Ratio 8:1:1" }],
  },
  NamedSport: {
    gel: [{ name: "Total Energy Gel", dose: "1 gel (25g CHO)", note: "Vari gusti" }],
    maltodestrine: [{ name: "Maltonam", dose: "40-80g/h", note: "DE variabile" }],
    whey: [{ name: "100% Whey Protein Shake", dose: "30g", note: "Gusto cioccolato" }],
    creatina: [{ name: "Crea-Gold", dose: "3g/die", note: "Creapure" }],
    recovery: [{ name: "Star Whey Perfect", dose: "1 porzione", note: "Post intenso" }],
  },
  MyProtein: {
    whey: [{ name: "Impact Whey", dose: "25g", note: "Economico e efficace" }],
    maltodestrine: [{ name: "Maltodestrina", dose: "50-100g/h", note: "Bulk economico" }],
    creatina: [{ name: "Creatine Monohydrate", dose: "5g/die", note: "Creapure" }],
    bcaa: [{ name: "BCAA 4:1:1", dose: "5-10g", note: "Durante allenamento" }],
    eaa: [{ name: "EAA", dose: "10g", note: "Tutti gli essenziali" }],
    "beta-alanina": [{ name: "Beta Alanine", dose: "3-6g/die", note: "Powder o tabs" }],
  },
}

// Default GE value
const DEFAULT_GE = 0.23

// Interface for zone consumption data
interface ZoneConsumption {
  kcalH: number
  choGH: number
  fatGH: number
  proGH?: number
}

interface EmpathyZone {
  id: string
  name: string
  min: number
  max: number
  cpPercent?: { min: number; max: number }
  color: string
  substrates: { cho: number; fat: number; pro: number }
  consumption: ZoneConsumption
}

interface MetabolicProfile {
  ftp_watts?: number // renamed from ftp to ftp_watts to match database field
  ge?: number
  empathy_zones?: Record<string, EmpathyZone>
  hr_zones?: Record<string, EmpathyZone>
}

interface SportSupplements {
  brands: string[]
  types: string[]
}

interface TrainingActivity {
  id: string
  day_of_week: number
  sport_type: string
  duration: number
  zone: number
  workout_name?: string
  target_power_min?: number
  target_power_max?: number
  activity_date?: string
  title?: string
  tss?: number
}

interface AthleteConstraintsData {
  intolerances: string[]
  allergies: string[]
  dietary_preferences: string[]
  dietary_limits: string[]
}

// Interface for tracking used foods across the week
interface WeeklyFoodUsage {
  [mealType: string]: {
    [foodName: string]: number
  }
}

// LOCK: Expanded MEAL_DATABASE with more variety for weekly rotation
const MEAL_DATABASE: Record<
  string,
  { name: string; cho: number; fat: number; pro: number; kcal: number; tags: string[] }[]
> = {
  colazione: [
    { name: "Porridge avena con banana e miele", cho: 65, fat: 8, pro: 12, kcal: 380, tags: ["cereali", "frutta"] },
    {
      name: "Pancakes proteici con frutti di bosco",
      cho: 45,
      fat: 10,
      pro: 25,
      kcal: 370,
      tags: ["uova", "latticini"],
    },
    { name: "Toast integrale con avocado e uova", cho: 35, fat: 18, pro: 15, kcal: 358, tags: ["uova", "cereali"] },
    { name: "Yogurt greco con granola e frutta", cho: 50, fat: 12, pro: 20, kcal: 388, tags: ["latticini", "frutta"] },
    { name: "Smoothie bowl proteico", cho: 55, fat: 8, pro: 22, kcal: 382, tags: ["frutta", "latticini"] },
    {
      name: "Riso soffiato con latte e frutta secca",
      cho: 60,
      fat: 15,
      pro: 10,
      kcal: 415,
      tags: ["latticini", "frutta secca"],
    },
    {
      name: "Crema di riso con miele e mandorle",
      cho: 70,
      fat: 12,
      pro: 8,
      kcal: 420,
      tags: ["cereali", "frutta secca"],
    },
    {
      name: "Fette biscottate con marmellata e ricotta",
      cho: 55,
      fat: 10,
      pro: 15,
      kcal: 372,
      tags: ["cereali", "latticini"],
    },
    { name: "Muesli con latte di mandorla e banana", cho: 62, fat: 8, pro: 10, kcal: 362, tags: ["cereali", "frutta"] },
    { name: "Uova strapazzate con pane tostato", cho: 30, fat: 16, pro: 20, kcal: 344, tags: ["uova", "cereali"] },
    {
      name: "Bowl di quinoa con frutta e noci",
      cho: 58,
      fat: 14,
      pro: 12,
      kcal: 406,
      tags: ["cereali", "frutta", "frutta secca"],
    },
    {
      name: "Pane integrale con burro di arachidi",
      cho: 40,
      fat: 18,
      pro: 14,
      kcal: 378,
      tags: ["cereali", "frutta secca"],
    },
    { name: "Frittata di albumi con verdure", cho: 12, fat: 8, pro: 24, kcal: 216, tags: ["uova"] },
    { name: "Cornetti integrali con miele", cho: 52, fat: 14, pro: 8, kcal: 366, tags: ["cereali"] },
  ],
  pranzo: [
    { name: "Pasta integrale con pollo e verdure", cho: 70, fat: 12, pro: 35, kcal: 528, tags: ["cereali", "carne"] },
    { name: "Riso basmati con salmone e broccoli", cho: 65, fat: 18, pro: 32, kcal: 550, tags: ["pesce", "cereali"] },
    { name: "Quinoa bowl con ceci e verdure", cho: 55, fat: 14, pro: 22, kcal: 434, tags: ["legumi", "vegano"] },
    { name: "Insalata di farro con tonno", cho: 50, fat: 12, pro: 28, kcal: 420, tags: ["pesce", "cereali"] },
    { name: "Pollo alla griglia con patate dolci", cho: 45, fat: 10, pro: 40, kcal: 430, tags: ["carne", "tuberi"] },
    { name: "Bowl di riso con tofu e edamame", cho: 60, fat: 12, pro: 25, kcal: 448, tags: ["vegano", "soia"] },
    { name: "Pasta al pesto con gamberi", cho: 65, fat: 16, pro: 30, kcal: 524, tags: ["cereali", "crostacei"] },
    { name: "Risotto ai funghi con parmigiano", cho: 68, fat: 14, pro: 18, kcal: 474, tags: ["cereali", "latticini"] },
    { name: "Couscous con verdure e ceci", cho: 62, fat: 10, pro: 20, kcal: 418, tags: ["cereali", "legumi"] },
    {
      name: "Piadina integrale con tacchino e verdure",
      cho: 55,
      fat: 12,
      pro: 32,
      kcal: 460,
      tags: ["cereali", "carne"],
    },
    { name: "Buddha bowl con avocado e uovo", cho: 48, fat: 20, pro: 22, kcal: 460, tags: ["uova", "vegano"] },
    { name: "Gnocchi di patate con ragù magro", cho: 72, fat: 8, pro: 25, kcal: 464, tags: ["tuberi", "carne"] },
    { name: "Insalata di orzo con feta e olive", cho: 52, fat: 16, pro: 14, kcal: 408, tags: ["cereali", "latticini"] },
    {
      name: "Wrap integrale con hummus e falafel",
      cho: 58,
      fat: 14,
      pro: 18,
      kcal: 430,
      tags: ["cereali", "legumi", "vegano"],
    },
  ],
  cena: [
    { name: "Orata al forno con verdure grigliate", cho: 20, fat: 15, pro: 35, kcal: 355, tags: ["pesce"] },
    { name: "Petto di tacchino con riso e spinaci", cho: 40, fat: 8, pro: 38, kcal: 384, tags: ["carne", "cereali"] },
    { name: "Frittata di albumi con verdure", cho: 15, fat: 12, pro: 28, kcal: 276, tags: ["uova"] },
    { name: "Zuppa di legumi con crostini", cho: 45, fat: 10, pro: 22, kcal: 358, tags: ["legumi", "vegano"] },
    { name: "Salmone con quinoa e asparagi", cho: 35, fat: 20, pro: 38, kcal: 472, tags: ["pesce", "cereali"] },
    { name: "Burger di lenticchie con insalata", cho: 40, fat: 12, pro: 20, kcal: 348, tags: ["legumi", "vegano"] },
    { name: "Pollo al limone con patate arrosto", cho: 35, fat: 12, pro: 36, kcal: 392, tags: ["carne", "tuberi"] },
    { name: "Merluzzo al vapore con verdure", cho: 18, fat: 8, pro: 32, kcal: 272, tags: ["pesce"] },
    { name: "Scaloppine di vitello con funghi", cho: 12, fat: 14, pro: 34, kcal: 314, tags: ["carne"] },
    { name: "Tofu saltato con verdure e sesamo", cho: 22, fat: 14, pro: 20, kcal: 294, tags: ["soia", "vegano"] },
    { name: "Spigola al sale con patate", cho: 30, fat: 12, pro: 35, kcal: 368, tags: ["pesce", "tuberi"] },
    { name: "Petto di pollo ripieno con spinaci", cho: 10, fat: 12, pro: 40, kcal: 308, tags: ["carne"] },
    { name: "Vellutata di zucca con crostini", cho: 38, fat: 10, pro: 12, kcal: 290, tags: ["vegano"] },
    {
      name: "Trota con mandorle e riso",
      cho: 42,
      fat: 16,
      pro: 30,
      kcal: 432,
      tags: ["pesce", "cereali", "frutta secca"],
    },
  ],
  spuntino: [
    { name: "Frutta fresca con mandorle", cho: 25, fat: 12, pro: 6, kcal: 228, tags: ["frutta", "frutta secca"] },
    { name: "Yogurt con miele", cho: 20, fat: 5, pro: 12, kcal: 173, tags: ["latticini"] },
    {
      name: "Barretta energetica fatta in casa",
      cho: 30,
      fat: 8,
      pro: 8,
      kcal: 224,
      tags: ["cereali", "frutta secca"],
    },
    { name: "Hummus con verdure crude", cho: 18, fat: 10, pro: 8, kcal: 194, tags: ["legumi", "vegano"] },
    { name: "Ricotta con frutta secca", cho: 10, fat: 12, pro: 14, kcal: 204, tags: ["latticini", "frutta secca"] },
    { name: "Banana con burro di mandorle", cho: 32, fat: 10, pro: 5, kcal: 238, tags: ["frutta", "frutta secca"] },
    { name: "Mix di frutta secca e cioccolato fondente", cho: 22, fat: 16, pro: 6, kcal: 260, tags: ["frutta secca"] },
    { name: "Crackers integrali con formaggio", cho: 24, fat: 10, pro: 10, kcal: 226, tags: ["cereali", "latticini"] },
    { name: "Smoothie proteico con frutta", cho: 28, fat: 4, pro: 18, kcal: 220, tags: ["frutta", "latticini"] },
    { name: "Pane di segale con avocado", cho: 26, fat: 12, pro: 6, kcal: 236, tags: ["cereali"] },
    { name: "Gallette di riso con miele", cho: 30, fat: 2, pro: 4, kcal: 154, tags: ["cereali"] },
    { name: "Mela cotta con cannella e noci", cho: 28, fat: 8, pro: 4, kcal: 200, tags: ["frutta", "frutta secca"] },
  ],
  pre_sonno: [
    { name: "Caseina con cacao", cho: 8, fat: 2, pro: 25, kcal: 150, tags: ["latticini"] },
    { name: "Cottage cheese con cannella", cho: 6, fat: 4, pro: 20, kcal: 140, tags: ["latticini"] },
    { name: "Yogurt greco magro", cho: 8, fat: 2, pro: 18, kcal: 122, tags: ["latticini"] },
    { name: "Frullato di latte e banana", cho: 25, fat: 3, pro: 10, kcal: 167, tags: ["latticini", "frutta"] },
    { name: "Ricotta con miele", cho: 12, fat: 6, pro: 16, kcal: 166, tags: ["latticini"] },
    { name: "Latte caldo con cacao", cho: 18, fat: 4, pro: 10, kcal: 148, tags: ["latticini"] },
    { name: "Pudding di chia con latte", cho: 15, fat: 8, pro: 8, kcal: 164, tags: ["latticini"] },
  ],
}

// Tags to exclude based on dietary constraints
const CONSTRAINT_TAG_MAP: Record<string, string[]> = {
  // Intolerances
  Lattosio: ["latticini"],
  Glutine: ["cereali"],
  Fruttosio: ["frutta"],
  // Allergies
  "Latte e derivati": ["latticini"],
  Uova: ["uova"],
  Pesce: ["pesce"],
  Crostacei: ["crostacei"],
  "Frutta a guscio": ["frutta secca"],
  Arachidi: ["arachidi"],
  Soia: ["soia"],
  Sedano: ["sedano"],
  Senape: ["senape"],
  Sesamo: ["sesamo"],
  Molluschi: ["molluschi"],
  Lupini: ["lupini"],
  // Dietary preferences
  Vegetariano: ["carne", "pesce"],
  Vegano: ["carne", "pesce", "latticini", "uova"],
  Pescetariano: ["carne"],
}

function NutritionPlan({ athleteData, userName }: NutritionPlanProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [activeTab, setActiveTab] = useState("biomap")
  const [metabolicProfile, setMetabolicProfile] = useState<MetabolicProfile | null>(null)
  const [sportSupplements, setSportSupplements] = useState<SportSupplements>({ brands: [], types: [] })
  const [weeklyActivities, setWeeklyActivities] = useState<TrainingActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [athleteConstraints, setAthleteConstraints] = useState<AthleteConstraintsData>({
    intolerances: [],
    allergies: [],
    dietary_preferences: [],
    dietary_limits: [],
  })

  const [weeklyFoodUsage, setWeeklyFoodUsage] = useState<WeeklyFoodUsage>({})

  const athleteId = athleteData?.id
  const weight = athleteData?.weight || 70
  const height = athleteData?.height || 175

  // Load metabolic profile and supplements preferences
  useEffect(() => {
    const loadData = async () => {
      if (!athleteId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient() // Changed getClient() to createClient()
      if (!supabase) {
        setIsLoading(false)
        return
      }

      try {
        let profileData = null

        // First try to get current profile
        const { data: currentProfile, error: currentError } = await supabase
          .from("metabolic_profiles")
          .select("ftp_watts, empathy_zones, hr_zones")
          .eq("athlete_id", athleteId)
          .eq("is_current", true)
          .single()

        if (currentError) {
          console.log("[v0] Error loading current metabolic profile:", currentError.message, currentError.code)
        }

        if (currentProfile) {
          profileData = currentProfile
          console.log("[v0] Loaded CURRENT metabolic profile, FTP:", currentProfile.ftp_watts)
        } else {
          // Fallback: get most recent profile
          const { data: recentProfile, error: recentError } = await supabase
            .from("metabolic_profiles")
            .select("ftp_watts, empathy_zones, hr_zones")
            .eq("athlete_id", athleteId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (recentError) {
            console.log("[v0] Error loading recent metabolic profile:", recentError.message, recentError.code)
          }

          if (recentProfile) {
            profileData = recentProfile
            console.log("[v0] Loaded RECENT metabolic profile, FTP:", recentProfile.ftp_watts)
          }
        }

        if (profileData) {
          setMetabolicProfile(profileData)
          console.log("[v0] Metabolic profile loaded:", {
            ftp_watts: profileData.ftp_watts,
            has_empathy_zones: !!profileData.empathy_zones,
            empathy_zones_keys: profileData.empathy_zones ? Object.keys(profileData.empathy_zones) : [],
            has_hr_zones: !!profileData.hr_zones,
          })

          // Log empathy_zones details if present
          if (profileData.empathy_zones) {
            const z2 = profileData.empathy_zones["z2"] || profileData.empathy_zones["Z2"]
            if (z2) {
              console.log("[v0] Z2 from empathy_zones:", z2.consumption)
            }
          }
        } else {
          console.log("[v0] No metabolic profile found for athlete:", athleteId)
        }

        const { data: constraintsData } = await supabase
          .from("athlete_constraints")
          .select("intolerances, allergies, dietary_preferences, dietary_limits, notes")
          .eq("athlete_id", athleteId)
          .single()

        if (constraintsData) {
          // Set dietary constraints
          setAthleteConstraints({
            intolerances: constraintsData.intolerances || [],
            allergies: constraintsData.allergies || [],
            dietary_preferences: constraintsData.dietary_preferences || [],
            dietary_limits: constraintsData.dietary_limits || [],
          })
          console.log("[v0] Loaded athlete constraints:", {
            intolerances: constraintsData.intolerances,
            allergies: constraintsData.allergies,
            dietary_preferences: constraintsData.dietary_preferences,
          })

          // Parse sport supplements from notes
          if (constraintsData.notes) {
            try {
              const notes =
                typeof constraintsData.notes === "string" ? JSON.parse(constraintsData.notes) : constraintsData.notes

              if (notes.sport_supplements) {
                setSportSupplements({
                  brands: notes.sport_supplements.brands || [],
                  types: notes.sport_supplements.types || [],
                })
                console.log("[v0] Loaded sport supplements:", notes.sport_supplements)
              }
            } catch (e) {
              console.log("[v0] Error parsing supplements notes:", e)
            }
          }
        }

        // Load activities for current week
        const today = new Date()
        const dayOfWeek = today.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)
        monday.setHours(0, 0, 0, 0)

        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)

        const mondayStr = monday.toISOString().split("T")[0]
        const sundayStr = sunday.toISOString().split("T")[0]

        // Load activities for current week
        const { data: activitiesData } = await supabase
          .from("training_activities")
          .select("*")
          .eq("athlete_id", athleteId)
          .gte("activity_date", mondayStr)
          .lte("activity_date", sundayStr)
          .order("activity_date", { ascending: true })

        if (activitiesData && activitiesData.length > 0) {
          // Convert activity_date to day_of_week (0 = Monday)
          const converted = activitiesData.map((w: any) => {
            const activityDate = new Date(w.activity_date)
            let dow = activityDate.getDay() - 1
            if (dow < 0) dow = 6 // Sunday becomes 6

            return {
              id: w.id,
              day_of_week: dow,
              sport_type: w.activity_type || w.sport_type || "cycling",
              duration: w.duration_minutes || w.duration || 60,
              zone: Number.parseInt(w.target_zone?.replace(/[^0-9]/g, "") || "2") || 2,
              workout_name: w.title,
              target_power_min: w.target_power_min,
              target_power_max: w.target_power_max,
              activity_date: w.activity_date,
              title: w.title,
              tss: w.tss,
            }
          })
          setWeeklyActivities(converted)
          console.log("[v0] Loaded and converted activities:", converted.length, "activities")
        } else {
          // Fallback: try legacy table
          const { data: legacyData } = await supabase
            .from("training_activities")
            .select("*")
            .eq("athlete_id", athleteId)
            .order("day_of_week", { ascending: true })

          if (legacyData && legacyData.length > 0) {
            const converted = legacyData.map((w: any) => ({
              id: w.id,
              day_of_week: w.day_of_week ?? 0,
              sport_type: w.activity_type || w.sport_type || "cycling",
              duration: w.duration_minutes || w.duration || 60,
              zone: Number.parseInt(w.target_zone?.replace(/[^0-9]/g, "") || "2") || 2,
              workout_name: w.title,
              target_power_min: w.target_power_min,
              target_power_max: w.target_power_max,
              title: w.title,
              tss: w.tss,
            }))
            setWeeklyActivities(converted)
            console.log("[v0] Loaded legacy activities:", converted.length, "activities")
          }
        }
      } catch (error) {
        console.error("[v0] Error loading nutrition data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [athleteId])

  // Get zone consumption from metabolic profile or calculate it
  const getZoneConsumption = (zoneNumber: number): ZoneConsumption => {
    const zoneKeyLower = `z${zoneNumber}`
    const zoneKeyUpper = `Z${zoneNumber}`

    // 1. Try to get from empathy_zones (personalized data from metabolic-profile-generator)
    if (metabolicProfile?.empathy_zones) {
      const zone = metabolicProfile.empathy_zones[zoneKeyLower] || metabolicProfile.empathy_zones[zoneKeyUpper]
      if (zone?.consumption) {
        console.log(`[v0] Using empathy_zones consumption for ${zoneKeyLower}:`, zone.consumption)
        return zone.consumption
      }
    }

    // 2. Try to get from hr_zones
    if (metabolicProfile?.hr_zones) {
      const zone = metabolicProfile.hr_zones[zoneKeyLower] || metabolicProfile.hr_zones[zoneKeyUpper]
      if (zone?.consumption) {
        console.log(`[v0] Using hr_zones consumption for ${zoneKeyLower}:`, zone.consumption)
        return zone.consumption
      }
    }

    // 3. Calculate dynamically using FTP and GE (same formula as metabolic-profile-generator)
    const ftp = metabolicProfile?.ftp_watts || 250
    const ge = metabolicProfile?.ge || DEFAULT_GE
    const zoneDef = ZONE_DEFINITIONS[zoneNumber - 1]

    if (zoneDef) {
      const min = Math.round(ftp * zoneDef.cpMin)
      const max = Math.round(ftp * zoneDef.cpMax)
      const midPower = (min + max) / 2

      // kcal/h = W / GE × 0.86 (same formula as metabolic-profile-generator)
      const kcalH = (midPower / ge) * 0.86

      // Get substrates for this zone
      const substrates = ZONE_SUBSTRATES[zoneKeyLower] || { cho: 0.6, fat: 0.4, pro: 0 }

      // CHO g/h = (kcal × %CHO) / 4 (same formula as metabolic-profile-generator)
      // FAT g/h = (kcal × %FAT) / 9 (same formula as metabolic-profile-generator)
      // PRO g/h = (kcal × %PRO) / 4 (same formula as metabolic-profile-generator)
      const consumption = {
        kcalH: Math.round(kcalH),
        choGH: Math.round((kcalH * substrates.cho) / 4),
        fatGH: Math.round((kcalH * substrates.fat) / 9),
        proGH: Math.round((kcalH * substrates.pro) / 4),
      }

      console.log(
        `[v0] Calculated consumption for ${zoneKeyLower} (FTP=${ftp}, GE=${ge}, midPower=${midPower}):`,
        consumption,
      )
      return consumption
    }

    // 4. Fallback to default values
    console.log(`[v0] Using fallback consumption for ${zoneKeyLower}`)
    return { kcalH: 700, choGH: 100, fatGH: 30, proGH: 0 }
  }

  // Get activity for selected day
  const selectedActivity = useMemo(() => {
    return weeklyActivities.find((a) => a.day_of_week === selectedDay)
  }, [weeklyActivities, selectedDay])

  // Calculate workout metrics
  const workoutMetrics = useMemo(() => {
    if (!selectedActivity) {
      return { kcal: 0, choBurned: 0, fatBurned: 0, duration: 0, zone: 1, zoneName: "Rest" }
    }

    const zone = selectedActivity.zone || 2
    const duration = selectedActivity.duration || 60
    const durationHours = duration / 60

    // Get consumption for this zone from metabolic profile
    const consumption = getZoneConsumption(zone)

    // Calculate totals
    const kcal = Math.round(consumption.kcalH * durationHours)
    const choBurned = Math.round(consumption.choGH * durationHours)
    const fatBurned = Math.round(consumption.fatGH * durationHours)

    const zoneName = ZONE_SUBSTRATES[`z${zone}`]?.name || "Endurance"

    console.log(`[v0] Workout metrics for Z${zone} ${duration}min:`, {
      consumption,
      durationHours,
      kcal,
      choBurned,
      fatBurned,
    })

    return { kcal, choBurned, fatBurned, duration, zone, zoneName }
  }, [selectedActivity, metabolicProfile])

  // Calculate BMR using Katch-McArdle
  const bmr = useMemo(() => {
    const lbm = weight * (1 - 0.15) // Assume 15% body fat
    return Math.round(370 + 21.6 * lbm)
  }, [weight])

  // Calculate daily calories
  const dailyKcal = useMemo(() => {
    // BMR + 15% TEF + 40% of workout consumption for meals
    return Math.round(bmr + bmr * 0.15 + workoutMetrics.kcal * 0.4)
  }, [bmr, workoutMetrics.kcal])

  // Calculate intra-workout CHO
  const intraWorkCho = useMemo(() => {
    // 50% of CHO burned during workout
    return Math.round(workoutMetrics.choBurned * 0.5)
  }, [workoutMetrics.choBurned])

  // Determine fueling class based on zone and duration
  const fuelingClass = useMemo(() => {
    if (workoutMetrics.zone <= 2 && workoutMetrics.duration < 90) return "LOW"
    if (workoutMetrics.zone >= 4 || workoutMetrics.duration > 180) return "HIGH"
    return "MEDIUM"
  }, [workoutMetrics])

  const preWorkoutStack = useMemo(() => {
    const stack: { name: string; dose: string; note: string; timing: string }[] = []
    const preferredBrands = sportSupplements.brands.length > 0 ? sportSupplements.brands : ["Enervit"]
    const preferredTypes = sportSupplements.types
    const zone = workoutMetrics.zone
    const duration = workoutMetrics.duration

    // Creatina per allenamenti di forza (Z5-Z6) o intervalli
    if (zone >= 5 || selectedActivity?.title?.toLowerCase().includes("forza")) {
      stack.push({
        name: "Creatina Monoidrato",
        dose: "5g",
        note: "Migliora potenza e recupero tra le serie",
        timing: "30 min prima",
      })
    }

    // Beta-alanina per VO2max e intervalli intensi (Z4-Z5)
    if (
      zone >= 4 ||
      selectedActivity?.title?.toLowerCase().includes("vo2") ||
      selectedActivity?.title?.toLowerCase().includes("interval")
    ) {
      stack.push({
        name: "Beta-Alanina",
        dose: "3-4g",
        note: "Buffer acido lattico per sforzi >60s",
        timing: "30-45 min prima",
      })
    }

    // Caffeina per allenamenti intensi o lunghi
    if ((zone >= 4 || duration > 120) && preferredTypes.includes("caffeina")) {
      for (const brand of preferredBrands) {
        const brandProducts = BRAND_PRODUCTS[brand]
        if (brandProducts?.caffeina) {
          stack.push({
            name: brandProducts.caffeina[0].name,
            dose: "100-200mg (1-3mg/kg)",
            note: brandProducts.caffeina[0].note,
            timing: "45-60 min prima",
          })
          break
        }
      }
    }

    // Carboidrati pre se allenamento lungo
    if (duration > 90 && fuelingClass !== "LOW") {
      stack.push({
        name: "Carboidrati complessi",
        dose: "1-2g/kg",
        note: "Pasto 2-3h prima o snack 1h prima",
        timing: "2-3h prima",
      })
    }

    // Elettroliti pre se sudorazione prevista alta
    if (duration > 60) {
      stack.push({
        name: "Pre-idratazione",
        dose: "500ml acqua + elettroliti",
        note: "Inizia idratato",
        timing: "2h prima",
      })
    }

    return stack
  }, [workoutMetrics, selectedActivity, sportSupplements, fuelingClass])

  const intraWorkoutTiming = useMemo(() => {
    if (!selectedActivity || workoutMetrics.duration < 30) return []

    const duration = workoutMetrics.duration
    const totalCho = intraWorkCho
    const intervals: { time: number; product: string; cho: number; brand: string; details: string }[] = []

    // Start fueling after 20 minutes for workouts > 60min, or 30min for shorter
    const startTime = duration > 60 ? 20 : 30
    const intervalMinutes = 20

    // Calculate CHO per interval
    const numIntervals = Math.floor((duration - startTime) / intervalMinutes) + 1
    const choPerInterval = Math.round(totalCho / Math.max(numIntervals, 1))

    // Get athlete's preferred products for rotation
    const preferredBrands = sportSupplements.brands.length > 0 ? sportSupplements.brands : ["Enervit"]
    const preferredTypes =
      sportSupplements.types.length > 0 ? sportSupplements.types : ["gel", "barrette", "maltodestrine"]

    // Build product pool for rotation
    const productPool: { name: string; cho: number; brand: string; type: string }[] = []

    for (const brand of preferredBrands) {
      const brandProducts = BRAND_PRODUCTS[brand]
      if (!brandProducts) continue

      // Add gels
      if (preferredTypes.includes("gel") && brandProducts.gel) {
        for (const gel of brandProducts.gel) {
          productPool.push({ name: gel.name, cho: 25, brand, type: "gel" })
        }
      }

      // Add bars
      if (preferredTypes.includes("barrette") && brandProducts.barrette) {
        for (const bar of brandProducts.barrette) {
          productPool.push({ name: bar.name, cho: 30, brand, type: "barretta" })
        }
      }

      // Add maltodextrin
      if (preferredTypes.includes("maltodestrine") && brandProducts.maltodestrine) {
        productPool.push({ name: brandProducts.maltodestrine[0].name, cho: 30, brand, type: "maltodestrina" })
      }

      // Add carbo powder
      if (preferredTypes.includes("carbo-polvere") && brandProducts["carbo-polvere"]) {
        productPool.push({ name: brandProducts["carbo-polvere"][0].name, cho: 30, brand, type: "drink" })
      }
    }

    // Fallback if no products found
    if (productPool.length === 0) {
      productPool.push(
        { name: "Gel energetico", cho: 25, brand: "Generico", type: "gel" },
        { name: "Barretta energetica", cho: 30, brand: "Generico", type: "barretta" },
        { name: "Maltodestrina", cho: 30, brand: "Generico", type: "drink" },
      )
    }

    // Generate intervals with product rotation
    let productIndex = 0
    let accumulatedCho = 0

    for (let time = startTime; time <= duration; time += intervalMinutes) {
      const product = productPool[productIndex % productPool.length]
      const choForThisInterval = Math.min(choPerInterval, product.cho)
      accumulatedCho += choForThisInterval

      // Determine specific details based on product type and CHO needed
      let details = ""
      if (product.type === "gel") {
        const gelsNeeded = Math.ceil(choForThisInterval / 25)
        details = gelsNeeded === 1 ? "1 gel" : `${gelsNeeded} gel`
      } else if (product.type === "barretta") {
        details = choForThisInterval > 30 ? "1 barretta intera" : "1/2 barretta"
      } else if (product.type === "maltodestrina" || product.type === "drink") {
        details = `${choForThisInterval}g in 200ml acqua`
      }

      intervals.push({
        time,
        product: product.name,
        cho: choForThisInterval,
        brand: product.brand,
        details,
      })

      productIndex++
    }

    return intervals
  }, [selectedActivity, workoutMetrics.duration, intraWorkCho, sportSupplements])

  // Placeholder for intraWorkoutStack, as intraWorkoutTiming now shows the details
  const intraWorkoutStack = useMemo(() => {
    // This could be a summary of the types of products suggested in intraWorkoutTiming
    // or a separate list if specific products are prioritized.
    // For now, returning an empty array as intraWorkoutTiming is more detailed.
    return []
  }, [])

  const postWorkoutStack = useMemo(() => {
    const stack: { name: string; dose: string; note: string; timing: string }[] = []
    const preferredBrands = sportSupplements.brands.length > 0 ? sportSupplements.brands : ["Enervit"]
    const preferredTypes = sportSupplements.types
    const zone = workoutMetrics.zone
    const duration = workoutMetrics.duration
    const choBurned = workoutMetrics.choBurned

    // Recovery drink per allenamenti lunghi o intensi
    if ((duration > 90 || zone >= 4) && preferredTypes.includes("recovery")) {
      for (const brand of preferredBrands) {
        const brandProducts = BRAND_PRODUCTS[brand]
        if (brandProducts?.recovery) {
          stack.push({
            name: brandProducts.recovery[0].name,
            dose: "30-40g",
            note: "Rapporto 3:1 o 4:1 CHO:PRO per recupero ottimale",
            timing: "Entro 30 min",
          })
          break
        }
      }
    }

    // Whey protein per tutti gli allenamenti
    if (preferredTypes.includes("whey")) {
      for (const brand of preferredBrands) {
        const brandProducts = BRAND_PRODUCTS[brand]
        if (brandProducts?.whey) {
          const proteinDose = Math.round(weight * 0.3) // 0.3g/kg
          stack.push({
            name: brandProducts.whey[0].name,
            dose: `${proteinDose}-${proteinDose + 10}g`,
            note: "Sintesi proteica muscolare",
            timing: "Entro 1-2h",
          })
          break
        }
      }
    } else {
      // Fallback protein recommendation
      stack.push({
        name: "Proteine (cibo o shake)",
        dose: `${Math.round(weight * 0.3)}-${Math.round(weight * 0.4)}g`,
        note: "Uova, yogurt greco, pollo, o shake proteico",
        timing: "Entro 1-2h",
      })
    }

    // Carboidrati post per ripristino glicogeno
    if (choBurned > 50) {
      const choToRestore = Math.round(choBurned * 0.8) // 80% dei CHO bruciati
      stack.push({
        name: "Carboidrati",
        dose: `${choToRestore}g`,
        note: "Riso, pasta, patate, frutta per ripristino glicogeno",
        timing: "Entro 2h",
      })
    }

    // Creatina post se forza
    if (zone >= 5 || selectedActivity?.title?.toLowerCase().includes("forza")) {
      stack.push({
        name: "Creatina Monoidrato",
        dose: "3-5g",
        note: "Assorbimento migliore con carboidrati post-workout",
        timing: "Con pasto post",
      })
    }

    // Elettroliti post se allenamento lungo
    if (duration > 60) {
      stack.push({
        name: "Reidratazione",
        dose: "150% peso perso in liquidi",
        note: "Acqua + elettroliti (500-700mg Na/L)",
        timing: "Nelle 2-4h successive",
      })
    }

    return stack
  }, [workoutMetrics, weight, sportSupplements, selectedActivity])

  const weeklyMealPlan = useMemo(() => {
    const MAX_WEEKLY_REPETITIONS = 2 // Max times a food can repeat in a week
    const weekPlan: Record<number, typeof mealPlan> = {}
    const usedFoods: WeeklyFoodUsage = {}

    // Get tags to exclude based on constraints
    const excludedTags: string[] = []
    athleteConstraints.intolerances.forEach((intol) => {
      const tags = CONSTRAINT_TAG_MAP[intol]
      if (tags) excludedTags.push(...tags)
    })
    athleteConstraints.allergies.forEach((allergy) => {
      const tags = CONSTRAINT_TAG_MAP[allergy]
      if (tags) excludedTags.push(...tags)
    })
    athleteConstraints.dietary_preferences.forEach((pref) => {
      const tags = CONSTRAINT_TAG_MAP[pref]
      if (tags) excludedTags.push(...tags)
    })

    // Filter meals that don't contain excluded tags
    const filterMeals = (meals: typeof MEAL_DATABASE.colazione) => {
      return meals.filter((meal) => !meal.tags.some((tag) => excludedTags.includes(tag)))
    }

    // Select a meal that hasn't been used too much this week
    const selectMealWithRotation = (meals: typeof MEAL_DATABASE.colazione, mealType: string, targetKcal: number) => {
      // Initialize usage tracking for this meal type
      if (!usedFoods[mealType]) {
        usedFoods[mealType] = {}
      }

      // Filter out meals used too many times
      const availableMeals = meals.filter((meal) => {
        const timesUsed = usedFoods[mealType][meal.name] || 0
        return timesUsed < MAX_WEEKLY_REPETITIONS
      })

      // If all meals exhausted, reset and use all (shouldn't happen with 7+ options)
      const mealsToChoose = availableMeals.length > 0 ? availableMeals : meals

      // Sort by how close they are to target, with preference for less used
      const sortedMeals = [...mealsToChoose].sort((a, b) => {
        const aDiff = Math.abs(a.kcal - targetKcal)
        const bDiff = Math.abs(b.kcal - targetKcal)
        const aUsed = usedFoods[mealType][a.name] || 0
        const bUsed = usedFoods[mealType][b.name] || 0

        // Prioritize less used foods, then by calorie match
        if (aUsed !== bUsed) return aUsed - bUsed
        return aDiff - bDiff
      })

      const selectedMeal = sortedMeals[0]

      // Track usage
      usedFoods[mealType][selectedMeal.name] = (usedFoods[mealType][selectedMeal.name] || 0) + 1

      return selectedMeal
    }

    // Generate plan for each day of the week
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayActivity = weeklyActivities.find((a) => a.day_of_week === dayIndex)

      // Calculate daily kcal for this specific day
      let dayWorkoutKcal = 0
      if (dayActivity) {
        const zone = dayActivity.zone || 2
        const duration = dayActivity.duration || 60
        const durationHours = duration / 60
        const consumption = getZoneConsumption(zone)
        dayWorkoutKcal = Math.round(consumption.kcalH * durationHours)
      }

      const dayDailyKcal = Math.round(bmr + bmr * 0.15 + dayWorkoutKcal * 0.4)
      const distribution = MEAL_DISTRIBUTION.afternoon

      const mealTimes: Record<string, string> = {
        colazione: "07:00",
        spuntino: "10:30",
        pranzo: "13:00",
        merenda: "16:00",
        cena: "20:00",
        pre_sonno: "22:30",
      }

      const mealLabels: Record<string, string> = {
        colazione: "Colazione",
        spuntino: "Spuntino",
        pranzo: "Pranzo",
        merenda: "Merenda",
        cena: "Cena",
        pre_sonno: "Pre-Sonno",
      }

      const dayPlan: {
        meal: string
        name: string
        kcal: number
        cho: number
        pro: number
        fat: number
        time: string
      }[] = []

      Object.entries(distribution).forEach(([mealType, config]) => {
        if (mealType === "post_workout") return

        const dbKey = mealType === "merenda" ? "spuntino" : mealType
        const filteredMeals = filterMeals(MEAL_DATABASE[dbKey] || MEAL_DATABASE.spuntino)

        if (filteredMeals.length > 0) {
          const targetKcal = dayDailyKcal * config.pct
          const selectedMeal = selectMealWithRotation(filteredMeals, mealType, targetKcal)
          const scale = targetKcal / selectedMeal.kcal

          dayPlan.push({
            meal: mealLabels[mealType] || mealType,
            name: selectedMeal.name,
            kcal: Math.round(selectedMeal.kcal * scale),
            cho: Math.round(selectedMeal.cho * scale),
            pro: Math.round(selectedMeal.pro * scale),
            fat: Math.round(selectedMeal.fat * scale),
            time: mealTimes[mealType] || "12:00",
          })
        }
      })

      weekPlan[dayIndex] = dayPlan.sort((a, b) => a.time.localeCompare(b.time))
    }

    // Update state with usage tracking
    setWeeklyFoodUsage(usedFoods)

    return weekPlan
  }, [bmr, weeklyActivities, athleteConstraints, metabolicProfile])

  // Get meal plan for selected day
  const mealPlan = useMemo(() => {
    return weeklyMealPlan[selectedDay] || []
  }, [weeklyMealPlan, selectedDay])

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]

  const micronutrientAnalysis = useMemo(() => {
    // Simplified estimation based on meal composition
    const meals = mealPlan
    const totalKcal = meals.reduce((sum, m) => sum + m.kcal, 0)
    const totalCho = meals.reduce((sum, m) => sum + m.cho, 0)
    const totalPro = meals.reduce((sum, m) => sum + m.pro, 0)

    // Estimate micronutrients based on macros (simplified model)
    return {
      vitamins: {
        b1: { current: Math.round(totalCho * 0.008 * 10) / 10, ...MICRONUTRIENT_TARGETS.vitamins.b1 },
        b6: { current: Math.round(totalPro * 0.02 * 10) / 10, ...MICRONUTRIENT_TARGETS.vitamins.b6 },
        b12: { current: Math.round(totalPro * 0.03 * 10) / 10, ...MICRONUTRIENT_TARGETS.vitamins.b12 },
        c: { current: Math.round(totalKcal * 0.04), ...MICRONUTRIENT_TARGETS.vitamins.c },
        d: { current: 5, ...MICRONUTRIENT_TARGETS.vitamins.d }, // Often deficient
        e: { current: Math.round(totalKcal * 0.007), ...MICRONUTRIENT_TARGETS.vitamins.e },
      },
      minerals: {
        iron: { current: Math.round(totalKcal * 0.006), ...MICRONUTRIENT_TARGETS.minerals.iron },
        zinc: { current: Math.round(totalPro * 0.15), ...MICRONUTRIENT_TARGETS.minerals.zinc },
        magnesium: { current: Math.round(totalKcal * 0.15), ...MICRONUTRIENT_TARGETS.minerals.magnesium },
        calcium: { current: Math.round(totalKcal * 0.4), ...MICRONUTRIENT_TARGETS.minerals.calcium },
        sodium: { current: Math.round(totalKcal * 0.8), ...MICRONUTRIENT_TARGETS.minerals.sodium },
        potassium: { current: Math.round(totalKcal * 1.2), ...MICRONUTRIENT_TARGETS.minerals.potassium },
      },
    }
  }, [mealPlan])

  const dailySupplementStack = useMemo(() => {
    const stack = [...DAILY_SUPPLEMENT_STACK.base]

    if (selectedActivity) {
      // Add training day supplements
      stack.push(...DAILY_SUPPLEMENT_STACK.training_day)

      const zone = selectedActivity.zone || 2
      const duration = selectedActivity.duration || 60

      // High intensity (Z4+)
      if (zone >= 4) {
        stack.push(...DAILY_SUPPLEMENT_STACK.high_intensity)
      }

      // Endurance (long duration or Z2)
      if (duration >= 90 || zone <= 2) {
        stack.push(...DAILY_SUPPLEMENT_STACK.endurance)
      }

      // Always add recovery for training days
      stack.push(...DAILY_SUPPLEMENT_STACK.recovery)
    }

    // Sort by timing
    const timingOrder = [
      "Colazione",
      "Pre-workout (-90min)",
      "Pre-workout (-60min)",
      "Pre-workout (-45min)",
      "Pre-workout (-30min)",
      "Intra-workout",
      "Ogni 60min",
      "Post-workout",
      "Pre-sonno",
      "Lontano dai pasti",
    ]

    return stack.sort((a, b) => {
      const aIndex = timingOrder.findIndex((t) => a.timing.includes(t.split(" ")[0]))
      const bIndex = timingOrder.findIndex((t) => b.timing.includes(t.split(" ")[0]))
      return aIndex - bIndex
    })
  }, [selectedActivity])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      {selectedActivity && (
        <Card className="bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedActivity.workout_name || `${selectedActivity.sport_type} Z${selectedActivity.zone}`}
                </h2>
                <p className="text-muted-foreground">
                  {selectedActivity.duration} min • TSS{" "}
                  {Math.round(selectedActivity.duration * selectedActivity.zone * 0.8)} • Z{selectedActivity.zone}
                </p>
              </div>
              <Badge
                variant={fuelingClass === "HIGH" ? "destructive" : fuelingClass === "MEDIUM" ? "default" : "secondary"}
              >
                {fuelingClass}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day Selector */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setSelectedDay((d) => (d - 1 + 7) % 7)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          {dayNames.map((day, i) => (
            <Button
              key={day}
              variant={selectedDay === i ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedDay(i)}
              className="w-12"
            >
              {day}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedDay((d) => (d + 1) % 7)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="biomap" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            bioMAP
          </TabsTrigger>
          <TabsTrigger value="intra" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Intra
          </TabsTrigger>
          <TabsTrigger value="pasti" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Pasti
          </TabsTrigger>
          <TabsTrigger value="micro" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Micro
          </TabsTrigger>
          <TabsTrigger value="stack" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Stack
          </TabsTrigger>
        </TabsList>

        <TabsContent value="biomap" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">BMR (Katch-McArdle)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{bmr}</p>
                <p className="text-xs text-muted-foreground">LBM: {(weight * 0.85).toFixed(1)} kg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Consumo Allenamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">{workoutMetrics.kcal}</p>
                <p className="text-xs text-muted-foreground">
                  {workoutMetrics.duration} min @ {workoutMetrics.zoneName}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">CHO Bruciati</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">{workoutMetrics.choBurned}g</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(((workoutMetrics.choBurned * 4) / workoutMetrics.kcal) * 100) || 0}% da CHO
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Formula LOCK */}
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-purple-500" />
                Formule LOCK bioMAP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground mb-2">Kcal PASTI = BMR + 15% + 40% consumo</p>
                  <p className="text-lg font-mono">
                    {bmr} + {Math.round(bmr * 0.15)} + {Math.round(workoutMetrics.kcal * 0.4)} ={" "}
                    <span className="text-green-500 font-bold">{dailyKcal} kcal</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground mb-2">Kcal INTRA = 50% CHO bruciati × 4</p>
                  <p className="text-lg font-mono">
                    {workoutMetrics.choBurned}g × 0.5 × 4 ={" "}
                    <span className="text-orange-500 font-bold">{intraWorkCho * 4} kcal</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zone Consumption Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consumo Zone (dal tuo profilo metabolico)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((z) => {
                  const consumption = getZoneConsumption(z)
                  const isSelected = workoutMetrics.zone === z
                  return (
                    <div
                      key={z}
                      className={`p-3 rounded-lg text-center ${isSelected ? "bg-primary/20 border border-primary" : "bg-muted/50"}`}
                    >
                      <p className="font-bold">Z{z}</p>
                      <p className="text-sm text-orange-500">{consumption.choGH}g/h</p>
                      <p className="text-xs text-muted-foreground">{consumption.kcalH} kcal/h</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intra" className="space-y-6">
          {/* Pre-Workout Section */}
          {preWorkoutStack.length > 0 && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Pre-Workout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {preWorkoutStack.map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-yellow-400">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.timing}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">{item.note}</p>
                      </div>
                      <span className="text-lg font-bold text-yellow-500">{item.dose}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Intra-Workout Timing Section */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-500" />
                Timing Intra-Workout (ogni 20 min)
              </CardTitle>
              <p className="text-sm text-zinc-400">
                CHO totali da assumere: <span className="text-emerald-400 font-bold">{intraWorkCho}g</span> | Durata:{" "}
                <span className="text-emerald-400 font-bold">{workoutMetrics.duration} min</span>
              </p>
            </CardHeader>
            <CardContent>
              {intraWorkoutTiming.length > 0 ? (
                <div className="relative">
                  {/* Timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-500/30" />

                  <div className="space-y-4">
                    {intraWorkoutTiming.map((interval, i) => (
                      <div key={i} className="flex items-start gap-4 relative">
                        {/* Timeline dot */}
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center z-10">
                          <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-emerald-400">Min {interval.time}'</span>
                            <Badge className="bg-emerald-500/20 text-emerald-400">{interval.cho}g CHO</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{interval.product}</span>
                            <span className="text-xs text-zinc-500">({interval.brand})</span>
                          </div>
                          <p className="text-sm text-zinc-400 mt-1">{interval.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-4">
                  Allenamento troppo breve per richiedere integrazione intra-workout
                </p>
              )}
            </CardContent>
          </Card>

          {/* Intra-Workout Stack Summary */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                Stack Intra-Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {intraWorkoutStack.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-sm text-zinc-400">{item.note}</p>
                    </div>
                    <span className="text-purple-400 font-bold">{item.dose}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post-Workout Section */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Post-Workout Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {postWorkoutStack.map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-400">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.timing}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{item.note}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-500">{item.dose}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pasti" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-500" />
                Piano Pasti Giornaliero
              </CardTitle>
              <p className="text-sm text-muted-foreground">Target: {dailyKcal} kcal</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show dietary constraints summary */}
              {(athleteConstraints.intolerances.length > 0 ||
                athleteConstraints.allergies.length > 0 ||
                athleteConstraints.dietary_preferences.length > 0) && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-500">Restrizioni alimentari attive</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {athleteConstraints.intolerances.length > 0 && (
                      <p>
                        <span className="text-fuchsia-400">Intolleranze:</span>{" "}
                        {athleteConstraints.intolerances.join(", ")}
                      </p>
                    )}
                    {athleteConstraints.allergies.length > 0 && (
                      <p>
                        <span className="text-red-400">Allergie:</span> {athleteConstraints.allergies.join(", ")}
                      </p>
                    )}
                    {athleteConstraints.dietary_preferences.length > 0 && (
                      <p>
                        <span className="text-green-400">Dieta:</span>{" "}
                        {athleteConstraints.dietary_preferences.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Meal plan */}
              <div className="space-y-3">
                {mealPlan.map((meal, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {meal.time}
                        </Badge>
                        <span className="font-medium">{meal.meal}</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">{meal.kcal} kcal</Badge>
                    </div>
                    <p className="text-sm text-foreground mb-2">{meal.name}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        CHO: <span className="text-orange-400">{meal.cho}g</span>
                      </span>
                      <span>
                        PRO: <span className="text-blue-400">{meal.pro}g</span>
                      </span>
                      <span>
                        FAT: <span className="text-yellow-400">{meal.fat}g</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily totals */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-medium mb-2">Totale Giornaliero</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-500">{mealPlan.reduce((sum, m) => sum + m.kcal, 0)}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-400">{mealPlan.reduce((sum, m) => sum + m.cho, 0)}g</p>
                    <p className="text-xs text-muted-foreground">CHO</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{mealPlan.reduce((sum, m) => sum + m.pro, 0)}g</p>
                    <p className="text-xs text-muted-foreground">PRO</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">{mealPlan.reduce((sum, m) => sum + m.fat, 0)}g</p>
                    <p className="text-xs text-muted-foreground">FAT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="micro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-emerald-500" />
                Analisi Micronutrienti
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Stima basata sul piano pasti di oggi ({mealPlan.reduce((s, m) => s + m.kcal, 0)} kcal)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vitamins */}
              <div>
                <h4 className="font-medium mb-3 text-emerald-500">Vitamine</h4>
                <div className="grid gap-3">
                  {Object.entries(micronutrientAnalysis.vitamins).map(([key, data]) => {
                    const pct = Math.min(100, Math.round((data.current / data.target) * 100))
                    const isLow = pct < 70
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{data.name}</span>
                          <span className={isLow ? "text-orange-500" : "text-emerald-500"}>
                            {data.current} / {data.target} {data.unit} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isLow ? "bg-orange-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{data.role}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Minerals */}
              <div>
                <h4 className="font-medium mb-3 text-blue-500">Minerali</h4>
                <div className="grid gap-3">
                  {Object.entries(micronutrientAnalysis.minerals).map(([key, data]) => {
                    const pct = Math.min(100, Math.round((data.current / data.target) * 100))
                    const isLow = pct < 70
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{data.name}</span>
                          <span className={isLow ? "text-orange-500" : "text-blue-500"}>
                            {data.current} / {data.target} {data.unit} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isLow ? "bg-orange-500" : "bg-blue-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{data.role}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-amber-500 mb-2">Raccomandazioni</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {micronutrientAnalysis.vitamins.d.current < micronutrientAnalysis.vitamins.d.target * 0.5 && (
                      <li>• Considera integrazione Vitamina D (2000-4000 UI/giorno)</li>
                    )}
                    {micronutrientAnalysis.minerals.magnesium.current <
                      micronutrientAnalysis.minerals.magnesium.target * 0.7 && (
                      <li>• Aumenta fonti di Magnesio (verdure a foglia, noci, semi)</li>
                    )}
                    {micronutrientAnalysis.minerals.iron.current < micronutrientAnalysis.minerals.iron.target * 0.7 && (
                      <li>• Monitora i livelli di Ferro (considera test ematici)</li>
                    )}
                    <li>• Consuma frutta e verdura colorate per antiossidanti</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-500" />
                Stack Integratori Giornaliero
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedActivity
                  ? `Giorno di allenamento: ${selectedActivity.workout_name || `Z${selectedActivity.zone}`} - ${selectedActivity.duration} min`
                  : "Giorno di riposo"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailySupplementStack.map((supp, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">{supp.name}</p>
                        <p className="text-xs text-muted-foreground">{supp.benefit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">{supp.dose}</p>
                      <p className="text-xs text-purple-500">{supp.timing}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <Card className="mt-4 bg-purple-500/10 border-purple-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-purple-500">Totale Integratori</p>
                      <p className="text-sm text-muted-foreground">{dailySupplementStack.length} prodotti per oggi</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-500">{dailySupplementStack.length}</p>
                      <p className="text-xs text-muted-foreground">{selectedActivity ? "Training Day" : "Rest Day"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Guide */}
              <div className="mt-4 p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Guida Timing
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-background/50">
                    <p className="font-medium text-emerald-500">Mattina</p>
                    <p className="text-xs text-muted-foreground">Omega-3, Vit D, Collagene</p>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <p className="font-medium text-orange-500">Pre-Workout</p>
                    <p className="text-xs text-muted-foreground">Caffeina, Beta-Alanina, Citrullina</p>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <p className="font-medium text-yellow-500">Intra/Post</p>
                    <p className="text-xs text-muted-foreground">BCAA, Creatina, Glutammina</p>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <p className="font-medium text-purple-500">Sera</p>
                    <p className="text-xs text-muted-foreground">Magnesio, ZMA, Tart Cherry</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { NutritionPlan }
