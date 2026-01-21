/**
 * EMPATHY Microbiome Database
 * Database di interazioni batteriche, pathway metabolici
 * e interferenze alimentari per personalizzazione nutrizionale
 * @module microbiome-database
 */

// ==================== BATTERI PRINCIPALI ====================
export interface BacteriaProfile {
  id: string
  name: string
  phylum: string
  genus: string
  species?: string
  // Funzioni metaboliche
  functions: string[]
  // Substrati preferiti (cosa mangiano)
  preferred_substrates: string[]
  // Metaboliti prodotti
  metabolites_produced: string[]
  // Effetti sulla salute
  health_effects: {
    positive: string[]
    negative: string[]
  }
  // Range ottimale (% del microbioma)
  optimal_range: { min: number; max: number }
  // Alimenti che promuovono la crescita
  promoting_foods: string[]
  // Alimenti che inibiscono
  inhibiting_foods: string[]
}

export const BACTERIA_DATABASE: BacteriaProfile[] = [
  // FIRMICUTES
  {
    id: 'lactobacillus',
    name: 'Lactobacillus',
    phylum: 'Firmicutes',
    genus: 'Lactobacillus',
    functions: ['fermentazione lattica', 'produzione acido lattico', 'immunomodulazione'],
    preferred_substrates: ['lattosio', 'glucosio', 'fruttosio', 'fibre solubili'],
    metabolites_produced: ['acido lattico', 'batteriocine', 'vitamine B'],
    health_effects: {
      positive: ['digestione lattosio', 'barriera intestinale', 'immunità', 'riduzione infiammazione'],
      negative: []
    },
    optimal_range: { min: 1, max: 10 },
    promoting_foods: ['yogurt', 'kefir', 'kimchi', 'crauti', 'miso', 'tempeh', 'fibre prebiotiche'],
    inhibiting_foods: ['antibiotici', 'alcol eccessivo', 'zuccheri raffinati in eccesso']
  },
  {
    id: 'faecalibacterium',
    name: 'Faecalibacterium prausnitzii',
    phylum: 'Firmicutes',
    genus: 'Faecalibacterium',
    species: 'prausnitzii',
    functions: ['produzione butirrato', 'anti-infiammatorio', 'salute colon'],
    preferred_substrates: ['fibre', 'amido resistente', 'inulina', 'FOS'],
    metabolites_produced: ['butirrato', 'acidi grassi a catena corta'],
    health_effects: {
      positive: ['riduzione infiammazione', 'protezione colon', 'regolazione glicemia', 'recupero sportivo'],
      negative: []
    },
    optimal_range: { min: 5, max: 15 },
    promoting_foods: ['avena', 'orzo', 'legumi', 'banana verde', 'patate fredde', 'riso freddo', 'aglio', 'cipolla'],
    inhibiting_foods: ['dieta povera di fibre', 'grassi saturi eccessivi', 'antibiotici']
  },
  {
    id: 'roseburia',
    name: 'Roseburia',
    phylum: 'Firmicutes',
    genus: 'Roseburia',
    functions: ['produzione butirrato', 'fermentazione fibre'],
    preferred_substrates: ['fibre insolubili', 'amido resistente', 'xilano'],
    metabolites_produced: ['butirrato', 'acetato'],
    health_effects: {
      positive: ['salute intestinale', 'metabolismo glucosio', 'protezione da obesità'],
      negative: []
    },
    optimal_range: { min: 3, max: 12 },
    promoting_foods: ['cereali integrali', 'verdure fibrose', 'legumi', 'frutta con buccia'],
    inhibiting_foods: ['dieta low-carb estrema', 'grassi saturi']
  },
  {
    id: 'clostridium',
    name: 'Clostridium (cluster XIVa)',
    phylum: 'Firmicutes',
    genus: 'Clostridium',
    functions: ['produzione butirrato', 'metabolismo bile'],
    preferred_substrates: ['fibre', 'proteine', 'aminoacidi'],
    metabolites_produced: ['butirrato', 'acetato', 'propionato'],
    health_effects: {
      positive: ['digestione', 'immunità'],
      negative: ['alcuni ceppi patogeni', 'produzione tossine (ceppi specifici)']
    },
    optimal_range: { min: 5, max: 20 },
    promoting_foods: ['fibre miste', 'proteine moderate'],
    inhibiting_foods: ['eccesso proteine', 'carenza fibre']
  },
  {
    id: 'ruminococcus',
    name: 'Ruminococcus',
    phylum: 'Firmicutes',
    genus: 'Ruminococcus',
    functions: ['degradazione cellulosa', 'produzione SCFA'],
    preferred_substrates: ['cellulosa', 'amido resistente', 'fibre complesse'],
    metabolites_produced: ['acetato', 'formiato', 'etanolo'],
    health_effects: {
      positive: ['digestione fibre', 'energia da fibre'],
      negative: ['alcuni ceppi associati a infiammazione']
    },
    optimal_range: { min: 2, max: 10 },
    promoting_foods: ['verdure crude', 'cereali integrali', 'legumi'],
    inhibiting_foods: ['dieta povera di fibre vegetali']
  },

  // BACTEROIDETES
  {
    id: 'bacteroides',
    name: 'Bacteroides',
    phylum: 'Bacteroidetes',
    genus: 'Bacteroides',
    functions: ['degradazione polisaccaridi', 'metabolismo proteine', 'produzione propionato'],
    preferred_substrates: ['polisaccaridi complessi', 'proteine', 'grassi'],
    metabolites_produced: ['propionato', 'acetato', 'succinato'],
    health_effects: {
      positive: ['digestione carboidrati complessi', 'regolazione peso'],
      negative: ['eccesso associato a diete occidentali']
    },
    optimal_range: { min: 10, max: 30 },
    promoting_foods: ['fibre vegetali', 'polisaccaridi', 'proteine vegetali'],
    inhibiting_foods: ['dieta ricca di grassi saturi', 'zuccheri semplici']
  },
  {
    id: 'prevotella',
    name: 'Prevotella',
    phylum: 'Bacteroidetes',
    genus: 'Prevotella',
    functions: ['degradazione fibre vegetali', 'metabolismo carboidrati'],
    preferred_substrates: ['fibre vegetali', 'carboidrati complessi', 'xilano'],
    metabolites_produced: ['propionato', 'succinato'],
    health_effects: {
      positive: ['digestione fibre', 'tipico di diete plant-based', 'metabolismo glucosio'],
      negative: ['associato a infiammazione in alcuni contesti']
    },
    optimal_range: { min: 5, max: 25 },
    promoting_foods: ['cereali integrali', 'legumi', 'frutta', 'verdure'],
    inhibiting_foods: ['dieta ricca di proteine animali', 'grassi saturi']
  },

  // ACTINOBACTERIA
  {
    id: 'bifidobacterium',
    name: 'Bifidobacterium',
    phylum: 'Actinobacteria',
    genus: 'Bifidobacterium',
    functions: ['fermentazione saccaridi', 'produzione vitamine', 'immunomodulazione'],
    preferred_substrates: ['oligosaccaridi', 'lattosio', 'inulina', 'FOS', 'GOS'],
    metabolites_produced: ['acetato', 'lattato', 'vitamine B', 'folato'],
    health_effects: {
      positive: ['immunità', 'barriera intestinale', 'riduzione patogeni', 'sintesi vitamine'],
      negative: []
    },
    optimal_range: { min: 3, max: 15 },
    promoting_foods: ['yogurt', 'kefir', 'banane', 'aglio', 'cipolla', 'asparagi', 'miele', 'avena'],
    inhibiting_foods: ['antibiotici', 'stress', 'alcol']
  },

  // PROTEOBACTERIA
  {
    id: 'escherichia',
    name: 'Escherichia coli',
    phylum: 'Proteobacteria',
    genus: 'Escherichia',
    species: 'coli',
    functions: ['produzione vitamina K', 'metabolismo aminoacidi'],
    preferred_substrates: ['glucosio', 'aminoacidi', 'lattosio'],
    metabolites_produced: ['vitamina K', 'vitamina B12', 'gas'],
    health_effects: {
      positive: ['produzione vitamine (ceppi commensali)'],
      negative: ['eccesso indica disbiosi', 'alcuni ceppi patogeni']
    },
    optimal_range: { min: 0.1, max: 2 },
    promoting_foods: [],
    inhibiting_foods: ['probiotici', 'fibre prebiotiche', 'polifenoli']
  },

  // VERRUCOMICROBIA
  {
    id: 'akkermansia',
    name: 'Akkermansia muciniphila',
    phylum: 'Verrucomicrobia',
    genus: 'Akkermansia',
    species: 'muciniphila',
    functions: ['degradazione mucina', 'rinforzo barriera', 'regolazione metabolica'],
    preferred_substrates: ['mucina intestinale', 'polifenoli'],
    metabolites_produced: ['acetato', 'propionato', 'peptidi bioattivi'],
    health_effects: {
      positive: ['salute barriera intestinale', 'controllo peso', 'sensibilità insulinica', 'anti-infiammatorio'],
      negative: []
    },
    optimal_range: { min: 1, max: 5 },
    promoting_foods: ['mirtilli', 'uva', 'melograno', 'tè verde', 'olio di pesce', 'polifenoli', 'digiuno intermittente'],
    inhibiting_foods: ['dieta povera di polifenoli', 'eccesso calorie']
  }
]

