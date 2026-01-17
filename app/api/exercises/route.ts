import { type NextRequest, NextResponse } from "next/server"

const ASCENDAPI_BASE_URL = "https://exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com"

const getApiKey = () => process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY || ""

const getHeaders = () => ({
  "X-RapidAPI-Key": getApiKey(),
  "X-RapidAPI-Host": "exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com",
})

const BODYPART_SEARCH: Record<string, string> = {
  chest: "chest",
  back: "back",
  shoulders: "shoulder",
  upper_arms: "arm bicep tricep",
  lower_arms: "forearm wrist",
  upper_legs: "leg squat thigh",
  lower_legs: "calf",
  waist: "abs core",
  cardio: "cardio",
  glutes: "glute hip",
}

const BODYPART_TARGET: Record<string, string> = {
  chest: "pectorals",
  back: "lats",
  shoulders: "delts",
  upper_arms: "biceps/triceps",
  lower_arms: "forearms",
  upper_legs: "quads",
  lower_legs: "calves",
  waist: "abs",
  cardio: "cardiovascular",
  glutes: "glutes",
}

function detectEquipment(name: string): string {
  const n = name.toLowerCase()

  if (n.includes("dumbbell") || n.includes("db ") || n.includes("d.b.") || n.includes("manubr")) return "dumbbell"
  if (n.includes("barbell") || n.includes("bb ") || n.includes("b.b.") || n.includes("bilanciere")) return "barbell"
  if (n.includes("cable") || n.includes("pulley") || n.includes("cavo") || n.includes("cavi")) return "cable"
  if (
    n.includes("machine") ||
    n.includes("macchina") ||
    n.includes("leg press") ||
    n.includes("chest press") ||
    n.includes("lat pulldown") ||
    n.includes("pec deck") ||
    n.includes("hack squat") ||
    n.includes("smith") ||
    n.includes("seated") ||
    n.includes("lying")
  )
    return "machine"
  if (n.includes("kettlebell") || n.includes("kb ") || n.includes("kettle")) return "kettlebell"
  if (n.includes("band") || n.includes("resistance") || n.includes("elastic")) return "band"
  if (n.includes("ez bar") || n.includes("ez-bar") || n.includes("curl bar")) return "ez barbell"
  if (
    n.includes("push up") ||
    n.includes("push-up") ||
    n.includes("pushup") ||
    n.includes("pull up") ||
    n.includes("pull-up") ||
    n.includes("pullup") ||
    n.includes("chin up") ||
    n.includes("chin-up") ||
    n.includes("chinup") ||
    n.includes("dip") ||
    n.includes("plank") ||
    n.includes("crunch") ||
    n.includes("sit up") ||
    n.includes("sit-up") ||
    n.includes("situp") ||
    n.includes("lunge") ||
    n.includes("burpee") ||
    n.includes("jump") ||
    (n.includes("squat") && !n.includes("barbell") && !n.includes("dumbbell")) ||
    n.includes("mountain climber") ||
    n.includes("leg raise") ||
    n.includes("hanging")
  )
    return "body weight"

  if (n.includes("press") || n.includes("row") || n.includes("curl") || n.includes("extension")) return "dumbbell"
  if (n.includes("fly") || n.includes("raise") || n.includes("shrug")) return "dumbbell"

  return "dumbbell"
}

function detectTarget(name: string, bodyPart: string): string {
  const n = name.toLowerCase()

  if (n.includes("chest") || n.includes("pec") || n.includes("bench") || n.includes("panca")) return "pectorals"
  if (n.includes("lat") || n.includes("row") || n.includes("pull") || n.includes("back")) return "lats"
  if (n.includes("trap") || n.includes("shrug")) return "traps"
  if (n.includes("rhomboid")) return "rhomboids"
  if (n.includes("shoulder") || n.includes("delt") || (n.includes("press") && n.includes("overhead"))) return "delts"
  if (n.includes("lateral") || n.includes("side")) return "lateral delts"
  if (n.includes("front raise")) return "front delts"
  if (n.includes("rear") || n.includes("reverse fly")) return "rear delts"
  if (n.includes("bicep") || (n.includes("curl") && !n.includes("leg") && !n.includes("ham"))) return "biceps"
  if (n.includes("tricep") || n.includes("pushdown") || (n.includes("extension") && n.includes("arm"))) return "triceps"
  if (n.includes("forearm") || n.includes("wrist")) return "forearms"
  if (n.includes("quad") || n.includes("leg extension") || n.includes("squat") || n.includes("lunge")) return "quads"
  if (n.includes("hamstring") || n.includes("leg curl") || n.includes("deadlift")) return "hamstrings"
  if (n.includes("calf") || n.includes("calves")) return "calves"
  if (n.includes("glute") || n.includes("hip thrust") || n.includes("bridge")) return "glutes"
  if (n.includes("adduct")) return "adductors"
  if (n.includes("abduct")) return "abductors"
  if (n.includes("abs") || n.includes("crunch") || n.includes("sit up") || n.includes("plank")) return "abs"
  if (n.includes("oblique") || n.includes("twist")) return "obliques"
  if (n.includes("lower back") || n.includes("erector")) return "lower back"

  return BODYPART_TARGET[bodyPart] || bodyPart
}

