import { type NextRequest, NextResponse } from "next/server"

const EXERCISEDB_BASE_URL = "https://exercisedb.p.rapidapi.com"

const getApiKey = () => process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY || ""

// Headers per ExerciseDB API (RapidAPI)
const getHeaders = () => ({
  "X-RapidAPI-Key": getApiKey(),
  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bodyPart = searchParams.get("bodyPart")
  const limit = searchParams.get("limit") || "50"
  const offset = searchParams.get("offset") || "0"

  const apiKey = getApiKey()

  console.log("[v0] ExerciseDB API called with bodyPart:", bodyPart)
  console.log("[v0] RAPIDAPI_KEY exists:", !!process.env.RAPIDAPI_KEY)
  console.log("[v0] RAPID_API_KEY exists:", !!process.env.RAPID_API_KEY)
  console.log("[v0] Using API key:", !!apiKey)

  // Se non c'è API key, ritorna esercizi di fallback
  if (!apiKey) {
    return NextResponse.json({
      exercises: getFallbackExercises(bodyPart),
      source: "fallback",
    })
  }

  try {
    let url = `${EXERCISEDB_BASE_URL}/exercises`

    if (bodyPart && bodyPart !== "all") {
      url = `${EXERCISEDB_BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`
    } else {
      url = `${EXERCISEDB_BASE_URL}/exercises?limit=${limit}&offset=${offset}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      headers: getHeaders(),
      signal: controller.signal,
      cache: "force-cache",
    }).catch(() => null)

    clearTimeout(timeoutId)

    if (!response || !response.ok) {
      console.log("[v0] ExerciseDB returned status:", response?.status, "- using fallback")
      return NextResponse.json({
        exercises: getFallbackExercises(bodyPart),
        source: "fallback",
      })
    }

    const exercises = await response.json()
    console.log("[v0] ExerciseDB returned", exercises.length, "exercises")

    return NextResponse.json({
      exercises,
      source: "exercisedb",
      count: exercises.length,
    })
  } catch {
    return NextResponse.json({
      exercises: getFallbackExercises(bodyPart),
      source: "fallback",
    })
  }
}

// Database locale di fallback con 54 esercizi
function getFallbackExercises(bodyPart: string | null) {
  const exercises = [
    // PETTO
    {
      id: "chest-1",
      name: "Bench Press",
      nameIt: "Panca Piana",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: ["delts", "triceps"],
      equipment: "barbell",
      gifUrl: "/bench-press-exercise.png",
      instructions: ["Sdraiati sulla panca", "Afferra il bilanciere", "Abbassa al petto", "Spingi verso l'alto"],
    },
    {
      id: "chest-2",
      name: "Incline Dumbbell Press",
      nameIt: "Panca Inclinata Manubri",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: ["delts", "triceps"],
      equipment: "dumbbell",
      gifUrl: "/incline-dumbbell-press.jpg",
      instructions: ["Siediti su panca inclinata", "Spingi i manubri verso l'alto", "Abbassa controllato"],
    },
    {
      id: "chest-3",
      name: "Cable Fly",
      nameIt: "Croci ai Cavi",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: ["delts"],
      equipment: "cable",
      gifUrl: "/cable-fly-exercise.jpg",
      instructions: ["Afferra le maniglie", "Porta le braccia al centro", "Contrai il petto"],
    },
    {
      id: "chest-4",
      name: "Push Ups",
      nameIt: "Piegamenti",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: ["triceps", "delts"],
      equipment: "body weight",
      gifUrl: "/push-ups-exercise.png",
      instructions: ["Posizione plank", "Abbassa il corpo", "Spingi verso l'alto"],
    },
    {
      id: "chest-5",
      name: "Dips",
      nameIt: "Dip alle Parallele",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: ["triceps"],
      equipment: "body weight",
      gifUrl: "/chest-dips-exercise.png",
      instructions: ["Afferra le parallele", "Abbassa il corpo", "Spingi verso l'alto"],
    },
    {
      id: "chest-6",
      name: "Pec Deck",
      nameIt: "Pec Deck Machine",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: [],
      equipment: "machine",
      gifUrl: "/pec-deck-machine.jpg",
      instructions: ["Siediti alla macchina", "Porta le braccia al centro", "Contrai il petto"],
    },
    // DORSALI
    {
      id: "back-1",
      name: "Lat Pulldown",
      nameIt: "Lat Machine",
      bodyPart: "back",
      target: "lats",
      secondaryMuscles: ["biceps", "traps"],
      equipment: "cable",
      gifUrl: "/lat-pulldown-exercise.png",
      instructions: ["Afferra la sbarra larga", "Tira verso il petto", "Contrai i dorsali"],
    },
    {
      id: "back-2",
      name: "Barbell Row",
      nameIt: "Rematore Bilanciere",
      bodyPart: "back",
      target: "lats",
      secondaryMuscles: ["biceps", "traps"],
      equipment: "barbell",
      gifUrl: "/barbell-row.png",
      instructions: ["Piegati in avanti", "Tira il bilanciere al busto", "Contrai la schiena"],
    },
    {
      id: "back-3",
      name: "Pull Ups",
      nameIt: "Trazioni",
      bodyPart: "back",
      target: "lats",
      secondaryMuscles: ["biceps"],
      equipment: "body weight",
      gifUrl: "/pull-ups-exercise.png",
      instructions: ["Afferra la sbarra", "Tirati su fino al mento", "Scendi controllato"],
    },
    {
      id: "back-4",
      name: "Seated Cable Row",
      nameIt: "Pulley Basso",
      bodyPart: "back",
      target: "lats",
      secondaryMuscles: ["biceps", "rhomboids"],
      equipment: "cable",
      gifUrl: "/seated-cable-row.jpg",
      instructions: ["Siediti al cavo basso", "Tira verso l'addome", "Contrai la schiena"],
    },
    {
      id: "back-5",
      name: "Deadlift",
      nameIt: "Stacco da Terra",
      bodyPart: "back",
      target: "spine",
      secondaryMuscles: ["glutes", "quads"],
      equipment: "barbell",
      gifUrl: "/deadlift-exercise.png",
      instructions: ["Afferra il bilanciere", "Solleva mantenendo schiena dritta", "Contrai glutei e dorsali"],
    },
    {
      id: "back-6",
      name: "T-Bar Row",
      nameIt: "T-Bar Row",
      bodyPart: "back",
      target: "lats",
      secondaryMuscles: ["biceps", "traps"],
      equipment: "barbell",
      gifUrl: "/t-bar-row-exercise.jpg",
      instructions: ["Afferra la T-bar", "Tira verso il petto", "Contrai la schiena"],
    },
    // SPALLE
    {
      id: "shoulders-1",
      name: "Overhead Press",
      nameIt: "Military Press",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: ["triceps", "traps"],
      equipment: "barbell",
      gifUrl: "/overhead-press.png",
      instructions: ["Afferra il bilanciere", "Spingi sopra la testa", "Abbassa controllato"],
    },
    {
      id: "shoulders-2",
      name: "Lateral Raise",
      nameIt: "Alzate Laterali",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: ["traps"],
      equipment: "dumbbell",
      gifUrl: "/lateral-raise-exercise.png",
      instructions: ["Impugna i manubri", "Alza lateralmente", "Contrai le spalle"],
    },
    {
      id: "shoulders-3",
      name: "Front Raise",
      nameIt: "Alzate Frontali",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: ["pectorals"],
      equipment: "dumbbell",
      gifUrl: "/front-raise-exercise.png",
      instructions: ["Impugna i manubri", "Alza frontalmente", "Contrai le spalle"],
    },
    {
      id: "shoulders-4",
      name: "Face Pull",
      nameIt: "Face Pull",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: ["traps", "rhomboids"],
      equipment: "cable",
      gifUrl: "/face-pull-exercise.png",
      instructions: ["Tira il cavo verso il viso", "Apri i gomiti", "Contrai le scapole"],
    },
    {
      id: "shoulders-5",
      name: "Arnold Press",
      nameIt: "Arnold Press",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: ["triceps"],
      equipment: "dumbbell",
      gifUrl: "/arnold-press-exercise.jpg",
      instructions: ["Parti con manubri al petto", "Ruota e spingi", "Inverti il movimento"],
    },
    {
      id: "shoulders-6",
      name: "Reverse Fly",
      nameIt: "Apertura Inverse",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: ["traps"],
      equipment: "dumbbell",
      gifUrl: "/reverse-fly-exercise.png",
      instructions: ["Piegati in avanti", "Apri le braccia", "Contrai il deltoide posteriore"],
    },
    // BRACCIA
    {
      id: "arms-1",
      name: "Barbell Curl",
      nameIt: "Curl Bilanciere",
      bodyPart: "upper arms",
      target: "biceps",
      secondaryMuscles: ["forearms"],
      equipment: "barbell",
      gifUrl: "/barbell-curl.png",
      instructions: ["Afferra il bilanciere", "Fletti le braccia", "Contrai i bicipiti"],
    },
    {
      id: "arms-2",
      name: "Tricep Pushdown",
      nameIt: "Push Down Tricipiti",
      bodyPart: "upper arms",
      target: "triceps",
      secondaryMuscles: [],
      equipment: "cable",
      gifUrl: "/tricep-pushdown-exercise.png",
      instructions: ["Afferra la sbarra al cavo alto", "Spingi verso il basso", "Contrai i tricipiti"],
    },
    {
      id: "arms-3",
      name: "Hammer Curl",
      nameIt: "Curl a Martello",
      bodyPart: "upper arms",
      target: "biceps",
      secondaryMuscles: ["forearms"],
      equipment: "dumbbell",
      gifUrl: "/hammer-curl-exercise.png",
      instructions: ["Impugna i manubri", "Fletti con presa neutra", "Contrai i bicipiti"],
    },
    {
      id: "arms-4",
      name: "Skull Crushers",
      nameIt: "French Press",
      bodyPart: "upper arms",
      target: "triceps",
      secondaryMuscles: [],
      equipment: "barbell",
      gifUrl: "/skull-crushers-exercise.jpg",
      instructions: ["Sdraiati su panca", "Abbassa il bilanciere alla fronte", "Estendi i tricipiti"],
    },
    {
      id: "arms-5",
      name: "Preacher Curl",
      nameIt: "Curl alla Panca Scott",
      bodyPart: "upper arms",
      target: "biceps",
      secondaryMuscles: [],
      equipment: "barbell",
      gifUrl: "/preacher-curl-exercise.jpg",
      instructions: ["Appoggia le braccia", "Fletti il bilanciere", "Contrai i bicipiti"],
    },
    {
      id: "arms-6",
      name: "Overhead Tricep Extension",
      nameIt: "Estensioni Tricipiti",
      bodyPart: "upper arms",
      target: "triceps",
      secondaryMuscles: [],
      equipment: "dumbbell",
      gifUrl: "/overhead-tricep-extension.jpg",
      instructions: ["Porta il manubrio sopra la testa", "Abbassa dietro", "Estendi"],
    },
    // GAMBE
    {
      id: "legs-1",
      name: "Barbell Squat",
      nameIt: "Squat Bilanciere",
      bodyPart: "upper legs",
      target: "quads",
      secondaryMuscles: ["glutes", "hamstrings"],
      equipment: "barbell",
      gifUrl: "/barbell-squat.png",
      instructions: ["Posiziona il bilanciere sulle spalle", "Scendi in squat", "Risali spingendo"],
    },
    {
      id: "legs-2",
      name: "Leg Press",
      nameIt: "Leg Press",
      bodyPart: "upper legs",
      target: "quads",
      secondaryMuscles: ["glutes", "hamstrings"],
      equipment: "machine",
      gifUrl: "/leg-press-exercise.png",
      instructions: ["Siediti alla macchina", "Spingi la pedana", "Controlla il ritorno"],
    },
    {
      id: "legs-3",
      name: "Romanian Deadlift",
      nameIt: "Stacco Rumeno",
      bodyPart: "upper legs",
      target: "hamstrings",
      secondaryMuscles: ["glutes", "spine"],
      equipment: "barbell",
      gifUrl: "/romanian-deadlift.png",
      instructions: ["Afferra il bilanciere", "Scendi mantenendo gambe tese", "Contrai i femorali"],
    },
    {
      id: "legs-4",
      name: "Leg Curl",
      nameIt: "Leg Curl",
      bodyPart: "upper legs",
      target: "hamstrings",
      secondaryMuscles: [],
      equipment: "machine",
      gifUrl: "/leg-curl-exercise.jpg",
      instructions: ["Sdraiati sulla macchina", "Fletti le gambe", "Contrai i femorali"],
    },
    {
      id: "legs-5",
      name: "Leg Extension",
      nameIt: "Leg Extension",
      bodyPart: "upper legs",
      target: "quads",
      secondaryMuscles: [],
      equipment: "machine",
      gifUrl: "/leg-extension-exercise.png",
      instructions: ["Siediti alla macchina", "Estendi le gambe", "Contrai i quadricipiti"],
    },
    {
      id: "legs-6",
      name: "Lunges",
      nameIt: "Affondi",
      bodyPart: "upper legs",
      target: "quads",
      secondaryMuscles: ["glutes", "hamstrings"],
      equipment: "body weight",
      gifUrl: "/lunges-exercise.png",
      instructions: ["Fai un passo avanti", "Scendi in affondo", "Spingi e torna"],
    },
    // GLUTEI
    {
      id: "glutes-1",
      name: "Hip Thrust",
      nameIt: "Hip Thrust",
      bodyPart: "upper legs",
      target: "glutes",
      secondaryMuscles: ["hamstrings"],
      equipment: "barbell",
      gifUrl: "/hip-thrust-exercise.jpg",
      instructions: ["Appoggia la schiena su panca", "Posiziona bilanciere sui fianchi", "Spingi verso l'alto"],
    },
    {
      id: "glutes-2",
      name: "Glute Bridge",
      nameIt: "Ponte Glutei",
      bodyPart: "upper legs",
      target: "glutes",
      secondaryMuscles: ["hamstrings"],
      equipment: "body weight",
      gifUrl: "/glute-bridge-exercise.png",
      instructions: ["Sdraiati a terra", "Piega le ginocchia", "Solleva i fianchi"],
    },
    {
      id: "glutes-3",
      name: "Cable Kickback",
      nameIt: "Slanci al Cavo",
      bodyPart: "upper legs",
      target: "glutes",
      secondaryMuscles: ["hamstrings"],
      equipment: "cable",
      gifUrl: "/cable-kickback-exercise.jpg",
      instructions: ["Attacca la cavigliera", "Spingi la gamba indietro", "Contrai il gluteo"],
    },
    {
      id: "glutes-4",
      name: "Bulgarian Split Squat",
      nameIt: "Squat Bulgaro",
      bodyPart: "upper legs",
      target: "glutes",
      secondaryMuscles: ["quads"],
      equipment: "dumbbell",
      gifUrl: "/bulgarian-split-squat.jpg",
      instructions: ["Piede posteriore su panca", "Scendi in affondo", "Spingi e risali"],
    },
    {
      id: "glutes-5",
      name: "Sumo Squat",
      nameIt: "Squat Sumo",
      bodyPart: "upper legs",
      target: "glutes",
      secondaryMuscles: ["quads", "adductors"],
      equipment: "dumbbell",
      gifUrl: "/sumo-squat-exercise.jpg",
      instructions: ["Piedi larghi", "Scendi in squat", "Contrai glutei"],
    },
    {
      id: "glutes-6",
      name: "Step Ups",
      nameIt: "Step Up",
      bodyPart: "upper legs",
      target: "glutes",
      secondaryMuscles: ["quads"],
      equipment: "body weight",
      gifUrl: "/step-ups-exercise.jpg",
      instructions: ["Sali su una panca", "Spingi col tallone", "Scendi controllato"],
    },
    // CORE
    {
      id: "core-1",
      name: "Plank",
      nameIt: "Plank",
      bodyPart: "waist",
      target: "abs",
      secondaryMuscles: ["spine"],
      equipment: "body weight",
      gifUrl: "/plank-exercise.png",
      instructions: ["Posizione plank", "Mantieni il corpo dritto", "Contrai gli addominali"],
    },
    {
      id: "core-2",
      name: "Crunches",
      nameIt: "Crunch",
      bodyPart: "waist",
      target: "abs",
      secondaryMuscles: [],
      equipment: "body weight",
      gifUrl: "/crunches-exercise.png",
      instructions: ["Sdraiati a terra", "Solleva le spalle", "Contrai gli addominali"],
    },
    {
      id: "core-3",
      name: "Russian Twist",
      nameIt: "Russian Twist",
      bodyPart: "waist",
      target: "abs",
      secondaryMuscles: ["obliques"],
      equipment: "body weight",
      gifUrl: "/russian-twist.png",
      instructions: ["Siediti inclinato", "Ruota il busto", "Alterna i lati"],
    },
    {
      id: "core-4",
      name: "Leg Raise",
      nameIt: "Alzate Gambe",
      bodyPart: "waist",
      target: "abs",
      secondaryMuscles: ["hip flexors"],
      equipment: "body weight",
      gifUrl: "/leg-raise-exercise.jpg",
      instructions: ["Sdraiati a terra", "Solleva le gambe", "Abbassa controllato"],
    },
    {
      id: "core-5",
      name: "Cable Woodchop",
      nameIt: "Woodchop al Cavo",
      bodyPart: "waist",
      target: "abs",
      secondaryMuscles: ["obliques"],
      equipment: "cable",
      gifUrl: "/cable-woodchop-exercise.jpg",
      instructions: ["Afferra il cavo", "Ruota diagonalmente", "Contrai gli obliqui"],
    },
    {
      id: "core-6",
      name: "Dead Bug",
      nameIt: "Dead Bug",
      bodyPart: "waist",
      target: "abs",
      secondaryMuscles: ["spine"],
      equipment: "body weight",
      gifUrl: "/dead-bug-exercise.png",
      instructions: ["Sdraiati supino", "Estendi braccio e gamba opposti", "Alterna"],
    },
    // POLPACCI
    {
      id: "calves-1",
      name: "Standing Calf Raise",
      nameIt: "Calf Raise in Piedi",
      bodyPart: "lower legs",
      target: "calves",
      secondaryMuscles: [],
      equipment: "machine",
      gifUrl: "/standing-calf-raise.jpg",
      instructions: ["Posizionati alla macchina", "Solleva sui talloni", "Contrai i polpacci"],
    },
    {
      id: "calves-2",
      name: "Seated Calf Raise",
      nameIt: "Calf Raise Seduto",
      bodyPart: "lower legs",
      target: "calves",
      secondaryMuscles: [],
      equipment: "machine",
      gifUrl: "/seated-calf-raise.jpg",
      instructions: ["Siediti alla macchina", "Solleva i talloni", "Contrai i polpacci"],
    },
    {
      id: "calves-3",
      name: "Donkey Calf Raise",
      nameIt: "Donkey Calf Raise",
      bodyPart: "lower legs",
      target: "calves",
      secondaryMuscles: [],
      equipment: "machine",
      gifUrl: "/donkey-calf-raise.jpg",
      instructions: ["Piegati in avanti", "Solleva sui talloni", "Contrai i polpacci"],
    },
    {
      id: "calves-4",
      name: "Jump Rope",
      nameIt: "Salto Corda",
      bodyPart: "lower legs",
      target: "calves",
      secondaryMuscles: ["quads"],
      equipment: "body weight",
      gifUrl: "/jump-rope-exercise.png",
      instructions: ["Impugna la corda", "Salta ritmicamente", "Atterra sugli avampiedi"],
    },
    // CARDIO
    {
      id: "cardio-1",
      name: "Treadmill Running",
      nameIt: "Corsa Tapis Roulant",
      bodyPart: "cardio",
      target: "cardiovascular system",
      secondaryMuscles: ["quads", "calves"],
      equipment: "machine",
      gifUrl: "/treadmill-running.png",
      instructions: ["Imposta la velocità", "Corri mantenendo la postura", "Respira ritmicamente"],
    },
    {
      id: "cardio-2",
      name: "Cycling",
      nameIt: "Cyclette",
      bodyPart: "cardio",
      target: "cardiovascular system",
      secondaryMuscles: ["quads", "hamstrings"],
      equipment: "machine",
      gifUrl: "/cycling-exercise.png",
      instructions: ["Regola il sellino", "Pedala costantemente", "Mantieni la cadenza"],
    },
    {
      id: "cardio-3",
      name: "Rowing Machine",
      nameIt: "Vogatore",
      bodyPart: "cardio",
      target: "cardiovascular system",
      secondaryMuscles: ["lats", "quads"],
      equipment: "machine",
      gifUrl: "/rowing-machine-exercise.jpg",
      instructions: ["Afferra la maniglia", "Spingi con le gambe", "Tira con le braccia"],
    },
    {
      id: "cardio-4",
      name: "Elliptical",
      nameIt: "Ellittica",
      bodyPart: "cardio",
      target: "cardiovascular system",
      secondaryMuscles: ["quads", "glutes"],
      equipment: "machine",
      gifUrl: "/elliptical-machine.jpg",
      instructions: ["Sali sulla macchina", "Muovi braccia e gambe", "Mantieni il ritmo"],
    },
    // STRETCHING
    {
      id: "stretch-1",
      name: "Hamstring Stretch",
      nameIt: "Stretching Femorali",
      bodyPart: "upper legs",
      target: "hamstrings",
      secondaryMuscles: [],
      equipment: "body weight",
      gifUrl: "/hamstring-stretch.jpg",
      instructions: ["Siediti a terra", "Allunga verso i piedi", "Mantieni 30 secondi"],
    },
    {
      id: "stretch-2",
      name: "Quad Stretch",
      nameIt: "Stretching Quadricipiti",
      bodyPart: "upper legs",
      target: "quads",
      secondaryMuscles: [],
      equipment: "body weight",
      gifUrl: "/quad-stretch.jpg",
      instructions: ["In piedi", "Afferra il piede dietro", "Mantieni 30 secondi"],
    },
    {
      id: "stretch-3",
      name: "Chest Stretch",
      nameIt: "Stretching Pettorali",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: [],
      equipment: "body weight",
      gifUrl: "/chest-stretch.jpg",
      instructions: ["Braccio contro il muro", "Ruota il corpo", "Mantieni 30 secondi"],
    },
    {
      id: "stretch-4",
      name: "Shoulder Stretch",
      nameIt: "Stretching Spalle",
      bodyPart: "shoulders",
      target: "delts",
      secondaryMuscles: [],
      equipment: "body weight",
      gifUrl: "/shoulder-stretch.jpg",
      instructions: ["Braccio attraverso il petto", "Tira con l'altro braccio", "Mantieni 30 secondi"],
    },
  ]

  if (!bodyPart || bodyPart === "all") {
    return exercises
  }

  // Mappa bodyPart ExerciseDB ai nostri gruppi
  const bodyPartMap: Record<string, string[]> = {
    chest: ["chest"],
    back: ["back"],
    shoulders: ["shoulders"],
    "upper arms": ["upper arms"],
    "lower arms": ["lower arms"],
    "upper legs": ["upper legs"],
    "lower legs": ["lower legs"],
    waist: ["waist"],
    cardio: ["cardio"],
  }

  const targetParts = bodyPartMap[bodyPart] || [bodyPart]
  return exercises.filter((ex) => targetParts.includes(ex.bodyPart))
}