// ==================== PATHWAY METABOLICI ====================
export interface MetabolicPathway {
  id: string
  name: string
  description: string
  // Batteri coinvolti
  bacteria_involved: string[]
  // Substrati necessari
  substrates: string[]
  // Prodotti finali
  products: string[]
  // Impatto su performance atletica
  athletic_impact: {
    benefit: string
    mechanism: string
  }
  // Alimenti che attivano il pathway
  activating_foods: string[]
  // Alimenti che inibiscono
  inhibiting_foods: string[]
}

export const METABOLIC_PATHWAYS: MetabolicPathway[] = [
  {
    id: 'butyrate_production',
    name: 'Produzione di Butirrato',
    description: 'Fermentazione di fibre che produce butirrato, principale fonte energetica per colonociti',
    bacteria_involved: ['faecalibacterium', 'roseburia', 'clostridium', 'eubacterium'],
    substrates: ['amido resistente', 'inulina', 'FOS', 'fibre insolubili', 'pectina'],
    products: ['butirrato', 'acetato'],
    athletic_impact: {
      benefit: 'Recupero muscolare, riduzione infiammazione, energia sostenuta',
      mechanism: 'Il butirrato riduce citochine pro-infiammatorie, migliora integrità intestinale'
    },
    activating_foods: ['avena', 'orzo', 'legumi', 'banana verde', 'patate fredde', 'riso freddo', 'aglio', 'cipolla', 'asparagi'],
    inhibiting_foods: ['dieta low-carb estrema', 'carenza fibre', 'eccesso proteine']
  },
  {
    id: 'propionate_production',
    name: 'Produzione di Propionato',
    description: 'Fermentazione che produce propionato, regolatore del metabolismo glucidico',
    bacteria_involved: ['bacteroides', 'prevotella', 'akkermansia'],
    substrates: ['pectina', 'arabinoxilani', 'mucina'],
    products: ['propionato', 'succinato'],
    athletic_impact: {
      benefit: 'Regolazione glicemia, sazietà, controllo peso',
      mechanism: 'Il propionato regola gluconeogenesi epatica e segnali di sazietà'
    },
    activating_foods: ['mele', 'pere', 'agrumi', 'carote', 'barbabietole', 'cereali integrali'],
    inhibiting_foods: ['zuccheri semplici', 'alimenti ultra-processati']
  },
  {
    id: 'lactate_fermentation',
    name: 'Fermentazione Lattica',
    description: 'Produzione di acido lattico da zuccheri semplici',
    bacteria_involved: ['lactobacillus', 'bifidobacterium', 'streptococcus'],
    substrates: ['lattosio', 'glucosio', 'fruttosio'],
    products: ['acido lattico', 'acetato', 'CO2'],
    athletic_impact: {
      benefit: 'Digestione lattosio, pH intestinale ottimale, immunità',
      mechanism: 'Acidificazione intestino previene patogeni, migliora assorbimento minerali'
    },
    activating_foods: ['yogurt', 'kefir', 'kimchi', 'crauti', 'miso', 'tempeh'],
    inhibiting_foods: ['antibiotici', 'conservanti']
  },
  {
    id: 'tma_tmao',
    name: 'Pathway TMA/TMAO',
    description: 'Conversione di colina/carnitina in TMA, poi ossidato a TMAO nel fegato',
    bacteria_involved: ['clostridium', 'escherichia', 'proteus'],
    substrates: ['colina', 'carnitina', 'betaina'],
    products: ['TMA', 'TMAO'],
    athletic_impact: {
      benefit: 'NEGATIVO - TMAO elevato associato a rischio cardiovascolare',
      mechanism: 'TMAO promuove aterosclerosi, riduce utilizzo carnitina'
    },
    activating_foods: ['carne rossa', 'uova (alte dosi)', 'latticini grassi', 'pesce (moderato)'],
    inhibiting_foods: ['fibre', 'polifenoli', 'aglio', 'olio oliva', 'resveratrolo']
  },
  {
    id: 'polyphenol_metabolism',
    name: 'Metabolismo Polifenoli',
    description: 'Trasformazione di polifenoli in metaboliti bioattivi',
    bacteria_involved: ['bifidobacterium', 'lactobacillus', 'akkermansia', 'bacteroides'],
    substrates: ['flavonoidi', 'antociani', 'acido ellagico', 'resveratrolo'],
    products: ['urolitine', 'equolo', 'metaboliti bioattivi'],
    athletic_impact: {
      benefit: 'Anti-infiammatorio, antiossidante, recupero, performance',
      mechanism: 'Urolitine migliorano funzione mitocondriale e autofagia'
    },
    activating_foods: ['melograno', 'frutti di bosco', 'noci', 'tè verde', 'cacao', 'vino rosso (moderato)', 'olio oliva'],
    inhibiting_foods: ['carenza di varietà vegetale']
  },
  {
    id: 'bile_acid_metabolism',
    name: 'Metabolismo Acidi Biliari',
    description: 'Deconiugazione e trasformazione degli acidi biliari',
    bacteria_involved: ['clostridium', 'bacteroides', 'bifidobacterium', 'lactobacillus'],
    substrates: ['acidi biliari primari'],
    products: ['acidi biliari secondari', 'DCA', 'LCA'],
    athletic_impact: {
      benefit: 'Regolazione metabolismo lipidico, segnaling FXR/TGR5',
      mechanism: 'Acidi biliari regolano metabolismo energetico e glucidico via recettori nucleari'
    },
    activating_foods: ['fibre solubili', 'probiotici'],
    inhibiting_foods: ['grassi saturi eccessivi', 'dieta povera di fibre']
  },
  {
    id: 'tryptophan_metabolism',
    name: 'Metabolismo Triptofano',
    description: 'Conversione di triptofano in serotonina, melatonina e indoli',
    bacteria_involved: ['lactobacillus', 'bifidobacterium', 'clostridium'],
    substrates: ['triptofano'],
    products: ['serotonina', 'melatonina', 'indolo', 'indolo-3-propionato'],
    athletic_impact: {
      benefit: 'Umore, sonno, recupero, funzione cerebrale',
      mechanism: '95% serotonina prodotta in intestino, regola motilità e umore'
    },
    activating_foods: ['tacchino', 'pollo', 'uova', 'semi zucca', 'noci', 'banane', 'cacao'],
    inhibiting_foods: ['carenza proteica', 'disbiosi']
  }
]