const EXERCISE_TRANSLATIONS: Record<string, string> = {
  "bench press": "Panca Piana",
  "incline bench press": "Panca Inclinata",
  "decline bench press": "Panca Declinata",
  "dumbbell press": "Distensioni Manubri",
  "dumbbell fly": "Croci Manubri",
  "cable fly": "Croci ai Cavi",
  "push up": "Piegamenti",
  "push-up": "Piegamenti",
  pushup: "Piegamenti",
  "chest dip": "Dip Petto",
  "pec deck": "Pec Deck",
  "lat pulldown": "Lat Machine",
  "pull up": "Trazioni",
  "pull-up": "Trazioni",
  pullup: "Trazioni",
  "chin up": "Trazioni Supine",
  "barbell row": "Rematore Bilanciere",
  "dumbbell row": "Rematore Manubrio",
  "seated row": "Pulley Basso",
  "cable row": "Pulley",
  deadlift: "Stacco da Terra",
  "romanian deadlift": "Stacco Rumeno",
  "overhead press": "Lento Avanti",
  "shoulder press": "Pressa Spalle",
  "military press": "Military Press",
  "lateral raise": "Alzate Laterali",
  "front raise": "Alzate Frontali",
  "reverse fly": "Aperture Inverse",
  "rear delt fly": "Aperture Inverse",
  "face pull": "Face Pull",
  shrug: "Scrollate",
  "barbell curl": "Curl Bilanciere",
  "dumbbell curl": "Curl Manubri",
  "hammer curl": "Curl Martello",
  "preacher curl": "Curl Panca Scott",
  "concentration curl": "Curl Concentrato",
  "tricep pushdown": "Push Down Tricipiti",
  "tricep extension": "Estensioni Tricipiti",
  "skull crusher": "French Press",
  "overhead tricep extension": "Estensioni Sopra la Testa",
  dip: "Dip",
  squat: "Squat",
  "back squat": "Squat",
  "front squat": "Front Squat",
  "leg press": "Leg Press",
  "leg extension": "Leg Extension",
  "leg curl": "Leg Curl",
  lunge: "Affondi",
  "walking lunge": "Affondi Camminati",
  "bulgarian split squat": "Split Squat Bulgaro",
  "hip thrust": "Hip Thrust",
  "glute bridge": "Ponte Glutei",
  "calf raise": "Calf Raise",
  "standing calf raise": "Calf Raise in Piedi",
  "seated calf raise": "Calf Raise Seduto",
  plank: "Plank",
  crunch: "Crunch",
  "sit up": "Sit Up",
  "leg raise": "Alzate Gambe",
  "russian twist": "Russian Twist",
  "mountain climber": "Mountain Climber",
  "wrist curl": "Curl Polsi",
}

