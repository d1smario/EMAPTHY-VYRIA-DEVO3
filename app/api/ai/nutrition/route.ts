import { generateText } from "ai"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { athleteId, context } = await request.json()

    if (!athleteId) {
      return NextResponse.json({ error: "athleteId required" }, { status: 400 })
    }

    // Fetch all relevant data in parallel - ONLY using existing tables/columns
    const [userResult, athleteResult, constraintsResult, metabolicResult, trainingResult] =
      await Promise.all([
        // User data for full_name
        supabase
          .from("users")
          .select("full_name")
          .eq("id", athleteId)
          .maybeSingle(),

        // Athlete data - ONLY existing columns: id, user_id, primary_sport, weight_kg
        supabase
          .from("athletes")
          .select("id, user_id, primary_sport, weight_kg")
          .eq("user_id", athleteId)
          .maybeSingle(),

        // Constraints (allergie, intolleranze, preferenze)
        supabase
          .from("athlete_constraints")
          .select("intolerances, allergies, dietary_limits, dietary_preferences")
          .eq("athlete_id", athleteId)
          .maybeSingle(),

        // Metabolic profile
        supabase
          .from("metabolic_profiles")
          .select("*")
          .eq("athlete_id", athleteId)
          .eq("is_current", true)
          .maybeSingle(),

        // Recent training
        supabase
          .from("training_activities")
          .select("*")
          .eq("athlete_id", athleteId)
          .order("activity_date", { ascending: false })
          .limit(14),
      ])

    const user = userResult.data
    const athlete = athleteResult.data
    const constraints = constraintsResult.data
    const metabolic = metabolicResult.data
    const recentTraining = trainingResult.data || []

    // Build comprehensive prompt
    const prompt = `Sei un nutrizionista sportivo esperto. Analizza questi dati e fornisci consigli nutrizionali specifici.

PROFILO ATLETA:
${user?.full_name ? `- Nome: ${user.full_name}` : ""}
${athlete?.weight_kg ? `- Peso: ${athlete.weight_kg}kg` : ""}
${athlete?.primary_sport ? `- Sport: ${athlete.primary_sport}` : ""}

VINCOLI ALIMENTARI:
${
  constraints
    ? `
- Allergie: ${constraints.allergies?.join(", ") || "Nessuna"}
- Intolleranze: ${constraints.intolerances?.join(", ") || "Nessuna"}
- Preferenze: ${constraints.dietary_preferences?.join(", ") || "Nessuna"}
- Limiti dietetici: ${constraints.dietary_limits?.join(", ") || "Nessuno"}
`
    : "Nessun vincolo registrato"
}

PROFILO METABOLICO:
${
  metabolic
    ? `
- FTP: ${metabolic.ftp_watts || "N/A"}W
- VLamax: ${metabolic.vlamax || "N/A"} mmol/L/s
- VO2max: ${metabolic.vo2max || "N/A"} ml/kg/min
- Zone HR: ${metabolic.hr_zones ? "Configurate" : "Non configurate"}
- Zone Power: ${metabolic.power_zones ? "Configurate" : "Non configurate"}
`
    : "Profilo metabolico non disponibile"
}

TRAINING RECENTE (ultimi 14gg):
${
  recentTraining.length > 0
    ? recentTraining
        .map(
          (t: any) =>
            `- ${t.activity_date}: ${t.sport || t.activity_type || "workout"} ${t.duration_minutes || 0}min, TSS ${t.tss || "N/A"}`
        )
        .join("\n")
    : "Nessun allenamento recente"
}

CONTESTO RICHIESTA: ${context || "Consigli generali"}

Fornisci una risposta JSON con questa struttura:
{
  "alerts": [
    {"type": "warning|danger|info", "title": "...", "description": "..."}
  ],
  "foodsToAvoid": [
    {"food": "...", "reason": "...", "alternatives": ["..."]}
  ],
  "foodsToInclude": [
    {"food": "...", "benefit": "...", "timing": "..."}
  ],
  "mealTiming": {
    "preWorkout": {"timing": "...", "foods": ["..."], "notes": "..."},
    "duringWorkout": {"timing": "...", "foods": ["..."], "notes": "..."},
    "postWorkout": {"timing": "...", "foods": ["..."], "notes": "..."}
  },
  "macroTargets": {
    "carbs": {"grams": 0, "timing": "..."},
    "protein": {"grams": 0, "timing": "..."},
    "fat": {"grams": 0, "timing": "..."}
  },
  "supplementProtocol": [
    {"name": "...", "dosage": "...", "timing": "...", "reason": "..."}
  ]
}`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse JSON response
    let analysis
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found")
      }
    } catch {
      analysis = {
        alerts: [{ type: "info", title: "Analisi completata", description: text.substring(0, 500) }],
        rawResponse: text,
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      dataUsed: {
        hasUser: !!user,
        hasAthlete: !!athlete,
        hasConstraints: !!constraints,
        hasMetabolic: !!metabolic,
        trainingDays: recentTraining.length,
      },
    })
  } catch (error) {
    console.error("[AI Nutrition] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