// ==================== INTERFERENZE ALIMENTARI ====================
export interface FoodMicrobiomeInteraction {
  food_id: string
  food_name: string
  // Effetti su batteri specifici
  bacteria_effects: {
    bacteria_id: string
    effect: 'promotes' | 'inhibits' | 'neutral'
    magnitude: 'low' | 'medium' | 'high'
    mechanism: string
  }[]
  // Pathway influenzati
  pathway_effects: {
    pathway_id: string
    effect: 'activates' | 'inhibits'
    notes: string
  }[]
  // Timing ottimale
  optimal_timing: ('morning' | 'pre_workout' | 'post_workout' | 'evening')[]
  // Note per atleti
  athlete_notes: string
}

export const FOOD_MICROBIOME_INTERACTIONS: FoodMicrobiomeInteraction[] = [
  {
    food_id: 'oats',
    food_name: 'Avena',
    bacteria_effects: [
      { bacteria_id: 'faecalibacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Beta-glucani fermentati a butirrato' },
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'medium', mechanism: 'Fibre prebiotiche' },
      { bacteria_id: 'roseburia', effect: 'promotes', magnitude: 'high', mechanism: 'Amido resistente' }
    ],
    pathway_effects: [
      { pathway_id: 'butyrate_production', effect: 'activates', notes: 'Eccellente fonte di substrati' }
    ],
    optimal_timing: ['morning', 'pre_workout'],
    athlete_notes: 'Ideale 2-3h prima di allenamento. Ricco di beta-glucani per energia sostenuta e salute intestinale.'
  },
  {
    food_id: 'banana_green',
    food_name: 'Banana verde/acerba',
    bacteria_effects: [
      { bacteria_id: 'faecalibacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Alto contenuto amido resistente' },
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Prebiotico naturale' }
    ],
    pathway_effects: [
      { pathway_id: 'butyrate_production', effect: 'activates', notes: 'Amido resistente tipo 2' }
    ],
    optimal_timing: ['morning', 'post_workout'],
    athlete_notes: 'Più verde = più amido resistente = più prebiotico. Meno dolce ma migliore per microbioma.'
  },
  {
    food_id: 'garlic',
    food_name: 'Aglio',
    bacteria_effects: [
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Inulina e FOS' },
      { bacteria_id: 'lactobacillus', effect: 'promotes', magnitude: 'medium', mechanism: 'Composti solforati' },
      { bacteria_id: 'escherichia', effect: 'inhibits', magnitude: 'medium', mechanism: 'Allicina antimicrobica' }
    ],
    pathway_effects: [
      { pathway_id: 'butyrate_production', effect: 'activates', notes: 'Via aumento bifidobatteri' },
      { pathway_id: 'tma_tmao', effect: 'inhibits', notes: 'Composti solforati inibiscono TMA liasi' }
    ],
    optimal_timing: ['morning', 'evening'],
    athlete_notes: 'Potente prebiotico. Consumare crudo per massimo beneficio. Evitare pre-gara (digestione).'
  },
  {
    food_id: 'blueberries',
    food_name: 'Mirtilli',
    bacteria_effects: [
      { bacteria_id: 'akkermansia', effect: 'promotes', magnitude: 'high', mechanism: 'Polifenoli stimolano crescita' },
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'medium', mechanism: 'Fibre e polifenoli' }
    ],
    pathway_effects: [
      { pathway_id: 'polyphenol_metabolism', effect: 'activates', notes: 'Ricchi di antociani' }
    ],
    optimal_timing: ['morning', 'post_workout'],
    athlete_notes: 'Superstar per microbioma e performance. Anti-infiammatori, migliorano funzione vascolare.'
  },
  {
    food_id: 'pomegranate',
    food_name: 'Melograno',
    bacteria_effects: [
      { bacteria_id: 'akkermansia', effect: 'promotes', magnitude: 'high', mechanism: 'Acido ellagico convertito in urolitine' }
    ],
    pathway_effects: [
      { pathway_id: 'polyphenol_metabolism', effect: 'activates', notes: 'Precursore urolitine per funzione mitocondriale' }
    ],
    optimal_timing: ['morning', 'post_workout'],
    athlete_notes: 'Le urolitine migliorano funzione mitocondriale. Ottimo per recupero e performance endurance.'
  },
  {
    food_id: 'kefir',
    food_name: 'Kefir',
    bacteria_effects: [
      { bacteria_id: 'lactobacillus', effect: 'promotes', magnitude: 'high', mechanism: 'Apporto diretto di lattobacilli' },
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Apporto diretto' }
    ],
    pathway_effects: [
      { pathway_id: 'lactate_fermentation', effect: 'activates', notes: 'Probiotico naturale' }
    ],
    optimal_timing: ['morning', 'post_workout'],
    athlete_notes: 'Probiotico naturale potente. Meglio di yogurt per diversità ceppi. Post-workout per recupero.'
  },
  {
    food_id: 'red_meat',
    food_name: 'Carne rossa',
    bacteria_effects: [
      { bacteria_id: 'bacteroides', effect: 'promotes', magnitude: 'medium', mechanism: 'Proteine e grassi' },
      { bacteria_id: 'clostridium', effect: 'promotes', magnitude: 'medium', mechanism: 'Aminoacidi' },
      { bacteria_id: 'prevotella', effect: 'inhibits', magnitude: 'medium', mechanism: 'Riduce con diete carnivore' }
    ],
    pathway_effects: [
      { pathway_id: 'tma_tmao', effect: 'activates', notes: 'Carnitina convertita a TMA' }
    ],
    optimal_timing: ['post_workout', 'evening'],
    athlete_notes: 'Limitare a 2-3 porzioni/settimana. Bilanciare sempre con abbondanti verdure per fibre.'
  },
  {
    food_id: 'olive_oil',
    food_name: 'Olio extravergine oliva',
    bacteria_effects: [
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'medium', mechanism: 'Polifenoli' },
      { bacteria_id: 'akkermansia', effect: 'promotes', magnitude: 'medium', mechanism: 'Polifenoli e acido oleico' }
    ],
    pathway_effects: [
      { pathway_id: 'polyphenol_metabolism', effect: 'activates', notes: 'Ricco di polifenoli' },
      { pathway_id: 'tma_tmao', effect: 'inhibits', notes: 'Polifenoli riducono produzione TMA' }
    ],
    optimal_timing: ['morning', 'evening'],
    athlete_notes: 'Usare a crudo per preservare polifenoli. 2-3 cucchiai/giorno per benefici microbioma.'
  },
  {
    food_id: 'legumes',
    food_name: 'Legumi',
    bacteria_effects: [
      { bacteria_id: 'faecalibacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Amido resistente e fibre' },
      { bacteria_id: 'roseburia', effect: 'promotes', magnitude: 'high', mechanism: 'Fibre complesse' },
      { bacteria_id: 'prevotella', effect: 'promotes', magnitude: 'high', mechanism: 'Carboidrati complessi' }
    ],
    pathway_effects: [
      { pathway_id: 'butyrate_production', effect: 'activates', notes: 'Tra le migliori fonti' }
    ],
    optimal_timing: ['morning', 'evening'],
    athlete_notes: 'Iniziare gradualmente se non abituati. Ammollo riduce gas. Eccellenti per microbioma a lungo termine.'
  },
  {
    food_id: 'cold_potato',
    food_name: 'Patate fredde (cotte e raffreddate)',
    bacteria_effects: [
      { bacteria_id: 'faecalibacterium', effect: 'promotes', magnitude: 'high', mechanism: 'Amido retrogradato = resistente' },
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'medium', mechanism: 'Prebiotico' }
    ],
    pathway_effects: [
      { pathway_id: 'butyrate_production', effect: 'activates', notes: 'Amido resistente tipo 3' }
    ],
    optimal_timing: ['morning', 'post_workout'],
    athlete_notes: 'Trucco: cuoci, raffredda in frigo, mangia fredde o riscalda leggermente. Amido diventa resistente.'
  },
  {
    food_id: 'fermented_foods',
    food_name: 'Alimenti fermentati (kimchi, crauti, miso)',
    bacteria_effects: [
      { bacteria_id: 'lactobacillus', effect: 'promotes', magnitude: 'high', mechanism: 'Apporto diretto massivo' },
      { bacteria_id: 'bifidobacterium', effect: 'promotes', magnitude: 'medium', mechanism: 'Effetto sinergico' }
    ],
    pathway_effects: [
      { pathway_id: 'lactate_fermentation', effect: 'activates', notes: 'Probiotici naturali' }
    ],
    optimal_timing: ['morning', 'evening'],
    athlete_notes: 'Consumare crudi, non pastorizzati. Iniziare con piccole quantità. Diversificare tipologie.'
  }
]

