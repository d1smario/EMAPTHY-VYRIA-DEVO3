import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

// Flag to enable AI Gateway
const USE_AI_GATEWAY = true;

// Bacteria database for local fallback
const BACTERIA_DATABASE: Record<string, {
  referenceRange: { min: number; max: number };
  metabolicFunctions: string[];
  pathways: string[];
  toxicPotential: { level: string; substances: string[]; mechanisms: string[] };
  geneticCapabilities: string[];
  scientificEvidence: { finding: string; source: string; relevance: string }[];
}> = {
  'bacteroides': {
    referenceRange: { min: 20, max: 40 },
    metabolicFunctions: ['Degradazione polisaccaridi', 'Produzione propionato', 'Metabolismo bile'],
    pathways: ['Glycolysis', 'Pentose phosphate', 'Bile acid metabolism'],
    toxicPotential: { level: 'low', substances: [], mechanisms: [] },
    geneticCapabilities: ['Polysaccharide utilization loci (PUL)', 'Bile salt hydrolase genes'],
    scientificEvidence: [
      { finding: 'Bacteroides contribuisce alla degradazione di fibre complesse e produzione di SCFA', source: 'Nature Reviews Microbiology 2021', relevance: 'high' }
    ]
  },
  'firmicutes': {
    referenceRange: { min: 40, max: 60 },
    metabolicFunctions: ['Fermentazione carboidrati', 'Produzione butirrato', 'Estrazione energia'],
    pathways: ['Butyrate production', 'Carbohydrate fermentation'],
    toxicPotential: { level: 'low', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyrate kinase', 'Butyryl-CoA:acetate CoA-transferase'],
    scientificEvidence: [
      { finding: 'Ratio F/B elevato associato a obesita in alcuni studi', source: 'Nature 2006', relevance: 'high' }
    ]
  },
  'akkermansia': {
    referenceRange: { min: 1, max: 5 },
    metabolicFunctions: ['Degradazione mucina', 'Rafforzamento barriera intestinale', 'Anti-infiammatorio'],
    pathways: ['Mucin degradation', 'Propionate production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Mucin-degrading enzymes', 'Outer membrane proteins'],
    scientificEvidence: [
      { finding: 'Akkermansia muciniphila migliora la funzione metabolica', source: 'Nature Medicine 2019', relevance: 'high' }
    ]
  },
  'bifidobacterium': {
    referenceRange: { min: 3, max: 10 },
    metabolicFunctions: ['Produzione acetato e lattato', 'Sintesi vitamine B', 'Immunomodulazione'],
    pathways: ['Bifid shunt', 'Folate biosynthesis', 'B12 synthesis'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Fructose-6-phosphate phosphoketolase', 'Folate synthesis genes'],
    scientificEvidence: [
      { finding: 'Bifidobacterium supporta immunita intestinale', source: 'Gut Microbes 2021', relevance: 'high' }
    ]
  },
  'lactobacillus': {
    referenceRange: { min: 0.1, max: 5 },
    metabolicFunctions: ['Produzione acido lattico', 'Antimicrobico', 'Metabolismo bile'],
    pathways: ['Lactic acid fermentation', 'Bacteriocin production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Lactate dehydrogenase', 'Bacteriocin genes'],
    scientificEvidence: [
      { finding: 'Lactobacillus produce composti antimicrobici', source: 'Frontiers Microbiology 2020', relevance: 'high' }
    ]
  },
  'faecalibacterium': {
    referenceRange: { min: 5, max: 15 },
    metabolicFunctions: ['Produzione butirrato', 'Anti-infiammatorio', 'Supporto barriera'],
    pathways: ['Butyrate production via acetyl-CoA'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyrate production genes', 'Anti-inflammatory proteins'],
    scientificEvidence: [
      { finding: 'F. prausnitzii e il principale produttore di butirrato', source: 'Gut 2020', relevance: 'high' }
    ]
  },
  'enterobacteriaceae': {
    referenceRange: { min: 0.1, max: 2 },
    metabolicFunctions: ['Patogeni opportunisti', 'Pro-infiammatorio'],
    pathways: ['LPS production', 'Inflammatory signaling'],
    toxicPotential: { level: 'high', substances: ['LPS', 'Enterotoxins'], mechanisms: ['Endotoxemia'] },
    geneticCapabilities: ['Pathogenicity islands', 'LPS synthesis'],
    scientificEvidence: [
      { finding: 'Enterobacteriaceae aumentati associati a infiammazione', source: 'Nature Reviews Gastroenterology 2021', relevance: 'high' }
    ]
  },
  'desulfovibrio': {
    referenceRange: { min: 0, max: 1 },
    metabolicFunctions: ['Riduzione solfato', 'Produzione H2S'],
    pathways: ['Sulfate reduction'],
    toxicPotential: { level: 'high', substances: ['H2S'], mechanisms: ['Sulfate-reducing bacteria produce toxic H2S'] },
    geneticCapabilities: ['Dissimilatory sulfite reductase'],
    scientificEvidence: [
      { finding: 'Desulfovibrio produce H2S tossico per la mucosa', source: 'Gut Microbes 2021', relevance: 'high' }
    ]
  },
  'bilophila': {
    referenceRange: { min: 0, max: 0.5 },
    metabolicFunctions: ['Metabolismo taurina', 'Pro-infiammatorio'],
    pathways: ['Taurine metabolism', 'H2S production'],
    toxicPotential: { level: 'high', substances: ['H2S'], mechanisms: ['Taurine-derived sulfide production'] },
    geneticCapabilities: ['Taurine-pyruvate aminotransferase'],
    scientificEvidence: [
      { finding: 'Bilophila aumenta con diete ricche di grassi saturi', source: 'Nature 2012', relevance: 'high' }
    ]
  }
};

// Zod schemas for AI responses
const bacteriaSchema = z.object({
  bacteria: z.array(z.object({
    name: z.string(),
    abundance: z.number(),
    status: z.enum(['low', 'normal', 'high']),
    referenceRange: z.object({ min: z.number(), max: z.number() }),
    metabolicFunctions: z.array(z.string()),
    pathways: z.array(z.string()),
    toxicPotential: z.object({
      level: z.string(),
      substances: z.array(z.string()),
      mechanisms: z.array(z.string())
    }),
    geneticCapabilities: z.array(z.string()),
    scientificEvidence: z.array(z.object({
      finding: z.string(),
      source: z.string(),
      relevance: z.string()
    }))
  })),
  diversityIndex: z.number(),
  firmicutesBacteroidetesRatio: z.number(),
  overallHealth: z.enum(['optimal', 'good', 'suboptimal', 'compromised']),
  keyFindings: z.array(z.string()),
  riskFactors: z.array(z.string())
});

const pathwaySchema = z.object({
  scfaProduction: z.object({
    butyrate: z.object({ level: z.number(), status: z.string() }),
    propionate: z.object({ level: z.number(), status: z.string() }),
    acetate: z.object({ level: z.number(), status: z.string() })
  }),
  toxicMetabolites: z.array(z.object({
    name: z.string(),
    producedBy: z.array(z.string()),
    healthRisk: z.string(),
    detoxStrategy: z.string()
  })),
  vitaminSynthesis: z.object({
    b12: z.object({ capacity: z.string(), recommendation: z.string() }),
    k2: z.object({ capacity: z.string(), recommendation: z.string() }),
    folate: z.object({ capacity: z.string(), recommendation: z.string() }),
    biotin: z.object({ capacity: z.string(), recommendation: z.string() })
  }),
  activePathways: z.array(z.object({
    name: z.string(),
    status: z.string(),
    bacteriaInvolved: z.array(z.string()),
    metabolites: z.array(z.string()),
    healthImplication: z.string(),
    intervention: z.string()
  }))
});

const recommendationsSchema = z.object({
  foodsToEliminate: z.array(z.object({
    food: z.string(),
    reason: z.string(),
    relatedBacteria: z.array(z.string()),
    duration: z.string(),
    priority: z.enum(['high', 'medium', 'low'])
  })),
  foodsToIntroduce: z.array(z.object({
    food: z.string(),
    benefit: z.string(),
    targetBacteria: z.array(z.string()),
    timing: z.string(),
    frequency: z.string(),
    priority: z.enum(['high', 'medium', 'low'])
  })),
  supplementsRecommended: z.array(z.object({
    name: z.string(),
    dose: z.string(),
    timing: z.string(),
    duration: z.string(),
    reason: z.string(),
    scientificBasis: z.string(),
    priority: z.enum(['essential', 'recommended', 'optional'])
  })),
  probioticsRecommended: z.array(z.object({
    strain: z.string(),
    cfu: z.string(),
    benefit: z.string(),
    timing: z.string()
  })),
  prebioticsRecommended: z.array(z.object({
    type: z.string(),
    source: z.string(),
    benefit: z.string(),
    dose: z.string()
  }))
});

// Local fallback parser
function parseLocalMicrobiomeData(rawData: string) {
  const lines = rawData.toLowerCase().split(/[\n,;]/);
  const bacteria: any[] = [];
  let totalAbundance = 0;
  
  const bacteriaPatterns = [
    { pattern: /bacteroides/i, name: 'Bacteroides' },
    { pattern: /firmicutes/i, name: 'Firmicutes' },
    { pattern: /akkermansia/i, name: 'Akkermansia muciniphila' },
    { pattern: /bifidobacterium/i, name: 'Bifidobacterium' },
    { pattern: /lactobacillus/i, name: 'Lactobacillus' },
    { pattern: /faecalibacterium|f\.\s*prausnitzii/i, name: 'Faecalibacterium prausnitzii' },
    { pattern: /enterobacteriaceae|e\.\s*coli|escherichia/i, name: 'Enterobacteriaceae' },
    { pattern: /desulfovibrio/i, name: 'Desulfovibrio' },
    { pattern: /bilophila/i, name: 'Bilophila wadsworthia' }
  ];
  
  for (const line of lines) {
    for (const { pattern, name } of bacteriaPatterns) {
      if (pattern.test(line)) {
        const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%?/);
        const abundance = percentMatch ? parseFloat(percentMatch[1]) : Math.random() * 10 + 1;
        
        const dbKey = name.toLowerCase().split(' ')[0];
        const dbInfo = BACTERIA_DATABASE[dbKey] || BACTERIA_DATABASE['bacteroides'];
        
        let status: 'low' | 'normal' | 'high' = 'normal';
        if (abundance < dbInfo.referenceRange.min) status = 'low';
        else if (abundance > dbInfo.referenceRange.max) status = 'high';
        
        if (!bacteria.find(b => b.name === name)) {
          bacteria.push({
            name,
            abundance: Math.round(abundance * 100) / 100,
            status,
            referenceRange: dbInfo.referenceRange,
            metabolicFunctions: dbInfo.metabolicFunctions,
            pathways: dbInfo.pathways,
            toxicPotential: dbInfo.toxicPotential,
            geneticCapabilities: dbInfo.geneticCapabilities,
            scientificEvidence: dbInfo.scientificEvidence
          });
          totalAbundance += abundance;
        }
        break;
      }
    }
  }
  
  const firmicutes = bacteria.find(b => b.name.toLowerCase().includes('firmicutes'))?.abundance || 45;
  const bacteroidesVal = bacteria.find(b => b.name.toLowerCase().includes('bacteroides'))?.abundance || 30;
  const fbRatio = bacteroidesVal > 0 ? firmicutes / bacteroidesVal : 1.5;
  
  const diversityIndex = bacteria.length > 0 
    ? -bacteria.reduce((sum, b) => {
        const p = b.abundance / (totalAbundance || 100);
        return sum + (p > 0 ? p * Math.log(p) : 0);
      }, 0)
    : 2.5;
  
  return {
    bacteria: bacteria.length > 0 ? bacteria : [{ name: 'Dati insufficienti', abundance: 0, status: 'normal' as const, referenceRange: { min: 0, max: 100 }, metabolicFunctions: [], pathways: [], toxicPotential: { level: 'none', substances: [], mechanisms: [] }, geneticCapabilities: [], scientificEvidence: [] }],
    diversityIndex: Math.round(diversityIndex * 100) / 100,
    firmicutesBacteroidetesRatio: Math.round(fbRatio * 100) / 100,
    overallHealth: 'good' as const,
    keyFindings: ['Analisi completata'],
    riskFactors: []
  };
}

export async function POST(req: Request) {
  try {
    const { rawData, analysisType } = await req.json();

    if (USE_AI_GATEWAY) {
      // AI-powered analysis
      if (analysisType === 'parse') {
        const { object: bacteriaAnalysis } = await generateObject({
          model: 'openai/gpt-4o-mini',
          schema: bacteriaSchema,
          prompt: `Analizza questi dati del microbioma intestinale e fornisci un'analisi dettagliata in italiano.
          
Dati del test:
${rawData}

Analizza:
1. Identifica tutti i batteri presenti con abbondanza relativa
2. Calcola l'indice di diversita Shannon
3. Calcola il ratio Firmicutes/Bacteroidetes
4. Determina lo stato di salute generale del microbioma
5. Identifica findings chiave e fattori di rischio
6. Per ogni batterio, includi funzioni metaboliche, pathway, potenziale tossico e evidenze scientifiche`
        });
        
        return Response.json({ success: true, type: 'bacteria_analysis', data: bacteriaAnalysis, source: 'ai' });
      }
      
      if (analysisType === 'pathways') {
        const bacteriaData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const { object: pathwayAnalysis } = await generateObject({
          model: 'openai/gpt-4o-mini',
          schema: pathwaySchema,
          prompt: `Analizza i pathway metabolici basandoti su questi dati batterici:
${JSON.stringify(bacteriaData, null, 2)}

Valuta:
1. Produzione SCFA (butirrato, propionato, acetato) con livelli 0-100
2. Metaboliti tossici potenziali (H2S, ammoniaca, TMAO)
3. Capacita di sintesi vitaminica
4. Pathway attivi con batteri coinvolti e interventi consigliati`
        });
        
        return Response.json({ success: true, type: 'pathway_analysis', data: pathwayAnalysis, source: 'ai' });
      }
      
      if (analysisType === 'recommendations') {
        const inputData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const { object: recommendations } = await generateObject({
          model: 'openai/gpt-4o-mini',
          schema: recommendationsSchema,
          prompt: `Genera raccomandazioni nutrizionali personalizzate basate su questa analisi del microbioma:
${JSON.stringify(inputData, null, 2)}

Fornisci:
1. Alimenti da eliminare con motivo, batteri correlati e durata
2. Alimenti da introdurre con benefici, batteri target e frequenza
3. Supplementi consigliati con dose, timing e base scientifica
4. Probiotici specifici per ceppo con CFU
5. Prebiotici con fonti e dosi`
        });
        
        return Response.json({ success: true, type: 'recommendations', data: recommendations, source: 'ai' });
      }
    } else {
      // Local fallback
      if (analysisType === 'parse') {
        const localResult = parseLocalMicrobiomeData(rawData);
        return Response.json({ success: true, type: 'bacteria_analysis', data: localResult, source: 'local' });
      }
    }

    return Response.json({ error: 'Invalid analysis type' }, { status: 400 });
    
  } catch (error) {
    console.error('[Microbiome API] Error:', error);
    return Response.json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
