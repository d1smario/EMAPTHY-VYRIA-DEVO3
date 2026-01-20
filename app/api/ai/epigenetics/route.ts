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

    // Fetch all relevant data - ONLY existing tables
    const [userResult, athleteResult, metabolicResult, trainingResult, constraintsResult] =
      await Promise.all([
        supabase.from("users").select("full_name").eq("id", athleteId).maybeSingle(),
        supabase.from("athletes").select("id, user_id, primary_sport, weight_kg").eq("user_id", athleteId).maybeSingle(),
        supabase
          .from("metabolic_profiles")
          .select("*")
          .eq("athlete_id", athleteId)
          .eq("is_current", true)
          .maybeSingle(),
        supabase
          .from("training_activities")
          .select("*")
          .eq("athlete_id", athleteId)
          .order("activity_date", { ascending: false })
          .limit(30),
        supabase
          .from("athlete_constraints")
          .select("intolerances, allergies, dietary_limits, dietary_preferences")
          .eq("athlete_id", athleteId)
          .maybeSingle(),
      ])

    const user = userResult.data
    const athlete = athleteResult.data
    const metabolic = metabolicResult.data
    const training = trainingResult.data || []
    const constraints = constraintsResult.data

    const prompt = `Sei un esperto di epigenetica sportiva e nutrigenomica. Analizza i dati genetici/epigenetici e incrocia con microbioma, metabolismo e allenamento.

PROFILO ATLETA:
${user?.full_name ? `- Nome: ${user.full_name}` : ""}
${athlete?.weight_kg ? `- Peso: ${athlete.weight_kg}kg` : ""}
${athlete?.primary_sport ? `- Sport: ${athlete.primary_sport}` : ""}

DATI EPIGENETICI:
- Dati disponibili tramite caricamento PDF nella sezione Epigenetica

MICROBIOMA:
- Dati disponibili tramite caricamento PDF nella sezione Microbiome

PROFILO METABOLICO:
${
  metabolic
    ? `
- FTP: ${metabolic.ftp_watts || "N/A"}W, VLamax: ${metabolic.vlamax || "N/A"}
`
    : "Non disponibile"
}

TRAINING (30gg):
- Sessioni: ${training.length}
- TSS totale: ${training.reduce((s: number, t: any) => s + (t.tss || 0), 0)}

VINCOLI:
${constraints ? `Allergie: ${constraints.allergies?.join(", ") || "Nessuna"}` : "Nessuno"}

CONTESTO: ${context || "Analisi generale"}

Analizza:
1. Come i geni metilati/acetilati influenzano la risposta all'allenamento
2. Interazioni gene-microbioma (es. MTHFR + folati batterici)
3. Capacita' genetiche di recupero, sintesi proteica, metabolismo
4. Nutrienti chiave per modulare l'espressione genica

Fornisci JSON:
{
  "geneticProfile": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "adaptationCapacity": "high|medium|low"
  },
  "methylationStatus": [
    {"gene": "...", "status": "hyper|hypo|normal", "impact": "...", "intervention": "..."}
  ],
  "geneEnvironmentInteractions": [
    {"gene": "...", "environmental_factor": "...", "interaction": "...", "recommendation": "..."}
  ],
  "geneMicrobiomeInteractions": [
    {"gene": "...", "bacteria": "...", "interaction": "...", "optimization": "..."}
  ],
  "trainingResponse": {
    "enduranceCapacity": "...",
    "strengthCapacity": "...",
    "recoveryRate": "...",
    "injuryRisk": "...",
    "recommendations": ["..."]
  },
  "nutrigenomicProtocol": [
    {"nutrient": "...", "target_gene": "...", "dosage": "...", "timing": "...", "mechanism": "..."}
  ],
  "epigeneticModulators": [
    {"compound": "...", "source": "...", "effect": "...", "dosage": "..."}
  ],
  "lifestyleFactors": [
    {"factor": "...", "epigenetic_effect": "...", "recommendation": "..."}
  ]
}`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

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
        geneticProfile: { strengths: [], weaknesses: [], adaptationCapacity: "medium" },
        rawResponse: text,
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      dataUsed: {
        hasAthlete: !!athlete,
        hasMetabolic: !!metabolic,
        trainingDays: training.length,
      },
    })
  } catch (error) {
    console.error("[AI Epigenetics] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