// ==================== HELPER FUNCTIONS ====================

/**
 * Ottiene raccomandazioni alimentari basate su profilo microbioma
 */
export function getMicrobiomeRecommendations(
  bacteriaLevels: Record<string, number>, // id: percentage
  athleteGoals: ('recovery' | 'endurance' | 'strength' | 'weight_loss' | 'gut_health')[]
): {
  foods_to_increase: { food: string; reason: string; priority: 'high' | 'medium' | 'low' }[]
  foods_to_reduce: { food: string; reason: string; priority: 'high' | 'medium' | 'low' }[]
  pathways_to_support: { pathway: string; foods: string[] }[]
} {
  const recommendations = {
    foods_to_increase: [] as { food: string; reason: string; priority: 'high' | 'medium' | 'low' }[],
    foods_to_reduce: [] as { food: string; reason: string; priority: 'high' | 'medium' | 'low' }[],
    pathways_to_support: [] as { pathway: string; foods: string[] }[]
  }

  // Analizza ogni batterio
  for (const bacteria of BACTERIA_DATABASE) {
    const level = bacteriaLevels[bacteria.id] || 0
    const { min, max } = bacteria.optimal_range

    if (level < min) {
      // Batterio troppo basso - aumentare cibi che lo promuovono
      bacteria.promoting_foods.forEach(food => {
        if (!recommendations.foods_to_increase.find(f => f.food === food)) {
          recommendations.foods_to_increase.push({
            food,
            reason: `Aumenta ${bacteria.name} (attuale: ${level.toFixed(1)}%, target: ${min}-${max}%)`,
            priority: level < min * 0.5 ? 'high' : 'medium'
          })
        }
      })
    } else if (level > max) {
      // Batterio troppo alto - ridurre cibi che lo promuovono
      bacteria.promoting_foods.forEach(food => {
        if (!recommendations.foods_to_reduce.find(f => f.food === food)) {
          recommendations.foods_to_reduce.push({
            food,
            reason: `Riduce ${bacteria.name} (attuale: ${level.toFixed(1)}%, target: ${min}-${max}%)`,
            priority: level > max * 1.5 ? 'high' : 'low'
          })
        }
      })
    }
  }

  // Pathway da supportare in base a obiettivi
  if (athleteGoals.includes('recovery') || athleteGoals.includes('endurance')) {
    const butyratePathway = METABOLIC_PATHWAYS.find(p => p.id === 'butyrate_production')
    if (butyratePathway) {
      recommendations.pathways_to_support.push({
        pathway: 'Produzione Butirrato',
        foods: butyratePathway.activating_foods.slice(0, 5)
      })
    }
  }

  if (athleteGoals.includes('gut_health')) {
    const polyphenolPathway = METABOLIC_PATHWAYS.find(p => p.id === 'polyphenol_metabolism')
    if (polyphenolPathway) {
      recommendations.pathways_to_support.push({
        pathway: 'Metabolismo Polifenoli',
        foods: polyphenolPathway.activating_foods.slice(0, 5)
      })
    }
  }

  return recommendations
}

