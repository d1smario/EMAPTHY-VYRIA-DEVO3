// ============================================
// EMPATHY - Database Epigenetico Metabolico
// Geni, stati di espressione, conseguenze e raccomandazioni
// ============================================

export interface GeneExpression {
  state: "normal" | "under_expressed" | "over_expressed" | "polymorphism"
  description: string
  metabolic_consequences: string[]
  symptoms: string[]
  nutritional_recommendations: string[]
  supplement_recommendations: string[]
  training_recommendations: string[]
  foods_to_avoid: string[]
  foods_to_prefer: string[]
}

export interface MetabolicGene {
  id: string
  symbol: string
  full_name: string
  chromosome: string
  category: "glycolysis" | "lipid_metabolism" | "mitochondrial" | "transport" | "muscle_fiber" | "antioxidant" | "amino_acid" | "methylation" | "inflammation"
  pathway: string[]
  function: string
  expression_states: {
    normal: GeneExpression
    under_expressed: GeneExpression
    over_expressed: GeneExpression
    polymorphism?: GeneExpression
  }
  related_genes: string[]
  biomarkers: string[]
  test_panels: string[]
}

// ============================================
// DATABASE GENI METABOLICI
// ============================================

export const METABOLIC_GENES_DATABASE: MetabolicGene[] = [
  // ============================================
  // GLICOLISI E METABOLISMO GLUCIDICO
  // ============================================
  {
    id: "pfk",
    symbol: "PFKM",
    full_name: "Fosfofruttochinasi Muscolare",
    chromosome: "12q13.11",
    category: "glycolysis",
    pathway: ["glicolisi", "via_embden_meyerhof"],
    function: "Enzima limitante della glicolisi. Catalizza la fosforilazione del fruttosio-6-fosfato a fruttosio-1,6-bisfosfato. Regola il flusso glicolitico in risposta allo stato energetico cellulare.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Attività enzimatica nella norma, glicolisi efficiente",
        metabolic_consequences: ["Metabolismo glucidico ottimale", "Produzione ATP efficiente durante esercizio intenso"],
        symptoms: [],
        nutritional_recommendations: ["Dieta bilanciata con carboidrati complessi"],
        supplement_recommendations: [],
        training_recommendations: ["Allenamento HIIT ben tollerato"],
        foods_to_avoid: [],
        foods_to_prefer: ["Cereali integrali", "Frutta", "Verdure"]
      },
      under_expressed: {
        state: "under_expressed",
        description: "Ridotta attività della fosfofruttochinasi - GLICOLISI RALLENTATA",
        metabolic_consequences: [
          "Difficoltà a degradare fruttosio e glucosio",
          "Accumulo di fruttosio-6-fosfato",
          "Permanenza zuccheri nel lume intestinale",
          "Fermentazione batterica intestinale aumentata",
          "Produzione ridotta di ATP glicolitico",
          "Shift verso metabolismo lipidico compensatorio",
          "Acidosi metabolica durante sforzo intenso"
        ],
        symptoms: [
          "Affaticamento precoce durante esercizio intenso",
          "Crampi muscolari",
          "Gonfiore addominale dopo carboidrati",
          "Intolleranza al fruttosio",
          "Mioglobinuria dopo sforzo",
          "Recupero prolungato"
        ],
        nutritional_recommendations: [
          "Ridurre fruttosio libero (succhi, miele, frutta molto dolce)",
          "Preferire glucosio a fruttosio per energia rapida",
          "Carboidrati a basso indice glicemico",
          "Pasti piccoli e frequenti",
          "Aumentare grassi come fonte energetica"
        ],
        supplement_recommendations: [
          "Ribosio (supporta via pentoso fosfato alternativa)",
          "Creatina (ATP alternativo)",
          "MCT oil (energia non glicolitica)",
          "Probiotici (ridurre fermentazione)",
          "Vitamina B1 (cofattore metabolico)"
        ],
        training_recommendations: [
          "Evitare HIIT prolungato",
          "Preferire steady state a bassa intensità",
          "Zona 2 predominante",
          "Recuperi lunghi tra intervalli",
          "Riscaldamento graduale e prolungato"
        ],
        foods_to_avoid: [
          "Fruttosio libero", "Miele", "Sciroppo d'agave", 
          "Succhi di frutta", "Frutta molto matura",
          "HFCS (sciroppo mais ad alto fruttosio)"
        ],
        foods_to_prefer: [
          "Riso", "Patate", "Maltodestrine",
          "Avena", "Quinoa", "Olio MCT", "Avocado"
        ]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Iperattività glicolitica",
        metabolic_consequences: [
          "Consumo rapido glicogeno",
          "Produzione eccessiva lattato",
          "Acidosi precoce",
          "Deplezione rapida riserve glucidiche"
        ],
        symptoms: [
          "Bruciore muscolare precoce",
          "Fame frequente",
          "Ipoglicemia reattiva"
        ],
        nutritional_recommendations: [
          "Carboidrati a rilascio lento",
          "Combinare sempre carboidrati con proteine/grassi",
          "Evitare zuccheri semplici isolati"
        ],
        supplement_recommendations: [
          "Beta-alanina (buffer lattato)",
          "Bicarbonato di sodio (pre-gara)",
          "Citrullina"
        ],
        training_recommendations: [
          "Allenamento threshold per migliorare clearance lattato",
          "Lavoro sulla soglia anaerobica"
        ],
        foods_to_avoid: ["Zuccheri semplici isolati", "Bevande zuccherate"],
        foods_to_prefer: ["Legumi", "Cereali integrali", "Verdure fibrose"]
      }
    },
    related_genes: ["HK2", "PKM", "LDHA", "PDK4"],
    biomarkers: ["Lattato basale", "Lattato post-esercizio", "Glucosio", "Fruttosio sierico"],
    test_panels: ["Panel metabolico muscolare", "Test da sforzo con lattato"]
  },

  {
    id: "ldha",
    symbol: "LDHA",
    full_name: "Lattato Deidrogenasi A",
    chromosome: "11p15.1",
    category: "glycolysis",
    pathway: ["glicolisi", "metabolismo_lattato", "ciclo_cori"],
    function: "Converte piruvato in lattato durante glicolisi anaerobica. Fondamentale per mantenere NAD+ per continuare glicolisi. Predominante nel muscolo scheletrico.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Conversione piruvato-lattato bilanciata",
        metabolic_consequences: ["Clearance lattato efficiente", "Capacità anaerobica normale"],
        symptoms: [],
        nutritional_recommendations: ["Dieta bilanciata"],
        supplement_recommendations: [],
        training_recommendations: ["Allenamento misto aerobico-anaerobico"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Ridotta capacità di produrre lattato - BLOCCO ANAEROBICO",
        metabolic_consequences: [
          "Incapacità di sostenere sforzi anaerobici",
          "Accumulo piruvato",
          "NAD+ non rigenerato",
          "Glicolisi bloccata ad alte intensità",
          "Mioglobinuria da sforzo"
        ],
        symptoms: [
          "Incapacità di sprintare",
          "Urine scure dopo sforzo intenso",
          "Crampi severi",
          "Affaticamento muscolare acuto"
        ],
        nutritional_recommendations: [
          "Evitare sforzi anaerobici intensi",
          "Aumentare apporto grassi come carburante",
          "Idratazione abbondante"
        ],
        supplement_recommendations: [
          "MCT oil",
          "Creatina",
          "CoQ10"
        ],
        training_recommendations: [
          "Solo aerobico a bassa intensità",
          "NO sprint, NO HIIT",
          "Monitoraggio CK post-allenamento"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Grassi salutari", "Proteine magre"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Produzione eccessiva di lattato - FENOTIPO GLICOLITICO",
        metabolic_consequences: [
          "Iperproduzione lattato",
          "Acidosi muscolare precoce",
          "Shift metabolico verso anaerobico",
          "Ridotta efficienza ossidativa"
        ],
        symptoms: [
          "Bruciore muscolare frequente",
          "Affaticamento durante steady state",
          "Difficoltà a mantenere ritmi costanti"
        ],
        nutritional_recommendations: [
          "Dieta alcalinizzante",
          "Ridurre proteine animali eccessive",
          "Aumentare vegetali"
        ],
        supplement_recommendations: [
          "Beta-alanina",
          "Bicarbonato",
          "Citrullina malato",
          "Magnesio"
        ],
        training_recommendations: [
          "Focus su allenamento aerobico base",
          "Lavoro sotto soglia",
          "Aumentare volume a bassa intensità",
          "Allenamento polarizzato"
        ],
        foods_to_avoid: ["Eccesso proteine", "Alcol"],
        foods_to_prefer: ["Frutta", "Verdura", "Alimenti alcalinizzanti"]
      }
    },
    related_genes: ["LDHB", "MCT1", "MCT4", "PDH"],
    biomarkers: ["Lattato basale", "Curva lattato", "LDH sierico", "Rapporto LDH-A/LDH-B"],
    test_panels: ["Test lattato incrementale", "Biopsia muscolare"]
  },

  {
    id: "pdk4",
    symbol: "PDK4",
    full_name: "Piruvato Deidrogenasi Chinasi 4",
    chromosome: "7q21.3",
    category: "glycolysis",
    pathway: ["regolazione_pdh", "switch_metabolico", "flessibilita_metabolica"],
    function: "Inibisce il complesso PDH, bloccando l'ingresso del piruvato nel ciclo di Krebs. Regola lo switch tra metabolismo glucidico e lipidico.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Flessibilità metabolica ottimale",
        metabolic_consequences: ["Switch efficiente grassi/carboidrati", "Adattamento metabolico all'esercizio"],
        symptoms: [],
        nutritional_recommendations: ["Periodizzazione carboidrati"],
        supplement_recommendations: [],
        training_recommendations: ["Train low, compete high"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "PDH sempre attivo - DIPENDENZA DA CARBOIDRATI",
        metabolic_consequences: [
          "Incapacità di usare grassi come carburante",
          "Consumo rapido glicogeno",
          "Ipoglicemia durante esercizio prolungato",
          "Crisi energetica in deplezione glucidica"
        ],
        symptoms: [
          "Fame costante durante allenamento",
          "Crisi di fame improvvise (bonking)",
          "Difficoltà a dimagrire",
          "Dipendenza da gel/carboidrati"
        ],
        nutritional_recommendations: [
          "Training low occasionale per stimolare adattamento",
          "Aumentare gradualmente grassi nella dieta",
          "Non eliminare carboidrati ma periodizzare"
        ],
        supplement_recommendations: [
          "MCT oil (bypassano il blocco)",
          "Carnitina",
          "Caffeina (mobilizza grassi)"
        ],
        training_recommendations: [
          "Allenamenti a digiuno occasionali",
          "Long slow distance",
          "Ridurre carboidrati durante allenamenti base"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Grassi salutari", "MCT", "Avocado", "Noci"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "PDH cronicamente inibito - RIGIDITÀ METABOLICA VERSO GRASSI",
        metabolic_consequences: [
          "Incapacità di usare carboidrati efficientemente",
          "Glucosio non entra nel Krebs",
          "Iperglicemia post-prandiale",
          "Pseudo-diabete metabolico",
          "Performance compromessa ad alte intensità"
        ],
        symptoms: [
          "Glicemia alta dopo pasti",
          "Difficoltà negli sprint",
          "Stanchezza post-prandiale",
          "Insulino-resistenza funzionale"
        ],
        nutritional_recommendations: [
          "Reintrodurre carboidrati gradualmente",
          "Evitare diete chetogeniche prolungate",
          "Carboidrati attorno all'allenamento"
        ],
        supplement_recommendations: [
          "Acido alfa-lipoico",
          "Cromo",
          "Berberina"
        ],
        training_recommendations: [
          "Allenamenti con carboidrati",
          "HIIT per riattivare metabolismo glucidico",
          "Evitare allenamenti a digiuno"
        ],
        foods_to_avoid: ["Eccesso grassi saturi"],
        foods_to_prefer: ["Carboidrati a basso IG", "Fibre"]
      }
    },
    related_genes: ["PDH", "PFKM", "CPT1A"],
    biomarkers: ["Glicemia a digiuno", "HOMA-IR", "Quoziente respiratorio (RQ)", "Lattato soglia"],
    test_panels: ["Test flessibilità metabolica", "Calorimetria indiretta"]
  },

  // ============================================
  // METABOLISMO LIPIDICO
  // ============================================
  {
    id: "cpt1a",
    symbol: "CPT1A",
    full_name: "Carnitina Palmitoiltransferasi 1A",
    chromosome: "11q13.3",
    category: "lipid_metabolism",
    pathway: ["beta_ossidazione", "trasporto_acidi_grassi", "metabolismo_mitocondriale"],
    function: "Enzima chiave per il trasporto degli acidi grassi a catena lunga nei mitocondri. Rate-limiting step della beta-ossidazione.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Trasporto lipidico mitocondriale efficiente",
        metabolic_consequences: ["Beta-ossidazione ottimale", "Buona capacità endurance"],
        symptoms: [],
        nutritional_recommendations: ["Dieta con grassi salutari"],
        supplement_recommendations: ["Carnitina se necessario"],
        training_recommendations: ["Allenamento endurance ben tollerato"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Trasporto lipidico compromesso - DEFICIT BETA-OSSIDAZIONE",
        metabolic_consequences: [
          "Incapacità di bruciare grassi a catena lunga",
          "Accumulo acidi grassi citosolici",
          "Dipendenza totale da carboidrati",
          "Ipoglicemia a digiuno",
          "Steatosi epatica",
          "Cardiomiopatia se severo"
        ],
        symptoms: [
          "Ipoglicemia dopo digiuno",
          "Debolezza muscolare",
          "Epatomegalia",
          "Intolleranza al digiuno",
          "Miopatia metabolica"
        ],
        nutritional_recommendations: [
          "Evitare digiuno prolungato",
          "Pasti frequenti con carboidrati",
          "MCT oil (bypassano CPT1)",
          "Limitare grassi a catena lunga"
        ],
        supplement_recommendations: [
          "MCT oil (FONDAMENTALE)",
          "Carnitina",
          "Ribosio",
          "CoQ10"
        ],
        training_recommendations: [
          "Mai allenarsi a digiuno",
          "Carboidrati costanti durante esercizio",
          "Evitare ultraendurance",
          "Monitoraggio CK e glicemia"
        ],
        foods_to_avoid: ["Grassi a catena lunga in eccesso", "Digiuno"],
        foods_to_prefer: ["MCT", "Olio di cocco", "Carboidrati complessi"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Iperfunzione trasporto lipidico",
        metabolic_consequences: [
          "Eccellente ossidazione grassi",
          "Risparmio glicogeno",
          "Fenotipo endurance"
        ],
        symptoms: [
          "Difficoltà a prendere peso",
          "Possibile difficoltà in sprint"
        ],
        nutritional_recommendations: [
          "Sfruttare capacità di usare grassi",
          "Periodizzazione con fasi low-carb"
        ],
        supplement_recommendations: [
          "Carnitina per ottimizzare",
          "Caffeina"
        ],
        training_recommendations: [
          "Eccellente per ultraendurance",
          "Train low, compete high"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Grassi salutari", "Omega-3"]
      }
    },
    related_genes: ["CPT2", "ACADVL", "ACADM", "HADHA"],
    biomarkers: ["Acilcarnitine", "Carnitina libera", "Profilo acidi grassi", "CK"],
    test_panels: ["Screening acilcarnitine", "Test genetico beta-ossidazione"]
  },

  {
    id: "ppargc1a",
    symbol: "PPARGC1A",
    full_name: "PGC-1alfa (Peroxisome Proliferator-Activated Receptor Gamma Coactivator 1-Alpha)",
    chromosome: "4p15.2",
    category: "mitochondrial",
    pathway: ["biogenesi_mitocondriale", "termogenesi", "metabolismo_ossidativo"],
    function: "Master regulator della biogenesi mitocondriale. Controlla l'espressione di geni del metabolismo ossidativo, trasformazione fibre muscolari, e termogenesi.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Biogenesi mitocondriale normale",
        metabolic_consequences: ["Adattamento all'allenamento endurance", "Densità mitocondriale adeguata"],
        symptoms: [],
        nutritional_recommendations: ["Dieta antiossidante"],
        supplement_recommendations: [],
        training_recommendations: ["Allenamento endurance progressivo"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Ridotta biogenesi mitocondriale - INEFFICIENZA OSSIDATIVA",
        metabolic_consequences: [
          "Pochi mitocondri",
          "Bassa capacità ossidativa",
          "Scarsa resistenza aerobica",
          "Accumulo ROS",
          "Invecchiamento precoce muscolare",
          "Insulino-resistenza",
          "Difficoltà adattamento all'allenamento"
        ],
        symptoms: [
          "Affaticamento cronico",
          "Scarsa resistenza",
          "Recupero lento",
          "Difficoltà a migliorare VO2max",
          "Dolori muscolari persistenti"
        ],
        nutritional_recommendations: [
          "Dieta ricca di antiossidanti",
          "Polifenoli (resveratrolo, quercetina)",
          "Restrizione calorica intermittente",
          "Evitare eccesso calorico"
        ],
        supplement_recommendations: [
          "Resveratrolo",
          "CoQ10",
          "NAD+ precursori (NMN, NR)",
          "PQQ",
          "Alfa-lipoico",
          "EGCG (tè verde)"
        ],
        training_recommendations: [
          "Allenamento endurance costante",
          "HIIT per stimolare biogenesi",
          "Allenamento in ipossia simulata",
          "Training in cold"
        ],
        foods_to_avoid: ["Eccesso calorico", "Zuccheri raffinati", "Grassi trans"],
        foods_to_prefer: ["Frutti di bosco", "Tè verde", "Uva rossa", "Cacao", "Curcuma"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Alta biogenesi mitocondriale - FENOTIPO ENDURANCE",
        metabolic_consequences: [
          "Alta densità mitocondriale",
          "Eccellente capacità ossidativa",
          "Buon utilizzo grassi",
          "Resistenza alla fatica"
        ],
        symptoms: [],
        nutritional_recommendations: [
          "Supportare con antiossidanti",
          "Non limitare troppo calorie"
        ],
        supplement_recommendations: [
          "CoQ10 per supportare catena respiratoria",
          "Antiossidanti moderati"
        ],
        training_recommendations: [
          "Sfruttare predisposizione endurance",
          "Attenzione a overtraining"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Alimenti ricchi nutrienti", "Omega-3"]
      },
      polymorphism: {
        state: "polymorphism",
        description: "Variante Gly482Ser - risposta ridotta all'allenamento",
        metabolic_consequences: [
          "Minore adattamento mitocondriale all'allenamento",
          "Rischio aumentato diabete tipo 2"
        ],
        symptoms: ["Plateau prestazionali", "Difficoltà a migliorare"],
        nutritional_recommendations: ["Interventi nutrizionali più aggressivi"],
        supplement_recommendations: ["Resveratrolo", "Berberina", "Metformina (medico)"],
        training_recommendations: ["Volume allenamento maggiore per compensare"],
        foods_to_avoid: [],
        foods_to_prefer: ["Attivatori AMPK naturali"]
      }
    },
    related_genes: ["TFAM", "NRF1", "NRF2", "SIRT1", "AMPK"],
    biomarkers: ["VO2max", "Soglia lattato", "Biopsia muscolare (densità mitocondriale)"],
    test_panels: ["Test genetico sport", "Biopsia muscolare"]
  },

  // ============================================
  // FIBRE MUSCOLARI E PERFORMANCE
  // ============================================
  {
    id: "actn3",
    symbol: "ACTN3",
    full_name: "Alfa-Actinina-3",
    chromosome: "11q13.2",
    category: "muscle_fiber",
    pathway: ["struttura_sarcomero", "contrazione_rapida", "fibre_tipo_II"],
    function: "Proteina strutturale esclusiva delle fibre muscolari veloci (tipo IIx). Determina la capacità di generare contrazioni rapide e potenti.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Genotipo RR o RX - Alfa-actinina-3 presente",
        metabolic_consequences: [
          "Fibre veloci funzionali",
          "Buona potenza muscolare",
          "Capacità sprint"
        ],
        symptoms: [],
        nutritional_recommendations: ["Proteine adeguate per massa muscolare"],
        supplement_recommendations: ["Creatina per potenza"],
        training_recommendations: ["Allenamento forza e potenza efficace"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Genotipo XX - DEFICIT ALFA-ACTININA-3",
        metabolic_consequences: [
          "Assenza fibre tipo IIx funzionali",
          "Shift verso fibre lente (tipo I)",
          "Metabolismo più ossidativo",
          "Ridotta potenza massimale",
          "Maggiore efficienza endurance"
        ],
        symptoms: [
          "Difficoltà in sprint e salti",
          "Forza esplosiva ridotta",
          "Eccellente resistenza",
          "Recupero rapido tra sforzi"
        ],
        nutritional_recommendations: [
          "Sfruttare predisposizione endurance",
          "Carboidrati per allenamenti lunghi"
        ],
        supplement_recommendations: [
          "Creatina (può aiutare parzialmente)",
          "Beta-alanina",
          "Caffeina per compensare"
        ],
        training_recommendations: [
          "Focus su endurance dove eccelle",
          "Allenamento forza per compensare deficit",
          "Non aspettarsi progressi rapidi in potenza",
          "Volume alto, intensità moderata"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Alimenti per endurance"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Genotipo RR con alta espressione - FENOTIPO POTENZA",
        metabolic_consequences: [
          "Fibre veloci molto sviluppate",
          "Alta potenza e velocità",
          "Metabolismo più glicolitico"
        ],
        symptoms: [
          "Eccellente in sprint",
          "Affaticamento rapido in endurance"
        ],
        nutritional_recommendations: [
          "Proteine elevate",
          "Carboidrati pre-performance"
        ],
        supplement_recommendations: [
          "Creatina (risposta ottimale)",
          "HMB",
          "EAA"
        ],
        training_recommendations: [
          "Allenamento potenza e forza",
          "Sprint",
          "Evitare volumi eccessivi"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Proteine nobili", "Carboidrati timing"]
      }
    },
    related_genes: ["ACTN2", "MYH7", "MYH1", "MYH2"],
    biomarkers: ["Test salto", "Peak power", "Composizione corporea"],
    test_panels: ["Test genetico sport", "Test Wingate"]
  },

  {
    id: "ace",
    symbol: "ACE",
    full_name: "Enzima di Conversione dell'Angiotensina",
    chromosome: "17q23.3",
    category: "muscle_fiber",
    pathway: ["sistema_renina_angiotensina", "regolazione_vascolare", "ipertrofia_muscolare"],
    function: "Converte angiotensina I in angiotensina II. Il polimorfismo I/D influenza la predisposizione a endurance vs potenza.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Genotipo ID - Profilo misto",
        metabolic_consequences: ["Buon bilanciamento endurance/potenza"],
        symptoms: [],
        nutritional_recommendations: ["Dieta bilanciata"],
        supplement_recommendations: [],
        training_recommendations: ["Risponde bene a entrambi i tipi di allenamento"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Genotipo II - Bassa attività ACE - FENOTIPO ENDURANCE",
        metabolic_consequences: [
          "Maggiore efficienza muscolare",
          "Migliore utilizzo ossigeno",
          "Risposta bradichinina aumentata",
          "Vasodilatazione favorita"
        ],
        symptoms: [
          "Eccellente resistenza",
          "Recupero rapido",
          "Pressione tendenzialmente bassa"
        ],
        nutritional_recommendations: [
          "Carboidrati per endurance",
          "Sodio adeguato se pressione bassa"
        ],
        supplement_recommendations: [
          "Beetroot juice (nitrati)",
          "Ferro se necessario"
        ],
        training_recommendations: [
          "Focus endurance",
          "Allenamento ipossico ben tollerato",
          "Ottimo per maratona, ciclismo, triathlon"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Barbabietola", "Verdure a foglia verde"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Genotipo DD - Alta attività ACE - FENOTIPO POTENZA",
        metabolic_consequences: [
          "Maggiore risposta ipertrofica",
          "Vasocostrizione relativa",
          "Ritenzione sodio",
          "Pressione tendenzialmente alta"
        ],
        symptoms: [
          "Risposta rapida all'allenamento forza",
          "Buon guadagno massa muscolare",
          "Possibile ipertensione"
        ],
        nutritional_recommendations: [
          "Proteine elevate",
          "Moderare sodio",
          "Potassio adeguato"
        ],
        supplement_recommendations: [
          "Creatina",
          "Citrullina",
          "Omega-3 per profilo pressorio"
        ],
        training_recommendations: [
          "Focus forza e potenza",
          "Risposta ottimale a ipertrofia",
          "Monitorare pressione"
        ],
        foods_to_avoid: ["Eccesso sodio"],
        foods_to_prefer: ["Alimenti ricchi potassio", "Omega-3"]
      }
    },
    related_genes: ["ACTN3", "AGT", "AGTR1", "BDKRB2"],
    biomarkers: ["Pressione arteriosa", "VO2max", "Massa muscolare"],
    test_panels: ["Test genetico sport", "Profilo pressorio"]
  },

  // ============================================
  // ANTIOSSIDANTI E DETOSSIFICAZIONE
  // ============================================
  {
    id: "sod2",
    symbol: "SOD2",
    full_name: "Superossido Dismutasi 2 (Mitocondriale)",
    chromosome: "6q25.3",
    category: "antioxidant",
    pathway: ["difesa_antiossidante", "detossificazione_ROS", "protezione_mitocondriale"],
    function: "Enzima antiossidante mitocondriale. Converte il superossido in perossido di idrogeno, proteggendo i mitocondri dal danno ossidativo.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Difesa antiossidante mitocondriale normale",
        metabolic_consequences: ["Protezione ROS adeguata", "Mitocondri protetti"],
        symptoms: [],
        nutritional_recommendations: ["Dieta ricca antiossidanti"],
        supplement_recommendations: [],
        training_recommendations: ["Recupero adeguato tra sessioni intense"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Difesa antiossidante compromessa - STRESS OSSIDATIVO ELEVATO",
        metabolic_consequences: [
          "Accumulo ROS mitocondriali",
          "Danno DNA mitocondriale",
          "Disfunzione mitocondriale progressiva",
          "Infiammazione cronica",
          "Invecchiamento accelerato",
          "Rischio malattie degenerative"
        ],
        symptoms: [
          "Recupero molto lento",
          "Dolori muscolari persistenti",
          "Affaticamento cronico",
          "Infezioni frequenti",
          "Infiammazione sistemica"
        ],
        nutritional_recommendations: [
          "Dieta MOLTO ricca antiossidanti",
          "Evitare cibi pro-infiammatori",
          "Dieta mediterranea",
          "Curcuma, zenzero quotidiani"
        ],
        supplement_recommendations: [
          "Vitamina C (1-2g/die)",
          "Vitamina E naturale",
          "CoQ10",
          "NAC (N-acetilcisteina)",
          "Astaxantina",
          "Glutatione liposomiale",
          "Alfa-lipoico"
        ],
        training_recommendations: [
          "Volumi moderati",
          "Recupero prolungato",
          "Evitare overreaching",
          "No HIIT consecutivi",
          "Monitorare markers infiammazione"
        ],
        foods_to_avoid: ["Fritti", "Carni processate", "Zuccheri", "Alcol", "Cibi industriali"],
        foods_to_prefer: ["Frutti di bosco", "Verdure colorate", "Curcuma", "Tè verde", "Cacao", "Noci"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Alta capacità antiossidante",
        metabolic_consequences: [
          "Ottima protezione ROS",
          "Recupero efficiente"
        ],
        symptoms: [],
        nutritional_recommendations: ["Mantenere dieta antiossidante"],
        supplement_recommendations: ["Antiossidanti moderati, non eccessivi"],
        training_recommendations: ["Può tollerare carichi elevati"],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      polymorphism: {
        state: "polymorphism",
        description: "Variante Ala16Val (rs4880) - Efficienza ridotta",
        metabolic_consequences: [
          "SOD2 meno stabile",
          "Trasporto mitocondriale ridotto",
          "Stress ossidativo aumentato"
        ],
        symptoms: ["Recupero lento", "Sensibilità overtraining"],
        nutritional_recommendations: ["Antiossidanti elevati"],
        supplement_recommendations: ["MitoQ", "CoQ10", "NAC"],
        training_recommendations: ["Gestione attenta del carico"],
        foods_to_avoid: ["Pro-ossidanti"],
        foods_to_prefer: ["Antiossidanti mirati"]
      }
    },
    related_genes: ["SOD1", "CAT", "GPX1", "NRF2"],
    biomarkers: ["8-OHdG", "MDA", "Glutatione", "TBARS", "PCR"],
    test_panels: ["Panel stress ossidativo", "Markers infiammazione"]
  },

  {
    id: "gstm1",
    symbol: "GSTM1",
    full_name: "Glutatione S-Transferasi Mu 1",
    chromosome: "1p13.3",
    category: "antioxidant",
    pathway: ["detossificazione_fase_II", "coniugazione_glutatione", "eliminazione_xenobiotici"],
    function: "Enzima di detossificazione fase II. Coniuga glutatione a composti tossici per facilitarne l'eliminazione. Protegge da carcinogeni e ROS.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Detossificazione fase II normale",
        metabolic_consequences: ["Eliminazione tossine efficiente"],
        symptoms: [],
        nutritional_recommendations: ["Verdure crucifere"],
        supplement_recommendations: [],
        training_recommendations: [],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Delezione GSTM1 null - DETOSSIFICAZIONE COMPROMESSA (50% popolazione)",
        metabolic_consequences: [
          "Ridotta capacità detossificazione",
          "Accumulo metaboliti tossici",
          "Sensibilità a inquinanti",
          "Rischio aumentato tumori",
          "Danno ossidativo aumentato"
        ],
        symptoms: [
          "Sensibilità chimica multipla",
          "Reazioni a farmaci",
          "Intolleranza alcol",
          "Emicranie da esposizioni ambientali"
        ],
        nutritional_recommendations: [
          "Crucifere QUOTIDIANE (attivano vie alternative)",
          "Aglio, cipolla (supportano glutatione)",
          "Evitare cibi con pesticidi",
          "Biologico quando possibile"
        ],
        supplement_recommendations: [
          "NAC",
          "Glutatione liposomiale",
          "Sulforafano (estratto broccoli)",
          "Vitamina C",
          "Selenio"
        ],
        training_recommendations: [
          "Evitare allenamento in zone inquinate",
          "Preferire indoor con aria filtrata se inquinamento alto",
          "Idratazione abbondante"
        ],
        foods_to_avoid: ["Carni alla griglia bruciacchiate", "Alcol", "Cibi industriali", "Pesticidi"],
        foods_to_prefer: ["Broccoli", "Cavolo", "Cavolfiore", "Rucola", "Aglio", "Cipolla"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Alta capacità detossificazione",
        metabolic_consequences: ["Ottima eliminazione tossine"],
        symptoms: [],
        nutritional_recommendations: ["Mantenere apporto crucifere"],
        supplement_recommendations: [],
        training_recommendations: [],
        foods_to_avoid: [],
        foods_to_prefer: []
      }
    },
    related_genes: ["GSTT1", "GSTP1", "NQO1", "CYP1A1"],
    biomarkers: ["Glutatione eritrocitario", "Acido mercapturico urinario"],
    test_panels: ["Panel detossificazione genetico"]
  },

  // ============================================
  // METABOLISMO AMINOACIDI
  // ============================================
  {
    id: "bckdh",
    symbol: "BCKDHA",
    full_name: "Complesso Deidrogenasi degli Alfa-Chetoacidi a Catena Ramificata",
    chromosome: "19q13.2",
    category: "amino_acid",
    pathway: ["catabolismo_bcaa", "metabolismo_leucina", "ciclo_krebs"],
    function: "Enzima chiave nel catabolismo dei BCAA (leucina, isoleucina, valina). Decarbossila i chetoacidi derivati dai BCAA.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Catabolismo BCAA normale",
        metabolic_consequences: ["Utilizzo BCAA efficiente", "Energia da aminoacidi normale"],
        symptoms: [],
        nutritional_recommendations: ["Proteine adeguate"],
        supplement_recommendations: ["BCAA se allenamento intenso"],
        training_recommendations: [],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Ridotto catabolismo BCAA - ACCUMULO BCAA",
        metabolic_consequences: [
          "Accumulo BCAA e chetoacidi",
          "Potenziale neurotossicità",
          "Ridotta produzione energia da proteine",
          "Se severo: malattia sciroppo d'acero"
        ],
        symptoms: [
          "Odore dolciastro urine/sudore (se severo)",
          "Affaticamento con diete iperproteiche",
          "Confusione dopo pasti proteici"
        ],
        nutritional_recommendations: [
          "Non eccedere con proteine",
          "Distribuire proteine nei pasti",
          "Evitare supplementi BCAA isolati"
        ],
        supplement_recommendations: [
          "Tiamina (cofattore BCKDH)",
          "Vitamina B6"
        ],
        training_recommendations: [
          "Evitare supplementi BCAA",
          "Proteine moderate"
        ],
        foods_to_avoid: ["Eccesso proteine", "BCAA isolati"],
        foods_to_prefer: ["Proteine distribuite", "Carboidrati bilanciati"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Catabolismo BCAA accelerato",
        metabolic_consequences: [
          "Consumo rapido BCAA",
          "Maggiore fabbisogno proteico",
          "Rischio catabolismo muscolare"
        ],
        symptoms: [
          "Perdita massa magra se proteine insufficienti",
          "Fame proteica"
        ],
        nutritional_recommendations: [
          "Proteine elevate (2-2.5g/kg)",
          "BCAA supplementari utili"
        ],
        supplement_recommendations: [
          "BCAA",
          "HMB",
          "EAA"
        ],
        training_recommendations: [
          "Proteine post-workout essenziali",
          "BCAA intra-workout"
        ],
        foods_to_avoid: [],
        foods_to_prefer: ["Proteine nobili", "Leucina-rich foods"]
      }
    },
    related_genes: ["BCAT1", "BCAT2", "DBT", "DLD"],
    biomarkers: ["BCAA plasmatici", "Chetoacidi urinari", "Leucina/Isoleucina/Valina"],
    test_panels: ["Aminoacidogramma", "Acidi organici urinari"]
  },

  // ============================================
  // METILAZIONE E FOLATI
  // ============================================
  {
    id: "mthfr",
    symbol: "MTHFR",
    full_name: "Metilentetraidrofolato Reduttasi",
    chromosome: "1p36.22",
    category: "methylation",
    pathway: ["ciclo_folati", "metilazione", "sintesi_DNA", "omocisteina"],
    function: "Converte 5,10-metilentetraidrofolato in 5-metiltetraidrofolato, la forma attiva del folato per la metilazione.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Ciclo metilazione efficiente",
        metabolic_consequences: ["Metilazione DNA normale", "Omocisteina normale"],
        symptoms: [],
        nutritional_recommendations: ["Folati da verdure"],
        supplement_recommendations: [],
        training_recommendations: [],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Variante C677T/A1298C - METILAZIONE RIDOTTA",
        metabolic_consequences: [
          "Ridotta produzione metilfolato",
          "Iperomocisteinemia",
          "Metilazione DNA alterata",
          "Sintesi neurotrasmettitori compromessa",
          "Rischio cardiovascolare aumentato",
          "Possibile depressione/ansia"
        ],
        symptoms: [
          "Affaticamento cronico",
          "Nebbia mentale",
          "Ansia/depressione",
          "Insonnia",
          "Emicrania",
          "Problemi cardiovascolari"
        ],
        nutritional_recommendations: [
          "Verdure a foglia verde (folati naturali)",
          "Evitare acido folico sintetico",
          "Alimenti metilati naturalmente"
        ],
        supplement_recommendations: [
          "Metilfolato (5-MTHF) - NON acido folico",
          "Metilcobalamina (B12 metilata)",
          "P5P (B6 attiva)",
          "Betaina (TMG)",
          "Riboflavina"
        ],
        training_recommendations: [
          "Recupero adeguato",
          "Gestione stress (cortisolo consuma metilazione)",
          "Sonno prioritario"
        ],
        foods_to_avoid: ["Cibi fortificati con acido folico sintetico", "Alcol"],
        foods_to_prefer: ["Spinaci", "Asparagi", "Lenticchie", "Fegato", "Uova", "Avocado"]
      },
      over_expressed: {
        state: "over_expressed",
        description: "Alta attività MTHFR",
        metabolic_consequences: ["Metilazione efficiente", "Omocisteina bassa"],
        symptoms: [],
        nutritional_recommendations: ["Mantenere apporto folati"],
        supplement_recommendations: [],
        training_recommendations: [],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      polymorphism: {
        state: "polymorphism",
        description: "Omozigote C677T (TT) - 70% riduzione attività",
        metabolic_consequences: [
          "Attività MTHFR ridotta al 30%",
          "Iperomocisteinemia significativa",
          "Rischio trombotico aumentato"
        ],
        symptoms: ["Come under_expressed ma più severi"],
        nutritional_recommendations: ["Metilfolato essenziale"],
        supplement_recommendations: ["Metilfolato 800-1600mcg", "B12 metilata"],
        training_recommendations: ["Idratazione, monitoraggio cardiovascolare"],
        foods_to_avoid: ["Acido folico sintetico assolutamente"],
        foods_to_prefer: ["Folati naturali"]
      }
    },
    related_genes: ["MTR", "MTRR", "COMT", "CBS", "BHMT"],
    biomarkers: ["Omocisteina", "Folato sierico", "B12", "SAMe/SAH ratio"],
    test_panels: ["Panel metilazione genetico", "Omocisteina"]
  },

  // ============================================
  // INFIAMMAZIONE
  // ============================================
  {
    id: "il6",
    symbol: "IL6",
    full_name: "Interleuchina 6",
    chromosome: "7p15.3",
    category: "inflammation",
    pathway: ["risposta_infiammatoria", "risposta_esercizio", "miochina"],
    function: "Citochina pro-infiammatoria ma anche miochina rilasciata durante esercizio. Ruolo duale in infiammazione e adattamento.",
    expression_states: {
      normal: {
        state: "normal",
        description: "Risposta IL-6 bilanciata",
        metabolic_consequences: ["Adattamento all'esercizio normale", "Infiammazione controllata"],
        symptoms: [],
        nutritional_recommendations: ["Dieta anti-infiammatoria"],
        supplement_recommendations: [],
        training_recommendations: [],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      under_expressed: {
        state: "under_expressed",
        description: "Bassa risposta IL-6 - ADATTAMENTO RIDOTTO",
        metabolic_consequences: [
          "Minore risposta adattativa all'esercizio",
          "Ridotta mobilizzazione energetica durante sforzo",
          "Minore comunicazione muscolo-organi"
        ],
        symptoms: [
          "Plateau prestazionali",
          "Scarso adattamento all'allenamento"
        ],
        nutritional_recommendations: [
          "Proteine adeguate",
          "Zinco (supporta segnaling)"
        ],
        supplement_recommendations: [
          "Zinco",
          "Vitamina D"
        ],
        training_recommendations: [
          "Variare stimoli allenamento",
          "Includere HIIT per stimolare risposta"
        ],
        foods_to_avoid: [],
        foods_to_prefer: []
      },
      over_expressed: {
        state: "over_expressed",
        description: "IL-6 cronicamente elevata - INFIAMMAZIONE CRONICA",
        metabolic_consequences: [
          "Stato infiammatorio sistemico",
          "Catabolismo muscolare",
          "Insulino-resistenza",
          "Fatica centrale",
          "Rischio overtraining"
        ],
        symptoms: [
          "Affaticamento persistente",
          "Dolori diffusi",
          "Recupero impossibile",
          "Infezioni ricorrenti",
          "Calo performance",
          "Disturbi sonno"
        ],
        nutritional_recommendations: [
          "Dieta anti-infiammatoria stretta",
          "Omega-3 elevati",
          "Curcuma quotidiana",
          "Evitare zuccheri e cibi processati"
        ],
        supplement_recommendations: [
          "Omega-3 (3-4g/die)",
          "Curcumina",
          "Vitamina D",
          "Zinco",
          "Boswellia",
          "SPM (mediatori pro-risolventi)"
        ],
        training_recommendations: [
          "RIDURRE CARICO URGENTE",
          "Deload o rest week",
          "Solo attività rigenerativa",
          "Priorità assoluta al recupero",
          "Monitorare HRV"
        ],
        foods_to_avoid: ["Zuccheri", "Omega-6 in eccesso", "Alcol", "Cibi processati", "Glutine se sensibili"],
        foods_to_prefer: ["Pesce grasso", "Curcuma", "Zenzero", "Frutti di bosco", "Verdure", "Olio EVO"]
      }
    },
    related_genes: ["TNF", "IL1B", "IL10", "CRP"],
    biomarkers: ["IL-6 sierico", "PCR", "VES", "Ferritina"],
    test_panels: ["Panel citochine", "Markers infiammazione"]
  }
]

// ============================================
// FUNZIONI HELPER
// ============================================

export function getGeneById(id: string): MetabolicGene | undefined {
  return METABOLIC_GENES_DATABASE.find(g => g.id === id)
}

export function getGenesByCategory(category: MetabolicGene["category"]): MetabolicGene[] {
  return METABOLIC_GENES_DATABASE.filter(g => g.category === category)
}

export function getGenesByPathway(pathway: string): MetabolicGene[] {
  return METABOLIC_GENES_DATABASE.filter(g => 
    g.pathway.some(p => p.toLowerCase().includes(pathway.toLowerCase()))
  )
}

export interface GeneAnalysisResult {
  gene: MetabolicGene
  expression: GeneExpression
  severity: "low" | "moderate" | "high"
  priority: number
}

export function analyzeGeneExpression(
  geneId: string, 
  expressionState: "normal" | "under_expressed" | "over_expressed" | "polymorphism"
): GeneAnalysisResult | null {
  const gene = getGeneById(geneId)
  if (!gene) return null
  
  const expression = gene.expression_states[expressionState]
  if (!expression) return null
  
  // Calcola severità basata su conseguenze
  const consequenceCount = expression.metabolic_consequences.length
  const symptomCount = expression.symptoms.length
  
  let severity: "low" | "moderate" | "high" = "low"
  if (consequenceCount > 4 || symptomCount > 4) severity = "high"
  else if (consequenceCount > 2 || symptomCount > 2) severity = "moderate"
  
  // Priorità basata su categoria
  const categoryPriority: Record<string, number> = {
    glycolysis: 9,
    lipid_metabolism: 8,
    mitochondrial: 9,
    transport: 7,
    muscle_fiber: 6,
    antioxidant: 8,
    amino_acid: 7,
    methylation: 8,
    inflammation: 9
  }
  
  return {
    gene,
    expression,
    severity,
    priority: categoryPriority[gene.category] || 5
  }
}

export interface NutritionRecommendation {
  category: string
  recommendations: string[]
  supplements: string[]
  foods_to_avoid: string[]
  foods_to_prefer: string[]
}

export function generateNutritionRecommendations(
  geneAnalyses: GeneAnalysisResult[]
): NutritionRecommendation[] {
  const recommendations: NutritionRecommendation[] = []
  
  // Raggruppa per categoria
  const byCategory = new Map<string, GeneAnalysisResult[]>()
  
  for (const analysis of geneAnalyses) {
    const category = analysis.gene.category
    if (!byCategory.has(category)) {
      byCategory.set(category, [])
    }
    byCategory.get(category)!.push(analysis)
  }
  
  // Genera raccomandazioni per categoria
  for (const [category, analyses] of byCategory) {
    const allRecommendations = new Set<string>()
    const allSupplements = new Set<string>()
    const allFoodsToAvoid = new Set<string>()
    const allFoodsToPrefer = new Set<string>()
    
    for (const analysis of analyses) {
      analysis.expression.nutritional_recommendations.forEach(r => allRecommendations.add(r))
      analysis.expression.supplement_recommendations.forEach(s => allSupplements.add(s))
      analysis.expression.foods_to_avoid.forEach(f => allFoodsToAvoid.add(f))
      analysis.expression.foods_to_prefer.forEach(f => allFoodsToPrefer.add(f))
    }
    
    recommendations.push({
      category,
      recommendations: Array.from(allRecommendations),
      supplements: Array.from(allSupplements),
      foods_to_avoid: Array.from(allFoodsToAvoid),
      foods_to_prefer: Array.from(allFoodsToPrefer)
    })
  }
  
  return recommendations
}

export function getTrainingRecommendations(
  geneAnalyses: GeneAnalysisResult[]
): string[] {
  const allRecommendations = new Set<string>()
  
  // Ordina per priorità (alta prima)
  const sorted = [...geneAnalyses].sort((a, b) => b.priority - a.priority)
  
  for (const analysis of sorted) {
    analysis.expression.training_recommendations.forEach(r => allRecommendations.add(r))
  }
  
  return Array.from(allRecommendations)
}

// Mappa categorie per UI
export const GENE_CATEGORY_LABELS: Record<string, string> = {
  glycolysis: "Glicolisi",
  lipid_metabolism: "Metabolismo Lipidico",
  mitochondrial: "Funzione Mitocondriale",
  transport: "Trasporto Nutrienti",
  muscle_fiber: "Fibre Muscolari",
  antioxidant: "Difesa Antiossidante",
  amino_acid: "Metabolismo Aminoacidi",
  methylation: "Metilazione",
  inflammation: "Infiammazione"
}

export const GENE_CATEGORY_COLORS: Record<string, string> = {
  glycolysis: "cyan",
  lipid_metabolism: "orange",
  mitochondrial: "purple",
  transport: "blue",
  muscle_fiber: "red",
  antioxidant: "green",
  amino_acid: "yellow",
  methylation: "pink",
  inflammation: "rose"
}