function translateExerciseName(name: string): string {
  const nameLower = name.toLowerCase().trim()

  if (EXERCISE_TRANSLATIONS[nameLower]) {
    return EXERCISE_TRANSLATIONS[nameLower]
  }

  for (const [eng, ita] of Object.entries(EXERCISE_TRANSLATIONS)) {
    if (nameLower.includes(eng)) {
      return ita
    }
  }

  return name
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bodyPart = searchParams.get("bodyPart") || "chest"

  const apiKey = getApiKey()

  if (!apiKey) {
    return NextResponse.json({
      exercises: getFallbackExercises(bodyPart),
      source: "fallback",
    })
  }

  try {
    const searchTerm = BODYPART_SEARCH[bodyPart] || bodyPart
    const url = `${ASCENDAPI_BASE_URL}/api/v1/exercises/search?search=${encodeURIComponent(searchTerm)}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      headers: getHeaders(),
      signal: controller.signal,
    }).catch(() => null)

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      return NextResponse.json({
        exercises: getFallbackExercises(bodyPart),
        source: "fallback",
      })
    }

    const data = await response.json()
    const exercisesArray = data?.data || data || []

    if (!Array.isArray(exercisesArray) || exercisesArray.length === 0) {
      return NextResponse.json({
        exercises: getFallbackExercises(bodyPart),
        source: "fallback",
      })
    }

    const exercises = exercisesArray.slice(0, 30).map((ex: any) => {
      const name = ex.name || ex.exerciseName || "Exercise"
      const nameIt = translateExerciseName(name)
      const detectedEquipment = ex.equipment || ex.equipmentNeeded || detectEquipment(name)
      const detectedTarget = ex.targetMuscle || ex.target || detectTarget(name, bodyPart)

      return {
        id: ex.id || ex.exerciseId || Math.random().toString(36).substr(2, 9),
        name: name,
        nameIt: nameIt,
        bodyPart: ex.bodyPart || bodyPart,
        target: detectedTarget,
        secondaryMuscles: ex.secondaryMuscles || [],
        equipment: detectedEquipment,
        gifUrl:
          ex.imageUrl ||
          ex.gifUrl ||
          ex.image ||
          ex.videoUrl ||
          `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(name)}`,
        instructions: ex.instructions || [],
      }
    })

    return NextResponse.json({
      exercises,
      source: "ascendapi",
    })
  } catch (error) {
    return NextResponse.json({
      exercises: getFallbackExercises(bodyPart),
      source: "fallback",
    })
  }
}

function getFallbackExercises(bodyPart: string | null): any[] {
  const fallbackDB: Record<string, any[]> = {
    chest: [
      { id: "chest1", name: "Bench Press", nameIt: "Panca Piana", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
      { id: "chest2", name: "Incline Dumbbell Press", nameIt: "Panca Inclinata", target: "pectorals", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
      { id: "chest3", name: "Cable Fly", nameIt: "Croci Cavi", target: "pectorals", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "chest4", name: "Push Ups", nameIt: "Piegamenti", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
      { id: "chest5", name: "Chest Dips", nameIt: "Dip Petto", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
      { id: "chest6", name: "Pec Deck", nameIt: "Pec Deck", target: "pectorals", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "chest7", name: "Decline Press", nameIt: "Panca Declinata", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    ],
    back: [
      { id: "back1", name: "Lat Pulldown", nameIt: "Lat Machine", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
      { id: "back2", name: "Barbell Row", nameIt: "Rematore Bilanciere", target: "lats", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
      { id: "back3", name: "Pull Ups", nameIt: "Trazioni", target: "lats", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
      { id: "back4", name: "Seated Cable Row", nameIt: "Pulley Basso", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
      { id: "back5", name: "Dumbbell Row", nameIt: "Rematore Manubrio", target: "lats", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    ],
    shoulders: [
      { id: "sh1", name: "Overhead Press", nameIt: "Lento Avanti", target: "delts", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
      { id: "sh2", name: "Lateral Raise", nameIt: "Alzate Laterali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "sh3", name: "Front Raise", nameIt: "Alzate Frontali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "sh4", name: "Arnold Press", nameIt: "Arnold Press", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
      { id: "sh5", name: "Reverse Fly", nameIt: "Apertura Inverse", target: "rear delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
    upper_arms: [
      { id: "arm1", name: "Barbell Curl", nameIt: "Curl Bilanciere", target: "biceps", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "arm2", name: "Tricep Pushdown", nameIt: "Push Down", target: "triceps", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "arm3", name: "Hammer Curl", nameIt: "Curl Martello", target: "biceps", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "arm4", name: "Skull Crushers", nameIt: "French Press", target: "triceps", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
    upper_legs: [
      { id: "leg1", name: "Squat", nameIt: "Squat", target: "quads", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes"], instructions: [] },
      { id: "leg2", name: "Leg Press", nameIt: "Leg Press", target: "quads", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes"], instructions: [] },
      { id: "leg3", name: "Romanian Deadlift", nameIt: "Stacco Rumeno", target: "hamstrings", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes"], instructions: [] },
      { id: "leg4", name: "Leg Extension", nameIt: "Leg Extension", target: "quads", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "leg5", name: "Leg Curl", nameIt: "Leg Curl", target: "hamstrings", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "leg6", name: "Lunges", nameIt: "Affondi", target: "quads", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes"], instructions: [] },
    ],
    glutes: [
      { id: "gl1", name: "Hip Thrust", nameIt: "Hip Thrust", target: "glutes", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "gl2", name: "Glute Bridge", nameIt: "Ponte Glutei", target: "glutes", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "gl3", name: "Cable Kickback", nameIt: "Kickback Cavi", target: "glutes", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
    waist: [
      { id: "core1", name: "Plank", nameIt: "Plank", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "core2", name: "Crunches", nameIt: "Crunch", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "core3", name: "Leg Raise", nameIt: "Alzate Gambe", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "core4", name: "Russian Twist", nameIt: "Russian Twist", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
    lower_legs: [
      { id: "calf1", name: "Standing Calf Raise", nameIt: "Calf Raise", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "calf2", name: "Seated Calf Raise", nameIt: "Calf Seduto", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
    cardio: [
      { id: "card1", name: "Treadmill Running", nameIt: "Tapis Roulant", target: "cardiovascular", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "card2", name: "Cycling", nameIt: "Cyclette", target: "cardiovascular", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "card3", name: "Rowing Machine", nameIt: "Vogatore", target: "cardiovascular", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
    lower_arms: [
      { id: "fa1", name: "Wrist Curl", nameIt: "Curl Polsi", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
      { id: "fa2", name: "Reverse Wrist Curl", nameIt: "Curl Polsi Inverso", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    ],
  }

  return fallbackDB[bodyPart || "chest"] || fallbackDB["chest"]
}
