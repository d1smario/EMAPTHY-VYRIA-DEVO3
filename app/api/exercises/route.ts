import { NextRequest, NextResponse } from "next/server"

const LOCAL_EXERCISES_DB: Record<string, any[]> = {
  chest: [
    { id: "chest1", name: "Bench Press", nameIt: "Panca Piana", target: "pectorals", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "chest2", name: "Incline Press", nameIt: "Panca Inclinata", target: "pectorals", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "chest3", name: "Cable Fly", nameIt: "Croci Cavi", target: "pectorals", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "chest4", name: "Push Ups", nameIt: "Piegamenti", target: "pectorals", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
  ],
  back: [
    { id: "back1", name: "Lat Pulldown", nameIt: "Lat Machine", target: "lats", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    { id: "back2", name: "Barbell Row", nameIt: "Rematore", target: "lats", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
    { id: "back3", name: "Pull Ups", nameIt: "Trazioni", target: "lats", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["biceps"], instructions: [] },
  ],
  shoulders: [
    { id: "sh1", name: "Overhead Press", nameIt: "Lento Avanti", target: "delts", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["triceps"], instructions: [] },
    { id: "sh2", name: "Lateral Raise", nameIt: "Alzate Laterali", target: "delts", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  upper_arms: [
    { id: "arm1", name: "Barbell Curl", nameIt: "Curl Bilanciere", target: "biceps", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "arm2", name: "Tricep Pushdown", nameIt: "Push Down", target: "triceps", equipment: "cable", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  upper_legs: [
    { id: "leg1", name: "Squat", nameIt: "Squat", target: "quads", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes"], instructions: [] },
    { id: "leg2", name: "Leg Press", nameIt: "Leg Press", target: "quads", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: ["glutes"], instructions: [] },
    { id: "leg3", name: "Leg Curl", nameIt: "Leg Curl", target: "hamstrings", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  glutes: [
    { id: "gl1", name: "Hip Thrust", nameIt: "Hip Thrust", target: "glutes", equipment: "barbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  waist: [
    { id: "core1", name: "Plank", nameIt: "Plank", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
    { id: "core2", name: "Crunches", nameIt: "Crunch", target: "abs", equipment: "body weight", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  lower_legs: [
    { id: "calf1", name: "Calf Raise", nameIt: "Calf Raise", target: "calves", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  cardio: [
    { id: "card1", name: "Treadmill", nameIt: "Tapis Roulant", target: "cardio", equipment: "machine", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
  ],
  lower_arms: [
    { id: "fa1", name: "Wrist Curl", nameIt: "Curl Polsi", target: "forearms", equipment: "dumbbell", gifUrl: "/placeholder.svg?height=200&width=200", secondaryMuscles: [], instructions: [] },
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
  const nameLower = name.toLowerCase()
  if (nameLower.includes("dumbbell") || nameLower.includes("db ")) return "dumbbell"
  if (nameLower.includes("barbell") || nameLower.includes("bb ")) return "barbell"
  if (nameLower.includes("cable") || nameLower.includes("pulley")) return "cable"
  if (nameLower.includes("machine") || nameLower.includes("press machine") || nameLower.includes("leg press")) return "machine"
  if (nameLower.includes("kettlebell") || nameLower.includes("kb ")) return "kettlebell"
  if (nameLower.includes("band") || nameLower.includes("resistance")) return "band"
  if (nameLower.includes("smith")) return "smith machine"
  if (nameLower.includes("ez bar") || nameLower.includes("ez-bar")) return "ez barbell"
  if (nameLower.includes("pull up") || nameLower.includes("push up") || nameLower.includes("dip") || nameLower.includes("plank") || nameLower.includes("crunch") || nameLower.includes("sit up") || nameLower.includes("lunge")) return "body weight"
  return "body weight"
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bodyPart = searchParams.get("bodyPart") || "chest"
  const apiKey = process.env.RAPID_API_KEY || process.env.RAPIDAPI_KEY

  if (!apiKey) {
    return NextResponse.json({
      exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
      source: "local_fallback",
      bodyPart,
    })
  }

  try {
    const search = BODYPART_SEARCH[bodyPart] || bodyPart
    const url = `https://exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/exercises/search?search=${encodeURIComponent(search)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com",
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
        source: "local_fallback",
        bodyPart,
      })
    }

    const data = await response.json()
    const exercisesArray = data?.data || data || []

    if (!Array.isArray(exercisesArray) || exercisesArray.length === 0) {
      return NextResponse.json({
        exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
        source: "local_fallback",
        bodyPart,
      })
    }

    const targetMuscle = BODYPART_TARGET[bodyPart] || bodyPart

    const exercises = exercisesArray.slice(0, 20).map((ex: any) => {
      const name = ex.name || ex.exerciseName || "Exercise"
      return {
        id: ex.exerciseId || ex.id || Math.random().toString(36).substr(2, 9),
        name: name,
        nameIt: name,
        target: ex.targetMuscle || ex.target || targetMuscle,
        equipment: ex.equipment || ex.equipmentNeeded || detectEquipment(name),
        gifUrl: ex.imageUrl || ex.gifUrl || ex.image || ex.videoUrl || `/placeholder.svg?height=200&width=200`,
        secondaryMuscles: ex.secondaryMuscles || [],
        instructions: ex.instructions || [],
      }
    })

    return NextResponse.json({
      exercises,
      source: "ascendapi",
      bodyPart,
    })
  } catch (error) {
    return NextResponse.json({
      exercises: LOCAL_EXERCISES_DB[bodyPart] || LOCAL_EXERCISES_DB["chest"],
      source: "local_fallback",
      bodyPart,
    })
  }
}
