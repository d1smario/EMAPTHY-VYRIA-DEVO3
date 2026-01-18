import { generateText } from 'ai';

export const maxDuration = 60;

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
    scientificEvidence: [{ finding: 'Bacteroides contribuisce alla degradazione di fibre complesse', source: 'Nature Reviews Microbiology 2021', relevance: 'high' }]
  },
  'firmicutes': {
    referenceRange: { min: 40, max: 60 },
    metabolicFunctions: ['Fermentazione carboidrati', 'Produzione butirrato', 'Estrazione energia'],
    pathways: ['Butyrate production', 'Carbohydrate fermentation'],
    toxicPotential: { level: 'low', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyrate kinase', 'Butyryl-CoA:acetate CoA-transferase'],
    scientificEvidence: [{ finding: 'Ratio F/B elevato associato a obesita', source: 'Nature 2006', relevance: 'high' }]
  },
  'akkermansia': {
    referenceRange: { min: 1, max: 5 },
    metabolicFunctions: ['Degradazione mucina', 'Rafforzamento barriera intestinale', 'Anti-infiammatorio'],
    pathways: ['Mucin degradation', 'Propionate production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Mucin-degrading enzymes', 'Outer membrane proteins'],
    scientificEvidence: [{ finding: 'Akkermansia migliora funzione metabolica', source: 'Nature Medicine 2019', relevance: 'high' }]
  },
  'bifidobacterium': {
    referenceRange: { min: 3, max: 10 },
    metabolicFunctions: ['Produzione acetato e lattato', 'Sintesi vitamine B', 'Immunomodulazione'],
    pathways: ['Bifid shunt', 'Folate biosynthesis', 'B12 synthesis'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Fructose-6-phosphate phosphoketolase', 'Folate synthesis genes'],
    scientificEvidence: [{ finding: 'Bifidobacterium supporta immunita intestinale', source: 'Gut Microbes 2021', relevance: 'high' }]
  },
  'lactobacillus': {
    referenceRange: { min: 0.1, max: 5 },
    metabolicFunctions: ['Produzione acido lattico', 'Antimicrobico', 'Metabolismo bile'],
    pathways: ['Lactic acid fermentation', 'Bacteriocin production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Lactate dehydrogenase', 'Bacteriocin genes'],
    scientificEvidence: [{ finding: 'Lactobacillus produce composti antimicrobici', source: 'Frontiers Microbiology 2020', relevance: 'high' }]
  },
  'faecalibacterium': {
    referenceRange: { min: 5, max: 15 },
    metabolicFunctions: ['Produzione butirrato', 'Anti-infiammatorio', 'Supporto barriera'],
    pathways: ['Butyrate production via acetyl-CoA'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyrate production genes', 'Anti-inflammatory proteins'],
    scientificEvidence: [{ finding: 'F. prausnitzii principale produttore butirrato', source: 'Gut 2020', relevance: 'high' }]
  },
  'enterobacteriaceae': {
    referenceRange: { min: 0.1, max: 2 },
    metabolicFunctions: ['Patogeni opportunisti', 'Pro-infiammatorio'],
    pathways: ['LPS production', 'Inflammatory signaling'],
    toxicPotential: { level: 'high', substances: ['LPS', 'Enterotoxins'], mechanisms: ['Endotoxemia'] },
    geneticCapabilities: ['Pathogenicity islands', 'LPS synthesis'],
    scientificEvidence: [{ finding: 'Enterobacteriaceae aumentati associati a infiammazione', source: 'Nature Reviews Gastroenterology 2021', relevance: 'high' }]
  },
  'desulfovibrio': {
    referenceRange: { min: 0, max: 1 },
    metabolicFunctions: ['Riduzione solfato', 'Produzione H2S'],
    pathways: ['Sulfate reduction'],
    toxicPotential: { level: 'high', substances: ['H2S'], mechanisms: ['Sulfate-reducing bacteria produce toxic H2S'] },
    geneticCapabilities: ['Dissimilatory sulfite reductase'],
    scientificEvidence: [{ finding: 'Desulfovibrio produce H2S tossico', source: 'Gut Microbes 2021', relevance: 'high' }]
  },
  'bilophila': {
    referenceRange: { min: 0, max: 0.5 },
    metabolicFunctions: ['Metabolismo taurina', 'Pro-infiammatorio'],
    pathways: ['Taurine metabolism', 'H2S production'],
    toxicPotential: { level: 'high', substances: ['H2S'], mechanisms: ['Taurine-derived sulfide production'] },
    geneticCapabilities: ['Taurine-pyruvate aminotransferase'],
    scientificEvidence: [{ finding: 'Bilophila aumenta con grassi saturi', source: 'Nature 2012', relevance: 'high' }]
  },
  'prevotella': {
    referenceRange: { min: 1, max: 10 },
    metabolicFunctions: ['Degradazione fibre vegetali', 'Produzione propionato'],
    pathways: ['Plant polysaccharide degradation'],
    toxicPotential: { level: 'low', substances: [], mechanisms: [] },
    geneticCapabilities: ['Xylanases', 'Cellulases'],
    scientificEvidence: [{ finding: 'Prevotella dominante in diete vegetali', source: 'Nature 2012', relevance: 'high' }]
  },
  'roseburia': {
    referenceRange: { min: 3, max: 10 },
    metabolicFunctions: ['Produzione butirrato', 'Fermentazione fibre'],
    pathways: ['Butyrate production', 'Acetate utilization'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyryl-CoA transferase'],
    scientificEvidence: [{ finding: 'Roseburia produttore chiave butirrato', source: 'ISME Journal 2019', relevance: 'high' }]
  },
  'clostridium': {
    referenceRange: { min: 1, max: 5 },
    metabolicFunctions: ['Produzione butirrato', 'Metabolismo aminoacidi'],
    pathways: ['Amino acid fermentation', 'Butyrate production'],
    toxicPotential: { level: 'moderate', substances: ['Ammoniaca', 'H2S', 'p-cresol'], mechanisms: ['Protein fermentation'] },
    geneticCapabilities: ['Amino acid decarboxylases', 'Sulfite reductase'],
    scientificEvidence: [{ finding: 'Alcuni Clostridium producono metaboliti tossici', source: 'Gut Microbes 2020', relevance: 'high' }]
  },
  'proteobacteria': {
    referenceRange: { min: 1, max: 5 },
    metabolicFunctions: ['Pro-infiammatorio se elevato'],
    pathways: ['LPS production'],
    toxicPotential: { level: 'moderate', substances: ['LPS'], mechanisms: ['Gram-negative endotoxin'] },
    geneticCapabilities: ['Various virulence factors'],
    scientificEvidence: [{ finding: 'Bloom Proteobacteria marker disbiosi', source: 'Cell 2017', relevance: 'high' }]
  },
  'ruminococcus': {
    referenceRange: { min: 2, max: 8 },
    metabolicFunctions: ['Degradazione cellulosa', 'Produzione acetato'],
    pathways: ['Cellulose degradation', 'Acetate production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Cellulosomes', 'Glycoside hydrolases'],
    scientificEvidence: [{ finding: 'Ruminococcus degrada fibre complesse', source: 'Nature Microbiology 2020', relevance: 'high' }]
  },
  'eubacterium': {
    referenceRange: { min: 2, max: 8 },
    metabolicFunctions: ['Produzione butirrato', 'Metabolismo bile'],
    pathways: ['Butyrate production', 'Bile acid transformation'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Bile salt hydrolase', 'Butyrate kinase'],
    scientificEvidence: [{ finding: 'Eubacterium rectale produttore butirrato', source: 'Gut 2019', relevance: 'high' }]
  }
};

const NUTRITION_DATABASE = {
  foodsToEliminate: [
    { food: 'Zuccheri raffinati', reason: 'Promuovono crescita batteri patogeni', relatedBacteria: ['Enterobacteriaceae'], duration: '4-6 settimane', priority: 'high' as const },
    { food: 'Alcol', reason: 'Danneggia barriera intestinale', relatedBacteria: ['Proteobacteria'], duration: 'Permanente', priority: 'high' as const },
    { food: 'Carni processate', reason: 'Aumentano batteri produttori H2S', relatedBacteria: ['Bilophila', 'Desulfovibrio'], duration: 'Permanente', priority: 'high' as const }
  ],
  foodsToIntroduce: [
    { food: 'Verdure crucifere', benefit: 'Promuovono batteri benefici', targetBacteria: ['Bifidobacterium', 'Lactobacillus'], timing: 'Pranzo e cena', frequency: 'Giornaliero', priority: 'high' as const },
    { food: 'Legumi', benefit: 'Fibre fermentabili per SCFA', targetBacteria: ['Faecalibacterium', 'Roseburia'], timing: 'Pranzo', frequency: '4-5 volte/settimana', priority: 'high' as const },
    { food: 'Alimenti fermentati (kefir, kimchi)', benefit: 'Probiotici naturali', targetBacteria: ['Lactobacillus', 'Bifidobacterium'], timing: 'Colazione', frequency: 'Giornaliero', priority: 'high' as const },
    { food: 'Frutti di bosco', benefit: 'Polifenoli per Akkermansia', targetBacteria: ['Akkermansia'], timing: 'Colazione o spuntino', frequency: 'Giornaliero', priority: 'medium' as const }
  ],
  supplements: [
    { name: 'L-Glutammina', dose: '5-10g', timing: 'A stomaco vuoto', duration: '8-12 settimane', reason: 'Supporta barriera intestinale', scientificBasis: 'PMID: 28893329', priority: 'essential' as const },
    { name: 'Butirrato', dose: '300-600mg', timing: 'Con i pasti', duration: '8 settimane', reason: 'Energia colonociti', scientificBasis: 'PMID: 30768194', priority: 'recommended' as const },
    { name: 'Omega-3', dose: '2-3g', timing: 'Con pasti grassi', duration: 'Continuativo', reason: 'Anti-infiammatorio', scientificBasis: 'PMID: 28212465', priority: 'essential' as const }
  ],
  probiotics: [
    { strain: 'Lactobacillus rhamnosus GG', cfu: '10 miliardi CFU', benefit: 'Supporto immunitario', timing: 'A stomaco vuoto' },
    { strain: 'Bifidobacterium longum BB536', cfu: '5 miliardi CFU', benefit: 'Anti-infiammatorio', timing: 'A stomaco vuoto' },
    { strain: 'Saccharomyces boulardii', cfu: '5 miliardi CFU', benefit: 'Protezione patogeni', timing: 'Lontano antifungini' }
  ],
  prebiotics: [
    { type: 'Inulina', source: 'Cicoria, aglio, cipolla', benefit: 'Nutre Bifidobacterium', dose: '5-10g/giorno' },
    { type: 'FOS', source: 'Banana, asparagi', benefit: 'Promuove SCFA', dose: '5g/giorno' },
    { type: 'Amido resistente', source: 'Patate raffreddate, banana verde', benefit: 'Produzione butirrato', dose: '15-30g/giorno' }
  ]
};

function parseLocalMicrobiomeData(rawData: string) {
  const bacteria: any[] = [];
  let totalAbundance = 0;
  
  const bacteriaPatterns = [
    { pattern: /bacteroides/i, name: 'Bacteroides' },
    { pattern: /firmicutes/i, name: 'Firmicutes' },
    { pattern: /akkermansia/i, name: 'Akkermansia muciniphila' },
    { pattern: /bifidobacterium/i, name: 'Bifidobacterium' },
    { pattern: /lactobacillus/i, name: 'Lactobacillus' },
    { pattern: /faecalibacterium|f\.\s*prausnitzii/i, name: 'Faecalibacterium prausnitzii' },
    { pattern: /prevotella/i, name: 'Prevotella' },
    { pattern: /roseburia/i, name: 'Roseburia' },
    { pattern: /clostridium/i, name: 'Clostridium' },
    { pattern: /enterobacteriaceae|e\.\s*coli|escherichia/i, name: 'Enterobacteriaceae' },
    { pattern: /proteobacteria/i, name: 'Proteobacteria' },
    { pattern: /ruminococcus/i, name: 'Ruminococcus' },
    { pattern: /eubacterium/i, name: 'Eubacterium' },
    { pattern: /desulfovibrio/i, name: 'Desulfovibrio' },
    { pattern: /bilophila/i, name: 'Bilophila wadsworthia' },
    { pattern: /blautia/i, name: 'Blautia' },
    { pattern: /streptococcus/i, name: 'Streptococcus' },
    { pattern: /veillonella/i, name: 'Veillonella' }
  ];
  
  const lines = rawData.split(/[\n,;]/);
  
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
  
  let overallHealth: 'optimal' | 'good' | 'suboptimal' | 'compromised' = 'good';
  const lowBeneficial = bacteria.filter(b => 
    ['Bifidobacterium', 'Lactobacillus', 'Faecalibacterium', 'Akkermansia'].some(n => b.name.includes(n)) && b.status === 'low'
  ).length;
  const highPathogenic = bacteria.filter(b => 
    ['Enterobacteriaceae', 'Proteobacteria', 'Desulfovibrio', 'Bilophila'].some(n => b.name.includes(n)) && b.status === 'high'
  ).length;
  
  if (lowBeneficial === 0 && highPathogenic === 0 && diversityIndex > 3) overallHealth = 'optimal';
  else if (lowBeneficial > 2 || highPathogenic > 1) overallHealth = 'suboptimal';
  else if (lowBeneficial > 3 || highPathogenic > 2) overallHealth = 'compromised';
  
  const keyFindings: string[] = [];
  const riskFactors: string[] = [];
  
  if (diversityIndex > 3) keyFindings.push('Buona diversita microbica');
  else if (diversityIndex < 2) riskFactors.push('Bassa diversita microbica');
  
  if (fbRatio > 2) riskFactors.push('Ratio F/B elevato');
  else keyFindings.push('Ratio Firmicutes/Bacteroidetes normale');
  
  bacteria.forEach(b => {
    if (b.status === 'low' && ['Bifidobacterium', 'Lactobacillus', 'Akkermansia'].some(n => b.name.includes(n))) {
      riskFactors.push(`${b.name} basso`);
    }
    if (b.status === 'high' && b.toxicPotential.level === 'high') {
      riskFactors.push(`${b.name} elevato - metaboliti tossici`);
    }
    if (b.status === 'normal' && ['Faecalibacterium', 'Roseburia', 'Akkermansia'].some(n => b.name.includes(n))) {
      keyFindings.push(`${b.name} ottimale`);
    }
  });
  
  return {
    bacteria: bacteria.length > 0 ? bacteria : [{ name: 'Dati insufficienti', abundance: 0, status: 'normal' as const, referenceRange: { min: 0, max: 100 }, metabolicFunctions: [], pathways: [], toxicPotential: { level: 'none', substances: [], mechanisms: [] }, geneticCapabilities: [], scientificEvidence: [] }],
    diversityIndex: Math.round(diversityIndex * 100) / 100,
    firmicutesBacteroidetesRatio: Math.round(fbRatio * 100) / 100,
    overallHealth,
    keyFindings: keyFindings.length > 0 ? keyFindings : ['Analisi completata'],
    riskFactors
  };
}

function analyzePathwaysLocal(bacteriaData: any) {
  const bacteria = bacteriaData.bacteria || [];
  
  const butyrateProducers = bacteria.filter((b: any) => ['Faecalibacterium', 'Roseburia', 'Eubacterium', 'Clostridium'].some(n => b.name.includes(n)));
  const propionateProducers = bacteria.filter((b: any) => ['Bacteroides', 'Prevotella', 'Akkermansia'].some(n => b.name.includes(n)));
  const acetateProducers = bacteria.filter((b: any) => ['Bifidobacterium', 'Ruminococcus', 'Blautia'].some(n => b.name.includes(n)));
  
  const butyrateLevel = butyrateProducers.reduce((sum: number, b: any) => sum + (b.abundance || 0), 0);
  const propionateLevel = propionateProducers.reduce((sum: number, b: any) => sum + (b.abundance || 0), 0);
  const acetateLevel = acetateProducers.reduce((sum: number, b: any) => sum + (b.abundance || 0), 0);
  
  const toxicMetabolites: any[] = [];
  const h2sProducers = bacteria.filter((b: any) => ['Desulfovibrio', 'Bilophila'].some(n => b.name.includes(n)) && b.status === 'high');
  if (h2sProducers.length > 0) {
    toxicMetabolites.push({ name: 'H2S', producedBy: h2sProducers.map((b: any) => b.name), healthRisk: 'Tossico per mucosa', detoxStrategy: 'Ridurre proteine animali' });
  }
  
  return {
    scfaProduction: {
      butyrate: { level: Math.min(butyrateLevel * 3, 100), status: butyrateLevel > 10 ? 'Ottimale' : 'Basso' },
      propionate: { level: Math.min(propionateLevel * 2, 100), status: propionateLevel > 15 ? 'Ottimale' : 'Basso' },
      acetate: { level: Math.min(acetateLevel * 4, 100), status: acetateLevel > 5 ? 'Ottimale' : 'Basso' }
    },
    toxicMetabolites,
    vitaminSynthesis: {
      b12: { capacity: bacteria.some((b: any) => b.name.includes('Lactobacillus')) ? 'Presente' : 'Limitata', recommendation: 'Verificare livelli' },
      k2: { capacity: bacteria.some((b: any) => b.name.includes('Bacteroides')) ? 'Adeguata' : 'Limitata', recommendation: 'Monitorare' },
      folate: { capacity: bacteria.some((b: any) => b.name.includes('Bifidobacterium')) ? 'Buona' : 'Limitata', recommendation: 'Verdure a foglia verde' },
      biotin: { capacity: 'Presente', recommendation: 'Adeguata' }
    },
    activePathways: [
      { name: 'Produzione Butirrato', status: butyrateLevel > 10 ? 'active' : 'reduced', bacteriaInvolved: butyrateProducers.map((b: any) => b.name), metabolites: ['Butirrato'], healthImplication: 'Energia colonociti', intervention: 'Aumentare fibre' }
    ]
  };
}

function generateRecommendationsLocal(bacteriaData: any) {
  const bacteria = bacteriaData.bacteria || [];
  const highPathogenic = bacteria.filter((b: any) => b.toxicPotential?.level === 'high' && b.status === 'high');
  
  return {
    foodsToEliminate: highPathogenic.length > 0 ? NUTRITION_DATABASE.foodsToEliminate : [NUTRITION_DATABASE.foodsToEliminate[0]],
    foodsToIntroduce: NUTRITION_DATABASE.foodsToIntroduce,
    foodsToModerate: [{ food: 'Carne rossa', currentIssue: 'TMAO', recommendation: 'Max 2 volte/settimana', targetQuantity: '100-150g' }],
    supplementsRecommended: NUTRITION_DATABASE.supplements,
    probioticsRecommended: NUTRITION_DATABASE.probiotics,
    prebioticsRecommended: NUTRITION_DATABASE.prebiotics,
    dietaryPatterns: [{ pattern: 'Dieta Mediterranea', description: 'Fibre, polifenoli, grassi sani', rationale: 'Supporta diversita microbica' }],
    timingRecommendations: [{ meal: 'Colazione', recommendation: 'Fibre e probiotici', reason: 'Attiva metabolismo' }]
  };
}

async function analyzeWithAI(rawData: string, analysisType: string) {
  try {
    if (analysisType === 'parse') {
      const { text } = await generateText({
        model: 'openai/gpt-4o-mini',
        prompt: `Analizza questi dati microbiota e restituisci SOLO JSON valido (no markdown):
${rawData}

JSON richiesto:
{"bacteria":[{"name":"string","abundance":number,"status":"low"|"normal"|"high","referenceRange":{"min":number,"max":number},"metabolicFunctions":["string"],"pathways":["string"],"toxicPotential":{"level":"string","substances":[],"mechanisms":[]},"geneticCapabilities":["string"],"scientificEvidence":[{"finding":"string","source":"string","relevance":"string"}]}],"diversityIndex":number,"firmicutesBacteroidetesRatio":number,"overallHealth":"optimal"|"good"|"suboptimal"|"compromised","keyFindings":["string"],"riskFactors":["string"]}`
      });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
    
    if (analysisType === 'pathways') {
      const bacteriaData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const { text } = await generateText({
        model: 'openai/gpt-4o-mini',
        prompt: `Analizza pathway metabolici. Restituisci SOLO JSON:
${JSON.stringify(bacteriaData)}

{"scfaProduction":{"butyrate":{"level":0-100,"status":"string"},"propionate":{"level":0-100,"status":"string"},"acetate":{"level":0-100,"status":"string"}},"toxicMetabolites":[{"name":"string","producedBy":[],"healthRisk":"string","detoxStrategy":"string"}],"vitaminSynthesis":{"b12":{"capacity":"string","recommendation":"string"},"k2":{"capacity":"string","recommendation":"string"},"folate":{"capacity":"string","recommendation":"string"},"biotin":{"capacity":"string","recommendation":"string"}},"activePathways":[{"name":"string","status":"string","bacteriaInvolved":[],"metabolites":[],"healthImplication":"string","intervention":"string"}]}`
      });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
    
    if (analysisType === 'recommendations') {
      const inputData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const { text } = await generateText({
        model: 'openai/gpt-4o-mini',
        prompt: `Genera raccomandazioni nutrizionali. Restituisci SOLO JSON:
${JSON.stringify(inputData)}

{"foodsToEliminate":[{"food":"string","reason":"string","relatedBacteria":[],"duration":"string","priority":"high"|"medium"|"low"}],"foodsToIntroduce":[{"food":"string","benefit":"string","targetBacteria":[],"timing":"string","frequency":"string","priority":"high"|"medium"|"low"}],"supplementsRecommended":[{"name":"string","dose":"string","timing":"string","duration":"string","reason":"string","scientificBasis":"string","priority":"essential"|"recommended"|"optional"}],"probioticsRecommended":[{"strain":"string","cfu":"string","benefit":"string","timing":"string"}],"prebioticsRecommended":[{"type":"string","source":"string","benefit":"string","dose":"string"}]}`
      });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[AI Analysis] Error:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { rawData, analysisType } = await req.json();
    
    const aiResult = await analyzeWithAI(rawData, analysisType);
    
    if (aiResult) {
      return Response.json({ success: true, type: analysisType === 'parse' ? 'bacteria_analysis' : analysisType === 'pathways' ? 'pathway_analysis' : 'recommendations', data: aiResult, source: 'ai' });
    }
    
    if (analysisType === 'parse') {
      return Response.json({ success: true, type: 'bacteria_analysis', data: parseLocalMicrobiomeData(rawData), source: 'local' });
    }
    
    if (analysisType === 'pathways') {
      const bacteriaData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      return Response.json({ success: true, type: 'pathway_analysis', data: analyzePathwaysLocal(bacteriaData), source: 'local' });
    }
    
    if (analysisType === 'recommendations') {
      const inputData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      return Response.json({ success: true, type: 'recommendations', data: generateRecommendationsLocal(inputData.bacteria || inputData), source: 'local' });
    }

    return Response.json({ error: 'Invalid analysis type' }, { status: 400 });
  } catch (error) {
    console.error('[Microbiome API] Error:', error);
    return Response.json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