/**
 * Verifica compatibilità di un alimento con profilo microbioma
 */
export function checkFoodMicrobiomeCompatibility(
  foodId: string,
  bacteriaLevels: Record<string, number>
): {
  compatible: boolean
  concerns: string[]
  benefits: string[]
} {
  const interaction = FOOD_MICROBIOME_INTERACTIONS.find(f => f.food_id === foodId)
  if (!interaction) {
    return { compatible: true, concerns: [], benefits: [] }
  }

  const concerns: string[] = []
  const benefits: string[] = []

  for (const effect of interaction.bacteria_effects) {
    const bacteria = BACTERIA_DATABASE.find(b => b.id === effect.bacteria_id)
    if (!bacteria) continue

    const level = bacteriaLevels[effect.bacteria_id] || 0
    const { min, max } = bacteria.optimal_range

    if (effect.effect === 'promotes') {
      if (level > max) {
        concerns.push(`Potrebbe aumentare ulteriormente ${bacteria.name} già alto`)
      } else if (level < min) {
        benefits.push(`Aiuta ad aumentare ${bacteria.name} che è basso`)
      }
    } else if (effect.effect === 'inhibits') {
      if (level < min) {
        concerns.push(`Potrebbe ridurre ulteriormente ${bacteria.name} già basso`)
      } else if (level > max) {
        benefits.push(`Aiuta a ridurre ${bacteria.name} che è alto`)
      }
    }
  }

  return {
    compatible: concerns.length === 0,
    concerns,
    benefits
  }
}

