import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

// Flag per abilitare AI Gateway (true se hai crediti Vercel)
const USE_AI_GATEWAY = true;

// Comprehensive bacteria database with scientific data
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
      { finding: 'Bacteroides contribuisce alla degradazione di fibre complesse e produzione di SCFA', source: 'Nature Reviews Microbiology 2021', relevance: 'high' },
      { finding: 'Associato a metabolismo sano del glucosio', source: 'Cell Host & Microbe 2020', relevance: 'high' }
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
      { finding: 'Akkermansia muciniphila migliora la funzione metabolica e riduce infiammazione', source: 'Nature Medicine 2019', relevance: 'high' },
      { finding: 'Associato a miglior risposta all immunoterapia', source: 'Science 2018', relevance: 'high' }
    ]
  },
  'bifidobacterium': {
    referenceRange: { min: 3, max: 10 },
    metabolicFunctions: ['Produzione acetato e lattato', 'Sintesi vitamine B', 'Immunomodulazione'],
    pathways: ['Bifid shunt', 'Folate biosynthesis', 'B12 synthesis'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Fructose-6-phosphate phosphoketolase', 'Folate synthesis genes'],
    scientificEvidence: [
      { finding: 'Bifidobacterium supporta l immunita intestinale e riduce patogeni', source: 'Gut Microbes 2021', relevance: 'high' }
    ]
  },
  'lactobacillus': {
    referenceRange: { min: 0.1, max: 5 },
    metabolicFunctions: ['Produzione acido lattico', 'Antimicrobico', 'Metabolismo bile'],
    pathways: ['Lactic acid fermentation', 'Bacteriocin production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Lactate dehydrogenase', 'Bacteriocin genes'],
    scientificEvidence: [
      { finding: 'Lactobacillus produce composti antimicrobici che proteggono da patogeni', source: 'Frontiers Microbiology 2020', relevance: 'high' }
    ]
  },
  'faecalibacterium': {
    referenceRange: { min: 5, max: 15 },
    metabolicFunctions: ['Produzione butirrato', 'Anti-infiammatorio', 'Supporto barriera'],
    pathways: ['Butyrate production via acetyl-CoA'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyrate production genes', 'Anti-inflammatory proteins'],
    scientificEvidence: [
      { finding: 'F. prausnitzii e il principale produttore di butirrato, ridotto in IBD', source: 'Gut 2020', relevance: 'high' }
    ]
  },
  'prevotella': {
    referenceRange: { min: 1, max: 10 },
    metabolicFunctions: ['Degradazione fibre vegetali', 'Produzione propionato'],
    pathways: ['Plant polysaccharide degradation'],
    toxicPotential: { level: 'low', substances: ['TMAO in alcuni contesti'], mechanisms: ['Via carnitine metabolism'] },
    geneticCapabilities: ['Xylanases', 'Cellulases'],
    scientificEvidence: [
      { finding: 'Prevotella dominante in diete ricche di fibre vegetali', source: 'Nature 2012', relevance: 'high' }
    ]
  },
  'roseburia': {
    referenceRange: { min: 3, max: 10 },
    metabolicFunctions: ['Produzione butirrato', 'Fermentazione fibre'],
    pathways: ['Butyrate production', 'Acetate utilization'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Butyryl-CoA transferase'],
    scientificEvidence: [
      { finding: 'Roseburia e un produttore chiave di butirrato per la salute del colon', source: 'ISME Journal 2019', relevance: 'high' }
    ]
  },
  'clostridium': {
    referenceRange: { min: 1, max: 5 },
    metabolicFunctions: ['Produzione butirrato', 'Metabolismo aminoacidi'],
    pathways: ['Amino acid fermentation', 'Butyrate production'],
    toxicPotential: { level: 'moderate', substances: ['Ammoniaca', 'H2S', 'p-cresol'], mechanisms: ['Protein fermentation'] },
    geneticCapabilities: ['Amino acid decarboxylases', 'Sulfite reductase'],
    scientificEvidence: [
      { finding: 'Alcuni Clostridium producono metaboliti tossici dalla fermentazione proteica', source: 'Gut Microbes 2020', relevance: 'high' }
    ]
  },
  'enterobacteriaceae': {
    referenceRange: { min: 0.1, max: 2 },
    metabolicFunctions: ['Patogeni opportunisti', 'Pro-infiammatorio'],
    pathways: ['LPS production', 'Inflammatory signaling'],
    toxicPotential: { level: 'high', substances: ['LPS', 'Enterotoxins'], mechanisms: ['Endotoxemia'] },
    geneticCapabilities: ['Pathogenicity islands', 'LPS synthesis'],
    scientificEvidence: [
      { finding: 'Enterobacteriaceae aumentati associati a infiammazione e disbiosi', source: 'Nature Reviews Gastroenterology 2021', relevance: 'high' }
    ]
  },
  'proteobacteria': {
    referenceRange: { min: 1, max: 5 },
    metabolicFunctions: ['Pro-infiammatorio se elevato'],
    pathways: ['LPS production'],
    toxicPotential: { level: 'moderate', substances: ['LPS'], mechanisms: ['Gram-negative endotoxin'] },
    geneticCapabilities: ['Various virulence factors'],
    scientificEvidence: [
      { finding: 'Bloom di Proteobacteria e marker di disbiosi intestinale', source: 'Cell 2017', relevance: 'high' }
    ]
  },
  'ruminococcus': {
    referenceRange: { min: 2, max: 8 },
    metabolicFunctions: ['Degradazione cellulosa', 'Produzione acetato'],
    pathways: ['Cellulose degradation', 'Acetate production'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Cellulosomes', 'Glycoside hydrolases'],
    scientificEvidence: [
      { finding: 'Ruminococcus degrada fibre complesse producendo SCFA', source: 'Nature Microbiology 2020', relevance: 'high' }
    ]
  },
  'eubacterium': {
    referenceRange: { min: 2, max: 8 },
    metabolicFunctions: ['Produzione butirrato', 'Metabolismo bile'],
    pathways: ['Butyrate production', 'Bile acid transformation'],
    toxicPotential: { level: 'none', substances: [], mechanisms: [] },
    geneticCapabilities: ['Bile salt hydrolase', 'Butyrate kinase'],
    scientificEvidence: [
      { finding: 'Eubacterium rectale e un importante produttore di butirrato', source: 'Gut 2019', relevance: 'high' }
    ]
  },
  'desulfovibrio': {
    referenceRange: { min: 0, max: 1 },
    metabolicFunctions: ['Riduzione solfato', 'Produzione H2S'],
    pathways: ['Sulfate reduction'],
    toxicPotential: { level: 'high', substances: ['H2S (idrogeno solforato)'], mechanisms: ['Sulfate-reducing bacteria produce toxic H2S'] },
    geneticCapabilities: ['Dissimilatory sulfite reductase'],
    scientificEvidence: [
      { finding: 'Desulfovibrio produce H2S tossico per la mucosa intestinale', source: 'Gut Microbes 2021', relevance: 'high' }
    ]
  },
  'bilophila': {
    referenceRange: { min: 0, max: 0.5 },
    metabolicFunctions: ['Metabolismo taurina', 'Pro-infiammatorio'],
    pathways: ['Taurine metabolism', 'H2S production'],
    toxicPotential: { level: 'high', substances: ['H2S'], mechanisms: ['Taurine-derived sulfide production'] },
    geneticCapabilities: ['Taurine-pyruvate aminotransferase'],
    scientificEvidence: [
      { finding: 'Bilophila wadsworthia aumenta con diete ricche di grassi saturi', source: 'Nature 2012', relevance: 'high' }
    ]
  }
};

// Nutrition recommendations database
const NUTRITION_DATABASE = {
  foodsToEliminate: [
    { food: 'Zuccheri raffinati', reason: 'Promuovono crescita batteri patogeni e Candida', relatedBacteria: ['Enterobacteriaceae', 'Candida'], duration: '4-6 settimane', priority: 'high' as const },
    { food: 'Alcol', reason: 'Danneggia barriera intestinale e altera microbiota', relatedBacteria: ['Proteobacteria'], duration: 'Permanente o riduzione drastica', priority: 'high' as const },
    { food: 'Carni processate', reason: 'Aumentano batteri produttori di TMAO e H2S', relatedBacteria: ['Bilophila', 'Desulfovibrio'], duration: 'Permanente', priority: 'high' as const },
    { food: 'Dolcificanti artificiali', reason: 'Alterano composizione microbiota', relatedBacteria: ['Bacteroides'], duration: 'Permanente', priority: 'medium' as const }
  ],
  foodsToIntroduce: [
    { food: 'Verdure crucifere (broccoli, cavolo)', benefit: 'Promuovono batteri benefici e producono composti protettivi', targetBacteria: ['Bifidobacterium', 'Lactobacillus'], timing: 'Pranzo e cena', frequency: 'Giornaliero', priority: 'high' as const },
    { food: 'Legumi', benefit: 'Fibre fermentabili per produzione SCFA', targetBacteria: ['Faecalibacterium', 'Roseburia'], timing: 'Pranzo', frequency: '4-5 volte/settimana', priority: 'high' as const },
    { food: 'Alimenti fermentati (kefir, kimchi)', benefit: 'Apporto probiotici naturali', targetBacteria: ['Lactobacillus', 'Bifidobacterium'], timing: 'Colazione o spuntino', frequency: 'Giornaliero', priority: 'high' as const },
    { food: 'Frutti di bosco', benefit: 'Polifenoli che promuovono Akkermansia', targetBacteria: ['Akkermansia'], timing: 'Colazione o spuntino', frequency: 'Giornaliero', priority: 'medium' as const },
    { food: 'Aglio e cipolla', benefit: 'Prebiotici (inulina, FOS)', targetBacteria: ['Bifidobacterium'], timing: 'Con i pasti', frequency: 'Giornaliero', priority: 'medium' as const }
  ],
  supplements: [
    { name: 'L-Glutammina', dose: '5-10g', timing: 'A stomaco vuoto', duration: '8-12 settimane', reason: 'Supporta integrita barriera intestinale', scientificBasis: 'Riduce permeabilita intestinale (PMID: 28893329)', priority: 'essential' as const },
    { name: 'Butirrato (tributirrina)', dose: '300-600mg', timing: 'Con i pasti', duration: '8 settimane', reason: 'Energia per colonociti, anti-infiammatorio', scientificBasis: 'Migliora funzione barriera (PMID: 30768194)', priority: 'recommended' as const },
    { name: 'Zinco carnosina', dose: '75mg', timing: 'Lontano dai pasti', duration: '8 settimane', reason: 'Supporta guarigione mucosa', scientificBasis: 'Protegge mucosa gastrica (PMID: 17260010)', priority: 'recommended' as const },
    { name: 'Omega-3 (EPA/DHA)', dose: '2-3g', timing: 'Con i pasti grassi', duration: 'Continuativo', reason: 'Anti-infiammatorio, supporta microbiota', scientificBasis: 'Modula composizione microbiota (PMID: 28212465)', priority: 'essential' as const }
  ],
  probiotics: [
    { strain: 'Lactobacillus rhamnosus GG', cfu: '10 miliardi CFU', benefit: 'Supporto immunitario, anti-diarrea', timing: 'A stomaco vuoto mattina' },
    { strain: 'Bifidobacterium longum BB536', cfu: '5 miliardi CFU', benefit: 'Anti-infiammatorio, supporto allergie', timing: 'A stomaco vuoto' },
    { strain: 'Saccharomyces boulardii', cfu: '5 miliardi CFU', benefit: 'Protezione da patogeni, supporto antibiotici', timing: 'Lontano da antifungini' },
    { strain: 'Lactobacillus plantarum 299v', cfu: '10 miliardi CFU', benefit: 'Riduce gonfiore, supporta IBS', timing: 'Prima dei pasti' }
  ],
  prebiotics: [
    { type: 'Inulina', source: 'Cicoria, aglio, cipolla', benefit: 'Nutre Bifidobacterium', dose: '5-10g/giorno gradualmente' },
    { type: 'FOS (frutto-oligosaccaridi)', source: 'Banana, asparagi', benefit: 'Promuove SCFA', dose: '5g/giorno' },
    { type: 'GOS (galatto-oligosaccaridi)', source: 'Legumi, supplementi', benefit: 'Supporta Bifidobacterium', dose: '3-5g/giorno' },
    { type: 'Amido resistente', source: 'Patate raffreddate, banana verde', benefit: 'Produzione butirrato', dose: '15-30g/giorno' }
  ]
};

// Local parser function
function parseLocalMicrobiomeData(rawData: string) {
  const lines = rawData.toLowerCase().split(/[\n,;]/);
  const bacteria: any[] = [];
  let totalAbundance = 0;
  
  // Common bacteria patterns to search for
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
  
  for (const line of lines) {
    for (const { pattern, name } of bacteriaPatterns) {
      if (pattern.test(line)) {
        // Extract percentage
        const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%?/);
        const abundance = percentMatch ? parseFloat(percentMatch[1]) : Math.random() * 10 + 1;
        
        // Get database info
        const dbKey = name.toLowerCase().split(' ')[0];
        const dbInfo = BACTERIA_DATABASE[dbKey] || BACTERIA_DATABASE['bacteroides'];
        
        // Determine status
        let status: 'low' | 'normal' | 'high' = 'normal';
        if (abundance < dbInfo.referenceRange.min) status = 'low';
        else if (abundance > dbInfo.referenceRange.max) status = 'high';
        
        // Avoid duplicates
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
  
  // If no bacteria found, add some defaults based on common patterns
  if (bacteria.length === 0) {
    // Try to parse any numbers with names
    const genericPattern = /([a-z]+)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%?/gi;
    let match;
    while ((match = genericPattern.exec(rawData)) !== null) {
      const possibleName = match[1];
      const abundance = parseFloat(match[2]);
      if (abundance > 0 && abundance < 100 && possibleName.length > 3) {
        const dbKey = possibleName.toLowerCase();
        const dbInfo = BACTERIA_DATABASE[dbKey] || BACTERIA_DATABASE['bacteroides'];
        
        let status: 'low' | 'normal' | 'high' = 'normal';
        if (abundance < dbInfo.referenceRange.min) status = 'low';
        else if (abundance > dbInfo.referenceRange.max) status = 'high';
        
        bacteria.push({
          name: possibleName.charAt(0).toUpperCase() + possibleName.slice(1),
          abundance,
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
    }
  }
  
  // Calculate indices
  const firmicutes = bacteria.find(b => b.name.toLowerCase().includes('firmicutes'))?.abundance || 45;
  const bacteroidesVal = bacteria.find(b => b.name.toLowerCase().includes('bacteroides'))?.abundance || 30;
  const fbRatio = bacteroidesVal > 0 ? firmicutes / bacteroidesVal : 1.5;
  
  // Shannon diversity index (simplified)
  const diversityIndex = bacteria.length > 0 
    ? -bacteria.reduce((sum, b) => {
        const p = b.abundance / (totalAbundance || 100);
        return sum + (p > 0 ? p * Math.log(p) : 0);
      }, 0)
    : 2.5;
  
  // Determine overall health
  let overallHealth: 'optimal' | 'good' | 'suboptimal' | 'compromised' = 'good';
  const lowBeneficial = bacteria.filter(b => 
    ['Bifidobacterium', 'Lactobacillus', 'Faecalibacterium prausnitzii', 'Akkermansia muciniphila'].some(n => b.name.includes(n)) && b.status === 'low'
  ).length;
  const highPathogenic = bacteria.filter(b => 
    ['Enterobacteriaceae', 'Proteobacteria', 'Desulfovibrio', 'Bilophila'].some(n => b.name.includes(n)) && b.status === 'high'
  ).length;
  
  if (lowBeneficial === 0 && highPathogenic === 0 && diversityIndex > 3) overallHealth = 'optimal';
  else if (lowBeneficial > 2 || highPathogenic > 1) overallHealth = 'suboptimal';
  else if (lowBeneficial > 3 || highPathogenic > 2) overallHealth = 'compromised';
  
  // Generate findings
  const keyFindings: string[] = [];
  const riskFactors: string[] = [];
  
  if (diversityIndex > 3) keyFindings.push('Buona diversita microbica');
  else if (diversityIndex < 2) riskFactors.push('Bassa diversita microbica - aumentare varieta di fibre');
  
  if (fbRatio > 2) riskFactors.push('Ratio F/B elevato - possibile associazione con dismetabolismo');
  else if (fbRatio < 0.5) riskFactors.push('Ratio F/B basso - monitorare');
  else keyFindings.push('Ratio Firmicutes/Bacteroidetes nel range normale');
  
  bacteria.forEach(b => {
    if (b.status === 'low' && ['Bifidobacterium', 'Lactobacillus', 'Akkermansia'].some(n => b.name.includes(n))) {
      riskFactors.push(`${b.name} basso - considerare probiotici e prebiotici specifici`);
    }
    if (b.status === 'high' && b.toxicPotential.level === 'high') {
      riskFactors.push(`${b.name} elevato - potenziale produzione di metaboliti tossici`);
    }
    if (b.status === 'normal' && ['Faecalibacterium', 'Roseburia', 'Akkermansia'].some(n => b.name.includes(n))) {
      keyFindings.push(`${b.name} nei range ottimali - buona produzione SCFA`);
    }
  });
  
  return {
    bacteria: bacteria.length > 0 ? bacteria : [
      { name: 'Dati insufficienti', abundance: 0, status: 'normal' as const, referenceRange: { min: 0, max: 100 }, metabolicFunctions: [], pathways: [], toxicPotential: { level: 'none', substances: [], mechanisms: [] }, geneticCapabilities: [], scientificEvidence: [] }
    ],
    diversityIndex: Math.round(diversityIndex * 100) / 100,
    firmicutesBacteroidetesRatio: Math.round(fbRatio * 100) / 100,
    overallHealth,
    keyFindings: keyFindings.length > 0 ? keyFindings : ['Analisi completata - verificare i dati inseriti'],
    riskFactors
  };
}

// Local pathway analysis
function analyzePathwaysLocal(bacteriaData: any) {
  const bacteria = bacteriaData.bacteria || [];
  
  // SCFA production based on bacteria present
  const butyrateProducers = bacteria.filter((b: any) => 
    ['Faecalibacterium', 'Roseburia', 'Eubacterium', 'Clostridium'].some(n => b.name.includes(n))
  );
  const propionateProducers = bacteria.filter((b: any) => 
    ['Bacteroides', 'Prevotella', 'Akkermansia'].some(n => b.name.includes(n))
  );
  const acetateProducers = bacteria.filter((b: any) => 
    ['Bifidobacterium', 'Ruminococcus', 'Blautia'].some(n => b.name.includes(n))
  );
  
  const butyrateLevel = butyrateProducers.reduce((sum: number, b: any) => sum + (b.abundance || 0), 0);
  const propionateLevel = propionateProducers.reduce((sum: number, b: any) => sum + (b.abundance || 0), 0);
  const acetateLevel = acetateProducers.reduce((sum: number, b: any) => sum + (b.abundance || 0), 0);
  
  // Toxic metabolites
  const toxicMetabolites: any[] = [];
  const h2sProducers = bacteria.filter((b: any) => 
    ['Desulfovibrio', 'Bilophila'].some(n => b.name.includes(n)) && b.status === 'high'
  );
  if (h2sProducers.length > 0) {
    toxicMetabolites.push({
      name: 'Idrogeno solforato (H2S)',
      producedBy: h2sProducers.map((b: any) => b.name),
      healthRisk: 'Tossico per mucosa intestinale, pro-infiammatorio',
      detoxStrategy: 'Ridurre proteine animali, aumentare zinco e molibdeno'
    });
  }
  
  const ammoniaProducers = bacteria.filter((b: any) => 
    ['Clostridium', 'Proteobacteria'].some(n => b.name.includes(n)) && b.status === 'high'
  );
  if (ammoniaProducers.length > 0) {
    toxicMetabolites.push({
      name: 'Ammoniaca',
      producedBy: ammoniaProducers.map((b: any) => b.name),
      healthRisk: 'Neurotossico, danneggia barriera intestinale',
      detoxStrategy: 'Ridurre proteine in eccesso, aumentare fibre fermentabili'
    });
  }
  
  return {
    scfaProduction: {
      butyrate: { 
        level: Math.min(butyrateLevel * 3, 100), 
        status: butyrateLevel > 10 ? 'Ottimale' : butyrateLevel > 5 ? 'Adeguato' : 'Basso - aumentare fibre'
      },
      propionate: { 
        level: Math.min(propionateLevel * 2, 100), 
        status: propionateLevel > 15 ? 'Ottimale' : propionateLevel > 8 ? 'Adeguato' : 'Basso'
      },
      acetate: { 
        level: Math.min(acetateLevel * 4, 100), 
        status: acetateLevel > 5 ? 'Ottimale' : 'Basso - aumentare prebiotici'
      }
    },
    toxicMetabolites,
    vitaminSynthesis: {
      b12: { capacity: bacteria.some((b: any) => b.name.includes('Lactobacillus')) ? 'Presente' : 'Limitata', recommendation: 'Verificare livelli ematici' },
      k2: { capacity: bacteria.some((b: any) => b.name.includes('Bacteroides')) ? 'Adeguata' : 'Limitata', recommendation: 'Considerare supplementazione se bassa' },
      folate: { capacity: bacteria.some((b: any) => b.name.includes('Bifidobacterium')) ? 'Buona' : 'Limitata', recommendation: 'Aumentare verdure a foglia verde' },
      biotin: { capacity: 'Presente', recommendation: 'Generalmente adeguata' }
    },
    activePathways: [
      {
        name: 'Produzione Butirrato',
        status: butyrateLevel > 10 ? 'active' : butyrateLevel > 5 ? 'normal' : 'reduced',
        bacteriaInvolved: butyrateProducers.map((b: any) => b.name),
        metabolites: ['Butirrato', 'Acetil-CoA'],
        healthImplication: 'Energia per colonociti, anti-infiammatorio, supporto barriera',
        intervention: butyrateLevel < 10 ? 'Aumentare fibre fermentabili (legumi, avena, banana verde)' : 'Mantenere intake attuale di fibre'
      },
      {
        name: 'Degradazione Mucina',
        status: bacteria.some((b: any) => b.name.includes('Akkermansia')) ? 'active' : 'reduced',
        bacteriaInvolved: ['Akkermansia muciniphila'],
        metabolites: ['Propionato', 'Acetato'],
        healthImplication: 'Rinnovamento strato mucoso, supporto barriera',
        intervention: 'Polifenoli (frutti di bosco, te verde) promuovono Akkermansia'
      }
    ]
  };
}

// Local recommendations generator
function generateRecommendationsLocal(bacteriaData: any, pathwayData: any) {
  const bacteria = bacteriaData.bacteria || [];
  
  // Determine which foods to eliminate based on bacteria profile
  const foodsToEliminate = [];
  const highPathogenic = bacteria.filter((b: any) => b.toxicPotential?.level === 'high' && b.status === 'high');
  
  if (highPathogenic.length > 0) {
    foodsToEliminate.push(...NUTRITION_DATABASE.foodsToEliminate.slice(0, 3));
  } else {
    foodsToEliminate.push(NUTRITION_DATABASE.foodsToEliminate[0]); // Always reduce sugar
  }
  
  // Foods to introduce based on deficiencies
  const foodsToIntroduce = [...NUTRITION_DATABASE.foodsToIntroduce];
  
  const lowBifidobacterium = bacteria.find((b: any) => b.name.includes('Bifidobacterium') && b.status === 'low');
  const lowAkkermansia = bacteria.find((b: any) => b.name.includes('Akkermansia') && b.status === 'low');
  
  // Supplements based on analysis
  const supplementsRecommended = [...NUTRITION_DATABASE.supplements];
  
  // Probiotics based on deficiencies
  const probioticsRecommended = [...NUTRITION_DATABASE.probiotics];
  if (lowBifidobacterium) {
    probioticsRecommended.unshift({
      strain: 'Bifidobacterium bifidum',
      cfu: '10 miliardi CFU',
      benefit: 'Ripristino popolazione Bifidobacterium',
      timing: 'A stomaco vuoto mattina'
    });
  }
  
  return {
    foodsToEliminate,
    foodsToIntroduce,
    foodsToModerate: [
      { food: 'Carne rossa', currentIssue: 'Promuove batteri produttori di TMAO', recommendation: 'Max 2 volte/settimana', targetQuantity: '100-150g per porzione' },
      { food: 'Latticini', currentIssue: 'Possibile sensibilita individuale', recommendation: 'Preferire fermentati (kefir, yogurt)', targetQuantity: '1-2 porzioni/giorno' }
    ],
    supplementsRecommended,
    probioticsRecommended,
    prebioticsRecommended: NUTRITION_DATABASE.prebiotics,
    dietaryPatterns: [
      { pattern: 'Dieta Mediterranea', description: 'Alta in fibre, polifenoli, grassi sani', rationale: 'Supporta diversita microbica e batteri benefici' },
      { pattern: 'Time-Restricted Eating', description: 'Finestra alimentare 8-10 ore', rationale: 'Permette riposo intestinale e rigenerazione mucosa' }
    ],
    timingRecommendations: [
      { meal: 'Colazione', recommendation: 'Includere fibre (avena) e probiotici (kefir)', reason: 'Attiva metabolismo microbico mattutino' },
      { meal: 'Pre-allenamento', recommendation: 'Evitare fibre eccessive', reason: 'Ridurre fermentazione durante esercizio' },
      { meal: 'Post-allenamento', recommendation: 'Proteine + carboidrati + polifenoli', reason: 'Recupero muscolare e supporto microbiota' },
      { meal: 'Cena', recommendation: 'Verdure abbondanti, proteine moderate', reason: 'Fibre per fermentazione notturna' }
    ]
  };
}

// Schema for bacteria analysis
const bacteriaAnalysisSchema = z.object({
  bacteria: z.array(z.object({
    name: z.string().describe('Nome del batterio'),
    abundance: z.number().describe('Percentuale di abbondanza'),
    status: z.enum(['low', 'normal', 'high']).describe('Status rispetto ai range normali'),
    referenceRange: z.object({
      min: z.number(),
      max: z.number()
    }),
    metabolicFunctions: z.array(z.string()).describe('Funzioni metaboliche principali'),
    pathways: z.array(z.string()).describe('Pathway metabolici coinvolti'),
    toxicPotential: z.object({
      level: z.enum(['none', 'low', 'moderate', 'high']),
      substances: z.array(z.string()).describe('Sostanze tossiche potenzialmente prodotte'),
      mechanisms: z.array(z.string())
    }),
    geneticCapabilities: z.array(z.string()).describe('Capacita genetiche del batterio'),
    scientificEvidence: z.array(z.object({
      finding: z.string(),
      source: z.string(),
      relevance: z.enum(['high', 'medium', 'low'])
    })).describe('Evidenze scientifiche rilevanti')
  })),
  diversityIndex: z.number().describe('Indice di diversita Shannon'),
  firmicutesBacteroidetesRatio: z.number(),
  overallHealth: z.enum(['optimal', 'good', 'suboptimal', 'compromised']),
  keyFindings: z.array(z.string()),
  riskFactors: z.array(z.string())
});

// Schema for nutrition recommendations
const nutritionRecommendationsSchema = z.object({
  foodsToEliminate: z.array(z.object({
    food: z.string(),
    reason: z.string(),
    relatedBacteria: z.array(z.string()),
    duration: z.string().describe('Per quanto tempo eliminare'),
    priority: z.enum(['high', 'medium', 'low'])
  })),
  foodsToIntroduce: z.array(z.object({
    food: z.string(),
    benefit: z.string(),
    targetBacteria: z.array(z.string()),
    timing: z.string().describe('Quando assumere'),
    frequency: z.string(),
    priority: z.enum(['high', 'medium', 'low'])
  })),
  foodsToModerate: z.array(z.object({
    food: z.string(),
    currentIssue: z.string(),
    recommendation: z.string(),
    targetQuantity: z.string()
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
    cfu: z.string().describe('Colony forming units'),
    benefit: z.string(),
    timing: z.string()
  })),
  prebioticsRecommended: z.array(z.object({
    type: z.string(),
    source: z.string(),
    benefit: z.string(),
    dose: z.string()
  })),
  dietaryPatterns: z.array(z.object({
    pattern: z.string(),
    description: z.string(),
    rationale: z.string()
  })),
  timingRecommendations: z.array(z.object({
    meal: z.string(),
    recommendation: z.string(),
    reason: z.string()
  }))
});

// Schema for pathway analysis
const pathwayAnalysisSchema = z.object({
  activePathways: z.array(z.object({
    name: z.string(),
    status: z.enum(['hyperactive', 'active', 'normal', 'reduced', 'inactive']),
    bacteriaInvolved: z.array(z.string()),
    metabolites: z.array(z.string()),
    healthImplication: z.string(),
    intervention: z.string()
  })),
  scfaProduction: z.object({
    butyrate: z.object({ level: z.number(), status: z.string() }),
    propionate: z.object({ level: z.number(), status: z.string() }),
    acetate: z.object({ level: z.number(), status: z.string() }),
    overall: z.string()
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
  })
});

export async function POST(req: Request) {
  try {
    const { rawData, analysisType, currentNutrition } = await req.json();
    
    console.log('[Microbiome API] Received request:', { analysisType, dataLength: rawData?.length });

    // Use local parser if AI Gateway is not available
    if (!USE_AI_GATEWAY) {
      console.log('[Microbiome API] Using local parser (AI Gateway disabled)');
      
      if (analysisType === 'parse') {
        const localResult = parseLocalMicrobiomeData(rawData);
        return Response.json({ 
          success: true, 
          type: 'bacteria_analysis',
          data: localResult,
          source: 'local_parser'
        });
      }
      
      if (analysisType === 'pathways') {
        const bacteriaData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const pathwayResult = analyzePathwaysLocal(bacteriaData);
        return Response.json({ 
          success: true, 
          type: 'pathway_analysis',
          data: pathwayResult,
          source: 'local_parser'
        });
      }
      
      if (analysisType === 'recommendations') {
        const inputData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const recommendations = generateRecommendationsLocal(inputData.bacteria || inputData, inputData.pathways);
        return Response.json({ 
          success: true, 
          type: 'recommendations',
          data: recommendations,
          source: 'local_parser'
        });
      }
    }

    // AI Gateway path (requires credit card)
    if (analysisType === 'parse') {
      // Parse raw microbiome data and analyze bacteria
      const { object: bacteriaAnalysis } = await generateObject({
        model: 'anthropic/claude-sonnet-4-20250514',
        schema: bacteriaAnalysisSchema,
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di microbiologia e genomica del microbiota intestinale. Analizza i dati del test del microbioma forniti e:
1. Identifica tutti i batteri presenti con le loro abbondanze
2. Valuta lo stato di ogni batterio rispetto ai range di riferimento scientifici
3. Identifica le capacita genetiche di ogni batterio (geni per produzione SCFA, degradazione di fibre, produzione di vitamine, etc)
4. Identifica i pathway metabolici attivi
5. Valuta il potenziale di produzione di sostanze tossiche (H2S, TMA, TMAO, ammoniaca, etc)
6. Cerca evidenze scientifiche recenti su Nature, Cell, Gut, e altri journal di alto impatto
7. Calcola l'indice di diversita Shannon e il ratio Firmicutes/Bacteroidetes
8. Identifica fattori di rischio basati sul profilo batterico

Sii preciso e basa le tue analisi su evidenze scientifiche recenti.`
          },
          {
            role: 'user',
            content: `Analizza questi dati del test del microbioma:\n\n${rawData}`
          }
        ],
        maxOutputTokens: 8000,
        temperature: 0.3
      });

      return Response.json({ 
        success: true, 
        type: 'bacteria_analysis',
        data: bacteriaAnalysis 
      });
    }

    if (analysisType === 'pathways') {
      // Analyze metabolic pathways
      const { object: pathwayAnalysis } = await generateObject({
        model: 'anthropic/claude-sonnet-4-20250514',
        schema: pathwayAnalysisSchema,
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di metabolomica e pathway analysis del microbiota. Analizza i batteri identificati e:
1. Identifica tutti i pathway metabolici attivi
2. Valuta la produzione di SCFA (butirrato, propionato, acetato)
3. Identifica metaboliti tossici potenzialmente prodotti
4. Valuta la capacita di sintesi vitaminica
5. Suggerisci interventi per ottimizzare i pathway`
          },
          {
            role: 'user',
            content: `Analizza i pathway metabolici basandoti su questi batteri:\n\n${rawData}`
          }
        ],
        maxOutputTokens: 6000,
        temperature: 0.3
      });

      return Response.json({ 
        success: true, 
        type: 'pathway_analysis',
        data: pathwayAnalysis 
      });
    }

    if (analysisType === 'recommendations') {
      // Generate nutrition recommendations
      const { object: recommendations } = await generateObject({
        model: 'anthropic/claude-sonnet-4-20250514',
        schema: nutritionRecommendationsSchema,
        messages: [
          {
            role: 'system',
            content: `Sei un esperto nutrizionista funzionale specializzato in modulazione del microbiota per atleti. 
Basandoti sull'analisi del microbioma e sulla dieta attuale dell'atleta:

1. ALIMENTI DA ELIMINARE: Identifica alimenti che potrebbero nutrire batteri patogeni, aumentare infiammazione, o produrre metaboliti tossici
2. ALIMENTI DA INTRODURRE: Suggerisci alimenti che promuovono batteri benefici, producono SCFA, migliorano la barriera intestinale
3. ALIMENTI DA MODERARE: Identifica alimenti che non vanno eliminati ma ridotti
4. SUPPLEMENTI: Raccomanda supplementi con evidenza scientifica per migliorare il profilo microbiotico
5. PROBIOTICI: Suggerisci ceppi specifici con CFU e timing
6. PREBIOTICI: Identifica fibre e composti prebiotici utili
7. PATTERN DIETETICI: Suggerisci modifiche allo stile alimentare
8. TIMING: Ottimizza quando consumare certi alimenti per massimo beneficio

Considera che e un atleta, quindi le raccomandazioni devono supportare anche la performance sportiva.
Basa tutto su evidenze scientifiche recenti.`
          },
          {
            role: 'user',
            content: `Analisi microbioma:\n${rawData}\n\nDieta attuale dell'atleta:\n${currentNutrition || 'Non specificata'}`
          }
        ],
        maxOutputTokens: 8000,
        temperature: 0.4
      });

      return Response.json({ 
        success: true, 
        type: 'recommendations',
        data: recommendations 
      });
    }

    return Response.json({ error: 'Invalid analysis type' }, { status: 400 });

  } catch (error) {
    console.error('Microbiome analysis error:', error);
    return Response.json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
