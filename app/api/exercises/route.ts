import { NextRequest, NextResponse } from "next/server"

const LOCAL_EXERCISES_DB: Record<string, any[]> = {
  chest: [
    { id: "chest1", name: "Bench Press", nameIt: "Panca Piana", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "chest2", name: "Incline Dumbbell Press", nameIt: "Panca Inclinata", target: "pectorals", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "chest3", name: "Cable Fly", nameIt: "Croci ai Cavi", target: "pectorals", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "chest4", name: "Push Ups", nameIt: "Piegamenti", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "chest5", name: "Chest Dips", nameIt: "Dip Petto", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "chest6", name: "Pec Deck", nameIt: "Pec Deck", target: "pectorals", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "chest7", name: "Decline Press", nameIt: "Panca Declinata", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
  ],
  back: [
    { id: "back1", name: "Lat Pulldown", nameIt: "Lat Machine", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    { id: "back2", name: "Barbell Row", nameIt: "Rematore Bilanciere", target: "lats", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    { id: "back3", name: "Pull Ups", nameIt: "Trazioni", target: "lats", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    { id: "back4", name: "Seated Row", nameIt: "Pulley", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    { id: "back5", name: "Dumbbell Row", nameIt: "Rematore Manubrio", target: "lats", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
  ],
  shoulders: [
    { id: "sh1", name: "Overhead Press", nameIt: "Lento Avanti", target: "delts", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "sh2", name: "Lateral Raise", nameIt: "Alzate Laterali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "sh3", name: "Front Raise", nameIt: "Alzate Frontali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "sh4", name: "Arnold Press", nameIt: "Arnold Press", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "sh5", name: "Reverse Fly", nameIt: "Aperture Inverse", target: "rear delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
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
    { id: "calf1", name: "Calf Raise", nameIt: "Calf Raise", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "calf2", name: "Seated Calf Raise", nameIt: "Calf Seduto", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  cardio: [
    { id: "card1", name: "Treadmill", nameIt: "Tapis Roulant", target: "cardio", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "card2", name: "Cycling", nameIt: "Cyclette", target: "cardio", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "card3", name: "Rowing", nameIt: "Vogatore", target: "cardio", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  lower_arms: [
    { id: "fa1", name: "Wrist Curl", nameIt: "Curl Polsi", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "fa2", name: "Reverse Curl", nameIt: "Curl Inverso", target: "forearms", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
}

const BODYPART_SEARCH: Record<string, string> = {
  chest: "chest",
  back: "back",
  shoulders: "shoulder",
  upper_arms: "arm",
  lower_arms: "forearm",
  upper_legs: "leg",
  lower_legs: "calf",
  waist: "abs",
  cardio: "cardio",
  glutes: "glute",
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bodyPart = searchParams.get("bodyPart") || "chest"

  const apiKey = process.env.RAPID_API_KEY || process.env.RAPIDAPI_KEY

  console.log("[v0] AscendAPI called, bodyPart:", bodyPart)
  console.log("[v0] API key exists:", !!apiKey)

  if (!apiKey) {
    console.log("[v0] No API key, using fallback")
    return NextResponse.json({
      exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
      source: "local_fallback",
      bodyPart,
    })
  }

  try {
    const search = BODYPART_SEARCH[bodyPart] || bodyPart
    const url = `https://exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/exercises/search?search=${encodeURIComponent(search)}`

    console.log("[v0] Fetching AscendAPI:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com",
      },
    })

    console.log("[v0] AscendAPI status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] AscendAPI error:", errorText)
      return NextResponse.json({
        exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
        source: "local_fallback",
        bodyPart,
      })
    }

    const data = await response.json()
    console.log("[v0] AscendAPI raw keys:", Object.keys(data))
    
    const exercisesArray = data?.data || data || []
    console.log("[v0] AscendAPI returned", exercisesArray.length, "exercises")

    if (!Array.isArray(exercisesArray) || exercisesArray.length === 0) {
      return NextResponse.json({
        exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
        source: "local_fallback",
        bodyPart,
      })
    }

    const exercises = exercisesArray.slice(0, 20).map((ex: any) => ({
      id: ex.id || ex.exerciseId || Math.random().toString(36).substr(2, 9),
      name: ex.name || ex.exerciseName || "Exercise",
      nameIt: ex.name || ex.exerciseName || "Esercizio",
      target: ex.targetMuscle || ex.target || bodyPart,
      equipment: ex.equipmentNeeded || ex.equipment || "body weight",
      gifUrl: ex.gifUrl || ex.image || ex.videoUrl || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(ex.name || "exercise")}`,
      secondaryMuscles: ex.secondaryMuscles || [],
      instructions: ex.instructions || [],
    }))

    return NextResponse.json({
      exercises,
      source: "ascendapi",
      bodyPart,
    })
  } catch (error) {
    console.log("[v0] AscendAPI exception:", error)
    return NextResponse.json({
      exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
      source: "local_fallback",
      bodyPart,
    })
  }
}
