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

    // Fetch all relevant data in parallel - CORRECT tables
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

    // Calculate training load
    const totalTSS = training.reduce((sum: number, t: any) => sum + (t.tss || 0), 0)
    const avgDuration =
      training.length > 0 ? training.reduce((sum: number, t: any) => sum + (t.duration_minutes || 0), 0) / training.length : 0
    const highIntensityDays = training.filter((t: any) => t.intensity === "high" || (t.tss && t.tss > 80)).length

    const prompt = `Sei un esperto di microbioma intestinale e performance sportiva. Analizza questi dati e identifica:
1. Interazioni tra microbioma e allenamento
2. Pathway metabolici alterati
3. Rischi per la performance
4. Opportunita' di ottimizzazione

PROFILO ATLETA:
${user?.full_name ? `- Nome: ${user.full_name}` : ""}
${athlete?.weight_kg ? `- Peso: ${athlete.weight_kg}kg` : ""}
${athlete?.primary_sport ? `- Sport: ${athlete.primary_sport}` : ""}

DATI MICROBIOMA:
- Dati disponibili tramite caricamento PDF nella sezione Microbiome

PROFILO METABOLICO:
${
  metabolic
    ? `
- FTP: ${metabolic.ftp_watts || "N/A"}W
- VLamax: ${metabolic.vlamax || "N/A"} mmol/L/s
`
    : "Profilo metabolico non disponibile"
}

CARICO ALLENAMENTO (ultimi 30gg):
- TSS totale: ${totalTSS}
- Sessioni: ${training.length}
- Durata media: ${avgDuration.toFixed(0)} min
- Giorni alta intensita': ${highIntensityDays}

VINCOLI ALIMENTARI:
${
  constraints
    ? `
- Allergie: ${constraints.allergies?.join(", ") || "Nessuna"}
- Intolleranze: ${constraints.intolerances?.join(", ") || "Nessuna"}
`
    : "Nessun vincolo"
}

CONTESTO: ${context || "Analisi generale"}

IMPORTANTE: Identifica interazioni CRITICHE come:
- Candida + alto carico glicemico + anaerobico = proliferazione, CO2, metano, inibizione mTOR
- Enterobacteriaceae elevate + endurance lungo = endotoxemia, LPS, fatica centrale
- Clostridium + proteine alte + fibre basse = ammoniaca, neurotossicita'
- Desulfovibrio/Bilophila + grassi saturi = H2S, danno mucosa

Fornisci risposta JSON:
{
  "criticalAlerts": [
    {"severity": "high|medium|low", "interaction": "...", "mechanism": "...", "consequence": "...", "solution": "..."}
  ],
  "pathwayAnalysis": [
    {"pathway": "...", "status": "blocked|impaired|optimal", "bacteria_involved": ["..."], "impact": "...", "intervention": "..."}
  ],
  "trainingInteractions": [
    {"training_type": "...", "microbiome_effect": "...", "recommendation": "..."}
  ],
  "probioticProtocol": [
    {"strain": "...", "cfu": "...", "timing": "...", "reason": "..."}
  ],
  "prebioticProtocol": [
    {"fiber_type": "...", "source": "...", "amount": "...", "target_bacteria": "..."}
  ],
  "foodsForGutHealth": [
    {"food": "...", "benefit": "...", "frequency": "..."}
  ],
  "foodsToAvoid": [
    {"food": "...", "reason": "...", "duration": "..."}
  ],
  "recoveryImpact": {
    "gutPermeability": "...",
    "inflammationRisk": "...",
    "nutrientAbsorption": "...",
    "recommendations": ["..."]
  }
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
        criticalAlerts: [{ severity: "medium", interaction: "Analisi completata", mechanism: text.substring(0, 500) }],
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
        totalTSS,
      },
    })
  } catch (error) {
    console.error("[AI Microbiome] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