/**
 * Genera piano alimentare ottimizzato per microbioma
 */
export function generateMicrobiomeOptimizedPlan(
  currentBacteria: Record<string, number>,
  intolerances: string[],
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): {
  recommended_foods: string[]
  avoid_foods: string[]
  prebiotics_to_include: string[]
  probiotics_to_include: string[]
} {
  const recommendations = getMicrobiomeRecommendations(currentBacteria, ['gut_health', 'recovery'])
  
  // Filtra per intolleranze
  const isLactoseIntolerant = intolerances.some(i => i.toLowerCase().includes('lattosio'))
  const isGlutenIntolerant = intolerances.some(i => i.toLowerCase().includes('glutine'))

  let prebiotics = ['aglio', 'cipolla', 'asparagi', 'banana', 'avena', 'legumi']
  let probiotics = ['yogurt', 'kefir', 'kimchi', 'crauti', 'miso', 'tempeh']

  if (isLactoseIntolerant) {
    probiotics = probiotics.filter(p => !['yogurt', 'kefir'].includes(p))
    prebiotics.push('kefir di cocco')
  }

  if (isGlutenIntolerant) {
    prebiotics = prebiotics.filter(p => p !== 'avena') // A meno che sia certificata GF
    prebiotics.push('riso', 'quinoa', 'grano saraceno')
  }

  return {
    recommended_foods: recommendations.foods_to_increase.map(f => f.food).slice(0, 10),
    avoid_foods: recommendations.foods_to_reduce.map(f => f.food).slice(0, 5),
    prebiotics_to_include: prebiotics,
    probiotics_to_include: probiotics
  }
}
