export async function GET(request: NextRequest) {
  console.log("[v0] API exercises called")
  console.log("[v0] RAPID_API_KEY:", process.env.RAPID_API_KEY ? "exists" : "missing")
  
  // ... resto del codice
}
import { NextRequest, NextResponse } from "next/server"

// Fallback database locale per quando l'API non è disponibile
const LOCAL_EXERCISES_DB: Record<string, any[]> = {
  chest: [
    { id: "chest1", name: "Bench Press", nameIt: "Panca Piana", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "shoulders"], instructions: ["Sdraiati sulla panca", "Afferra il bilanciere", "Abbassa al petto", "Spingi verso l'alto"] },
    { id: "chest2", name: "Incline Dumbbell Press", nameIt: "Panca Inclinata Manubri", target: "pectorals", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "shoulders"], instructions: ["Sdraiati sulla panca inclinata", "Afferra i manubri", "Abbassa ai lati del petto", "Spingi verso l'alto"] },
    { id: "chest3", name: "Cable Fly", nameIt: "Croci ai Cavi", target: "pectorals", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["shoulders"], instructions: ["Posizionati tra i cavi", "Afferra le maniglie", "Porta le mani davanti al petto", "Torna alla posizione iniziale"] },
    { id: "chest4", name: "Push Ups", nameIt: "Piegamenti", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "shoulders", "core"], instructions: ["Posizione plank", "Abbassa il corpo", "Spingi verso l'alto", "Mantieni il core contratto"] },
    { id: "chest5", name: "Chest Dips", nameIt: "Dip alle Parallele", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "shoulders"], instructions: ["Afferra le parallele", "Inclina il busto in avanti", "Abbassa il corpo", "Spingi verso l'alto"] },
    { id: "chest6", name: "Pec Deck Machine", nameIt: "Pec Deck", target: "pectorals", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["shoulders"], instructions: ["Siediti sulla macchina", "Posiziona le braccia sui supporti", "Chiudi le braccia davanti", "Torna alla posizione iniziale"] },
    { id: "chest7", name: "Decline Bench Press", nameIt: "Panca Declinata", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "shoulders"], instructions: ["Sdraiati sulla panca declinata", "Afferra il bilanciere", "Abbassa al petto", "Spingi verso l'alto"] },
  ],
  back: [
    { id: "back1", name: "Lat Pulldown", nameIt: "Lat Machine", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps", "rhomboids"], instructions: ["Siediti alla macchina", "Afferra la barra larga", "Tira verso il petto", "Torna lentamente su"] },
    { id: "back2", name: "Barbell Row", nameIt: "Rematore con Bilanciere", target: "lats", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps", "rhomboids", "rear delts"], instructions: ["Piega il busto in avanti", "Afferra il bilanciere", "Tira verso l'addome", "Abbassa controllato"] },
    { id: "back3", name: "Pull Ups", nameIt: "Trazioni alla Sbarra", target: "lats", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps", "rhomboids"], instructions: ["Afferra la sbarra", "Tira il corpo verso l'alto", "Mento sopra la sbarra", "Scendi controllato"] },
    { id: "back4", name: "Seated Cable Row", nameIt: "Pulley Basso", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps", "rhomboids"], instructions: ["Siediti al pulley", "Afferra la maniglia", "Tira verso l'addome", "Torna alla posizione iniziale"] },
    { id: "back5", name: "Dumbbell Row", nameIt: "Rematore Manubrio", target: "lats", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps", "rhomboids"], instructions: ["Appoggia ginocchio e mano sulla panca", "Afferra il manubrio", "Tira verso il fianco", "Abbassa controllato"] },
    { id: "back6", name: "T-Bar Row", nameIt: "T-Bar Row", target: "lats", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps", "rhomboids", "rear delts"], instructions: ["Posizionati sulla macchina T-bar", "Afferra le maniglie", "Tira verso il petto", "Abbassa controllato"] },
    { id: "back7", name: "Face Pull", nameIt: "Face Pull", target: "rear delts", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["rhomboids", "traps"], instructions: ["Posiziona il cavo in alto", "Afferra la corda", "Tira verso il viso", "Torna alla posizione iniziale"] },
  ],
  shoulders: [
    { id: "shoulders1", name: "Overhead Press", nameIt: "Lento Avanti", target: "delts", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "traps"], instructions: ["In piedi con bilanciere", "Spingi sopra la testa", "Abbassa alle spalle", "Ripeti"] },
    { id: "shoulders2", name: "Lateral Raise", nameIt: "Alzate Laterali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["traps"], instructions: ["In piedi con manubri", "Alza le braccia lateralmente", "Fermati all'altezza spalle", "Abbassa controllato"] },
    { id: "shoulders3", name: "Front Raise", nameIt: "Alzate Frontali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["traps", "chest"], instructions: ["In piedi con manubri", "Alza le braccia frontalmente", "Fermati all'altezza spalle", "Abbassa controllato"] },
    { id: "shoulders4", name: "Arnold Press", nameIt: "Arnold Press", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps", "traps"], instructions: ["Seduto con manubri", "Parti con palmi verso di te", "Ruota e spingi sopra la testa", "Torna alla posizione iniziale"] },
    { id: "shoulders5", name: "Reverse Fly", nameIt: "Aperture Inverse", target: "rear delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["rhomboids", "traps"], instructions: ["Piegato in avanti", "Alza le braccia lateralmente", "Stringi le scapole", "Abbassa controllato"] },
    { id: "shoulders6", name: "Upright Row", nameIt: "Tirate al Mento", target: "delts", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["traps", "biceps"], instructions: ["In piedi con bilanciere", "Tira verso il mento", "Gomiti alti", "Abbassa controllato"] },
    { id: "shoulders7", name: "Shrugs", nameIt: "Scrollate", target: "traps", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["In piedi con manubri", "Alza le spalle verso le orecchie", "Mantieni 1 secondo", "Abbassa controllato"] },
  ],
  upper_arms: [
    { id: "arms1", name: "Barbell Curl", nameIt: "Curl con Bilanciere", target: "biceps", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["forearms"], instructions: ["In piedi con bilanciere", "Curl verso le spalle", "Contrai i bicipiti", "Abbassa controllato"] },
    { id: "arms2", name: "Tricep Pushdown", nameIt: "Push Down Tricipiti", target: "triceps", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Al cavo alto", "Spingi verso il basso", "Estendi completamente", "Torna su controllato"] },
    { id: "arms3", name: "Hammer Curl", nameIt: "Curl a Martello", target: "biceps", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["forearms", "brachialis"], instructions: ["In piedi con manubri", "Palmi verso il corpo", "Curl verso le spalle", "Abbassa controllato"] },
    { id: "arms4", name: "Skull Crushers", nameIt: "French Press", target: "triceps", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Sdraiato sulla panca", "Bilanciere sopra la testa", "Fletti i gomiti", "Estendi controllato"] },
    { id: "arms5", name: "Concentration Curl", nameIt: "Curl Concentrato", target: "biceps", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Seduto con gomito sulla coscia", "Curl il manubrio", "Contrai al massimo", "Abbassa controllato"] },
    { id: "arms6", name: "Tricep Dips", nameIt: "Dip per Tricipiti", target: "triceps", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["chest", "shoulders"], instructions: ["Alle parallele", "Corpo verticale", "Scendi piegando i gomiti", "Spingi verso l'alto"] },
    { id: "arms7", name: "Preacher Curl", nameIt: "Curl alla Panca Scott", target: "biceps", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Braccia sulla panca Scott", "Curl il bilanciere", "Contrai al massimo", "Abbassa controllato"] },
  ],
  upper_legs: [
    { id: "legs1", name: "Squat", nameIt: "Squat", target: "quads", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes", "hamstrings", "core"], instructions: ["Bilanciere sulle spalle", "Scendi piegando le ginocchia", "Coscia parallela al pavimento", "Risali spingendo"] },
    { id: "legs2", name: "Leg Press", nameIt: "Leg Press", target: "quads", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["Siediti alla macchina", "Piedi sulla pedana", "Spingi la pedana", "Torna controllato"] },
    { id: "legs3", name: "Romanian Deadlift", nameIt: "Stacco Rumeno", target: "hamstrings", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes", "lower back"], instructions: ["In piedi con bilanciere", "Piega il busto mantenendo schiena dritta", "Senti stiramento ai femorali", "Risali contraendo glutei"] },
    { id: "legs4", name: "Leg Extension", nameIt: "Leg Extension", target: "quads", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Siediti alla macchina", "Estendi le gambe", "Contrai i quadricipiti", "Abbassa controllato"] },
    { id: "legs5", name: "Leg Curl", nameIt: "Leg Curl", target: "hamstrings", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Sdraiato alla macchina", "Fletti le gambe", "Contrai i femorali", "Estendi controllato"] },
    { id: "legs6", name: "Lunges", nameIt: "Affondi", target: "quads", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["In piedi", "Fai un passo avanti", "Scendi piegando entrambe le ginocchia", "Torna alla posizione iniziale"] },
    { id: "legs7", name: "Bulgarian Split Squat", nameIt: "Split Squat Bulgaro", target: "quads", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["Piede posteriore su panca", "Scendi piegando il ginocchio anteriore", "Mantieni busto eretto", "Risali spingendo"] },
  ],
  glutes: [
    { id: "glutes1", name: "Hip Thrust", nameIt: "Hip Thrust", target: "glutes", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["hamstrings"], instructions: ["Schiena su panca", "Bilanciere sui fianchi", "Spingi i fianchi verso l'alto", "Contrai i glutei in cima"] },
    { id: "glutes2", name: "Glute Bridge", nameIt: "Ponte Glutei", target: "glutes", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["hamstrings"], instructions: ["Sdraiato a terra", "Ginocchia piegate", "Solleva i fianchi", "Contrai i glutei"] },
    { id: "glutes3", name: "Cable Kickback", nameIt: "Kickback ai Cavi", target: "glutes", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["hamstrings"], instructions: ["Al cavo basso", "Cavigliera alla caviglia", "Spingi la gamba indietro", "Contrai il gluteo"] },
    { id: "glutes4", name: "Sumo Deadlift", nameIt: "Stacco Sumo", target: "glutes", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["quads", "hamstrings", "adductors"], instructions: ["Piedi larghi", "Afferra il bilanciere", "Solleva mantenendo schiena dritta", "Contrai glutei in cima"] },
    { id: "glutes5", name: "Step Ups", nameIt: "Step Up", target: "glutes", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["quads", "hamstrings"], instructions: ["Davanti a una panca", "Sali con un piede", "Spingi con il gluteo", "Scendi controllato"] },
  ],
  waist: [
    { id: "core1", name: "Plank", nameIt: "Plank", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["shoulders", "glutes"], instructions: ["Posizione plank sui gomiti", "Corpo in linea retta", "Contrai addominali", "Mantieni la posizione"] },
    { id: "core2", name: "Crunches", nameIt: "Crunch", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Sdraiato a terra", "Ginocchia piegate", "Solleva spalle e testa", "Contrai gli addominali"] },
    { id: "core3", name: "Leg Raise", nameIt: "Alzate Gambe", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["hip flexors"], instructions: ["Sdraiato o appeso", "Gambe tese", "Solleva le gambe", "Abbassa controllato"] },
    { id: "core4", name: "Russian Twist", nameIt: "Russian Twist", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["obliques"], instructions: ["Seduto con busto inclinato", "Piedi sollevati", "Ruota il busto", "Alterna i lati"] },
    { id: "core5", name: "Cable Crunch", nameIt: "Crunch ai Cavi", target: "abs", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["In ginocchio al cavo", "Corda dietro la testa", "Fletti il busto in avanti", "Contrai gli addominali"] },
    { id: "core6", name: "Mountain Climbers", nameIt: "Mountain Climbers", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["hip flexors", "shoulders"], instructions: ["Posizione plank", "Porta ginocchio al petto", "Alterna velocemente", "Mantieni core contratto"] },
  ],
  lower_legs: [
    { id: "calves1", name: "Standing Calf Raise", nameIt: "Calf Raise in Piedi", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["In piedi alla macchina", "Solleva sui polpacci", "Contrai in cima", "Abbassa controllato"] },
    { id: "calves2", name: "Seated Calf Raise", nameIt: "Calf Raise Seduto", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Seduto alla macchina", "Solleva sui polpacci", "Contrai in cima", "Abbassa controllato"] },
    { id: "calves3", name: "Donkey Calf Raise", nameIt: "Donkey Calf Raise", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Piegato in avanti alla macchina", "Solleva sui polpacci", "Contrai in cima", "Abbassa controllato"] },
  ],
  cardio: [
    { id: "cardio1", name: "Treadmill Running", nameIt: "Corsa su Tapis Roulant", target: "cardiovascular system", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["quads", "hamstrings", "calves"], instructions: ["Imposta velocità desiderata", "Corri mantenendo postura eretta", "Braccia rilassate", "Respira regolarmente"] },
    { id: "cardio2", name: "Cycling", nameIt: "Cyclette", target: "cardiovascular system", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["quads", "hamstrings", "glutes"], instructions: ["Regola il sellino", "Pedala a ritmo costante", "Mantieni postura corretta", "Varia l'intensità"] },
    { id: "cardio3", name: "Rowing Machine", nameIt: "Vogatore", target: "cardiovascular system", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["back", "arms", "core"], instructions: ["Siediti al vogatore", "Afferra la maniglia", "Spingi con le gambe", "Tira con le braccia"] },
    { id: "cardio4", name: "Jump Rope", nameIt: "Salto con la Corda", target: "cardiovascular system", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["calves", "shoulders"], instructions: ["Impugna la corda", "Salta a piedi uniti", "Ruota i polsi", "Mantieni ritmo costante"] },
  ],
  lower_arms: [
    { id: "forearms1", name: "Wrist Curl", nameIt: "Curl Polsi", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Avambracci su panca", "Palmi verso l'alto", "Fletti i polsi verso l'alto", "Abbassa controllato"] },
    { id: "forearms2", name: "Reverse Wrist Curl", nameIt: "Curl Polsi Inverso", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: ["Avambracci su panca", "Palmi verso il basso", "Estendi i polsi verso l'alto", "Abbassa controllato"] },
    { id: "forearms3", name: "Farmer's Walk", nameIt: "Farmer's Walk", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["traps", "core"], instructions: ["Afferra manubri pesanti", "Cammina mantenendo postura eretta", "Spalle indietro", "Presa salda"] },
  ],
}

// Mapping dei bodyPart per AscendAPI
const BODYPART_MAPPING: Record<string, string> = {
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  upper_arms: "upper arms",
  lower_arms: "lower arms",
  upper_legs: "upper legs",
  lower_legs: "lower legs",
  waist: "waist",
  cardio: "cardio",
  glutes: "upper legs",
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bodyPart = searchParams.get("bodyPart") || "chest"

  // Prova a usare RAPID_API_KEY o RAPIDAPI_KEY
  const apiKey = process.env.RAPID_API_KEY || process.env.RAPIDAPI_KEY

  console.log("[v0] RAPID_API_KEY exists:", !!process.env.RAPID_API_KEY)
  console.log("[v0] RAPIDAPI_KEY exists:", !!process.env.RAPIDAPI_KEY)
  console.log("[v0] Using API key:", !!apiKey)

  if (apiKey) {
    try {
      const mappedBodyPart = BODYPART_MAPPING[bodyPart] || bodyPart

      // Usa AscendAPI invece di ExerciseDB
      const url = `https://exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com/exercises?bodyPart=${encodeURIComponent(mappedBodyPart)}&limit=50`

      console.log("[v0] Fetching from AscendAPI:", url)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com",
        },
        signal: controller.signal,
      }).catch(() => null)

      clearTimeout(timeoutId)

      if (response && response.ok) {
        const data = await response.json()
        console.log("[v0] AscendAPI returned", data?.length || 0, "exercises")

        // Trasforma i dati AscendAPI nel formato atteso
        const exercises = (data || []).map((ex: any) => ({
          id: ex.id || ex.exerciseId,
          name: ex.name || ex.exerciseName,
          nameIt: ex.name || ex.exerciseName,
          target: ex.targetMuscle || ex.target,
          equipment: ex.equipmentNeeded || ex.equipment,
          gifUrl: ex.gifUrl || ex.image || ex.videoUrl || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(ex.name || "exercise")}`,
          secondaryMuscles: ex.secondaryMuscles || [],
          instructions: ex.instructions || [],
        }))

        return NextResponse.json({
          exercises,
          source: "ascendapi",
          bodyPart,
        })
      } else {
        const errorText = response ? await response.text() : "No response"
        console.log("[v0] AscendAPI error:", response?.status, errorText)
      }
    } catch (error) {
      console.log("[v0] AscendAPI fetch error:", error)
    }
  }

  // Fallback al database locale
  console.log("[v0] Using local fallback database for:", bodyPart)
  const localExercises = LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"] || []

  return NextResponse.json({
    exercises: localExercises,
    source: "local_fallback",
    bodyPart,
  })
}
