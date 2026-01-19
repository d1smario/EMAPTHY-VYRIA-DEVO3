import { NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPID_API_KEY;
// AscendAPI "Exercise DB with Videos and Images" - host corretto dalla documentazione
const RAPIDAPI_HOST = 'exercise-db-with-videos-and-images-by-ascendapi.p.rapidapi.com';

// Cache per evitare chiamate ripetute
const exerciseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 ora

// Mappatura gruppi muscolari italiani -> inglesi per l'API
// I bodyPart dell'API AscendAPI sono: back, cardio, chest, lower arms, lower legs, neck, shoulders, upper arms, upper legs, waist
const MUSCLE_GROUP_MAP: Record<string, string> = {
  'petto': 'chest',
  'chest': 'chest',
  'schiena': 'back',
  'back': 'back',
  'spalle': 'shoulders',
  'shoulders': 'shoulders',
  'braccia': 'upper arms',
  'bicipiti': 'upper arms',
  'biceps': 'upper arms',
  'tricipiti': 'upper arms',
  'triceps': 'upper arms',
  'upper arms': 'upper arms',
  'gambe': 'upper legs',
  'legs': 'upper legs',
  'quadricipiti': 'upper legs',
  'upper legs': 'upper legs',
  'polpacci': 'lower legs',
  'lower legs': 'lower legs',
  'calves': 'lower legs',
  'glutei': 'upper legs',
  'glutes': 'upper legs',
  'core': 'waist',
  'addominali': 'waist',
  'abs': 'waist',
  'waist': 'waist',
  'avambracci': 'lower arms',
  'forearms': 'lower arms',
  'lower arms': 'lower arms',
  'cardio': 'cardio',
  'neck': 'neck',
  'collo': 'neck',
};

// Traduzioni italiano per i nomi dei muscoli
const MUSCLE_TRANSLATIONS: Record<string, string> = {
  'chest': 'Petto',
  'back': 'Schiena',
  'shoulders': 'Spalle',
  'upper arms': 'Braccia',
  'upper legs': 'Gambe',
  'lower legs': 'Polpacci',
  'waist': 'Addominali',
  'lower arms': 'Avambracci',
  'cardio': 'Cardio',
  'neck': 'Collo',
};

async function fetchFromAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  console.log('[v0] Fetching from API:', url.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY || '',
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[v0] API Error: ${response.status}`, errorBody);
    throw new Error(`API Error: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

function formatExercise(ex: any) {
  return {
    id: ex.exerciseId || ex.id || Math.random().toString(36).substr(2, 9),
    name: ex.name || 'Unknown Exercise',
    nameIt: ex.name,
    bodyPart: ex.bodyPart || 'general',
    bodyPartIt: MUSCLE_TRANSLATIONS[ex.bodyPart] || ex.bodyPart,
    target: ex.targetMuscle || ex.target || ex.bodyPart,
    secondaryMuscles: ex.secondaryMuscles || [],
    equipment: ex.equipments?.[0] || ex.equipment || 'body weight',
    gifUrl: ex.imageUrl || ex.gifUrl,
    imageUrl: ex.imageUrl,
    instructions: ex.instructions || [],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyPart = searchParams.get('bodyPart') || searchParams.get('muscle');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '30';
    const offset = searchParams.get('offset') || '0';

    console.log('[v0] Exercise API request:', { bodyPart, search, limit, offset });

    // Cerca per nome
    if (search) {
      const cacheKey = `search_${search}_${limit}_${offset}`;
      const cached = exerciseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[v0] Returning cached search results');
        return NextResponse.json(cached.data);
      }

      try {
        // AscendAPI search endpoint
        const result = await fetchFromAPI('/exercises/name/' + encodeURIComponent(search));
        const exercises = Array.isArray(result) 
          ? result.slice(0, parseInt(limit)).map(formatExercise)
          : (result.data || []).slice(0, parseInt(limit)).map(formatExercise);
        
        const responseData = { success: true, exercises, total: exercises.length };
        exerciseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        return NextResponse.json(responseData);
      } catch (err) {
        console.error('[v0] Search failed:', err);
        return NextResponse.json({ success: false, exercises: [], error: 'Search failed' });
      }
    }

    // Cerca per gruppo muscolare
    if (bodyPart) {
      const mappedBodyPart = MUSCLE_GROUP_MAP[bodyPart.toLowerCase()] || bodyPart;
      const cacheKey = `bodypart_${mappedBodyPart}_${limit}_${offset}`;
      const cached = exerciseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[v0] Returning cached bodyPart results for:', mappedBodyPart);
        return NextResponse.json(cached.data);
      }

      try {
        // AscendAPI "Exercise DB" - endpoint per bodyPart
        // Formato URL: /exercises/bodyPart/{bodyPart}?limit=X&offset=Y
        const result = await fetchFromAPI('/exercises/bodyPart/' + encodeURIComponent(mappedBodyPart), {
          limit: limit,
          offset: offset
        });
        
        // La risposta puo' essere {success: true, data: [...]} oppure array diretto
        let rawExercises: any[] = [];
        if (result.success && result.data) {
          rawExercises = result.data;
        } else if (Array.isArray(result)) {
          rawExercises = result;
        }
        
        const exercises = rawExercises.slice(0, parseInt(limit)).map(formatExercise);
        console.log('[v0] Fetched exercises for', mappedBodyPart, ':', exercises.length);
        const responseData = { success: true, exercises, total: exercises.length };
        exerciseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        return NextResponse.json(responseData);
      } catch (err) {
        console.error('[v0] BodyPart fetch failed:', err);
        return NextResponse.json({ success: false, exercises: [], error: 'Fetch failed' });
      }
    }

    // Lista tutti gli esercizi (con paginazione)
    const cacheKey = `all_${limit}_${offset}`;
    const cached = exerciseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    try {
      const result = await fetchFromAPI('/exercises', { 
        limit: limit,
        offset: offset 
      });
      const exercises = Array.isArray(result) 
        ? result.slice(0, parseInt(limit)).map(formatExercise)
        : (result.data || []).slice(0, parseInt(limit)).map(formatExercise);
      
      const responseData = { success: true, exercises, total: exercises.length };
      exerciseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
      return NextResponse.json(responseData);
    } catch (err) {
      console.error('[v0] All exercises fetch failed:', err);
      return NextResponse.json({ success: false, exercises: [], error: 'Fetch failed' });
    }

  } catch (error) {
    console.error('[v0] Exercise API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises', exercises: [] },
      { status: 500 }
    );
  }
}

// Endpoint per ottenere i gruppi muscolari e attrezzature disponibili
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'getBodyParts') {
      return NextResponse.json({ 
        success: true, 
        bodyParts: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist']
      });
    }

    if (action === 'getEquipments') {
      return NextResponse.json({ 
        success: true, 
        equipments: ['barbell', 'dumbbell', 'cable', 'machine', 'body weight', 'kettlebell', 'band', 'ez barbell', 'smith machine']
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Exercise API POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}
