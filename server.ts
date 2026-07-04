import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// API Endpoint: Generate Immersive Travel Journey
app.post('/api/generate-journey', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'Gemini API key is not configured. Please set the GEMINI_API_KEY in the Secrets panel in AI Studio.'
      });
    }

    const params = req.body || {};
    let {
      destination,
      duration,
      travelers,
      ageGroup,
      budget,
      travelStyle = [],
      physicalLimitations = 'None',
      languagesKnown = 'English',
      dietaryRestrictions = 'None',
      accessibilityRequirements = 'None',
      transportationPreference = 'Any',
      interests = []
    } = params;

    // 1. INPUT VALIDATION & SANITIZATION
    if (!destination || typeof destination !== 'string') {
      return res.status(400).json({ error: 'Destination must be a non-empty string.' });
    }
    destination = destination.trim().replace(/[<>]/g, '').slice(0, 100); // Strip potential tags & cap size

    const parsedDuration = Math.min(Math.max(parseInt(String(duration), 10) || 3, 1), 14);
    const parsedTravelers = Math.min(Math.max(parseInt(String(travelers), 10) || 1, 1), 20);

    const validatedAgeGroup = typeof ageGroup === 'string' ? ageGroup.trim().slice(0, 30) : '20s-40s';
    const validatedBudget = typeof budget === 'string' ? budget.trim().slice(0, 20) : 'moderate';

    const validatedTravelStyle = Array.isArray(travelStyle) 
      ? travelStyle.filter(item => typeof item === 'string').map(item => item.slice(0, 50))
      : [];
    const validatedInterests = Array.isArray(interests)
      ? interests.filter(item => typeof item === 'string').map(item => item.slice(0, 50))
      : [];

    const cleanPhysicalLimitations = typeof physicalLimitations === 'string' ? physicalLimitations.slice(0, 200) : 'None';
    const cleanLanguagesKnown = typeof languagesKnown === 'string' ? languagesKnown.slice(0, 100) : 'English';
    const cleanDietaryRestrictions = typeof dietaryRestrictions === 'string' ? dietaryRestrictions.slice(0, 200) : 'None';
    const cleanAccessibilityRequirements = typeof accessibilityRequirements === 'string' ? accessibilityRequirements.slice(0, 200) : 'None';
    const cleanTransportationPreference = typeof transportationPreference === 'string' ? transportationPreference.slice(0, 100) : 'Any';

    // Initialize GoogleGenAI client lazily
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Construct a highly descriptive prompt incorporating all 15 workflow steps
    const prompt = `
You are Roamora, an elite AI travel planner, cultural storyteller, heritage expert, local guide, trip optimizer, and experience designer.
Your goal is to create a deeply immersive, educational, highly personalized, and authentic journey for the destination: "${destination}".

Here is the traveler's custom profile:
- Destination: ${destination}
- Duration: ${parsedDuration} Days
- Number of Travelers: ${parsedTravelers} (Age group: ${validatedAgeGroup})
- Budget Tier: ${validatedBudget} (budget, moderate, or luxury)
- Travel Style / Philosophy: ${validatedTravelStyle.join(', ') || 'General cultural exploration'}
- Physical Limitations: ${cleanPhysicalLimitations}
- Languages Known: ${cleanLanguagesKnown}
- Dietary Restrictions: ${cleanDietaryRestrictions}
- Accessibility Requirements: ${cleanAccessibilityRequirements}
- Transportation Preference: ${cleanTransportationPreference}
- Ranked Interests (highest to lowest priority): ${validatedInterests.join(', ') || 'Local food, historical storytelling, local customs'}

Please craft an outstanding travel response following these strict rules:
1. Under "itinerary", generate EXACTLY ${parsedDuration} days. The "itinerary" array MUST have EXACTLY ${parsedDuration} elements. Do not under any circumstances output more or fewer than ${parsedDuration} days, even if the traveler asks for simple requests. If ${parsedDuration} is 2, generate exactly Day 1 and Day 2.
2. Experiences must be actionable events with cultural context, not just generic location names. Each experience MUST include a "timeSlot" representing the specific time-to-time schedule (e.g. "09:00 - 11:30", "13:00 - 14:30", "18:00 - 20:30") sequentially planning out the day's events. Specify an authentic "storytelling" field for each experience using vivid sensory descriptions (sounds, smells, emotions, local traditions).
3. For each experience, provide a viable "alternative" experience (name, why, cost) to serve as a smart substitution if the primary option is closed or too crowded.
4. Recommend 3 hidden gems that locals adore, detailing the folklore or historical myths associated with them.
5. Provide a "mustTryFood" list with local specialities. Include category (Breakfast, Lunch, Dinner, Street Food, Dessert, Drink), name, history of ingredients, best local spots to try it, cost, and specific cultural table etiquette.
6. Design 4 gamified "culturalMissions" with an id, title, description, and an unlockable badge name, plus a detailed description of "howToAccomplish" and "culturalContext" for that mission to motivate real cultural engagement.
7. Recommend 3 "accommodations" for the place selected (heritage stays, homestays, eco-lodges, boutique inns), detailing why they fit the philosophy, their price range, location, and sustainable/local features.
8. Include localized Do's and Don'ts, greetings with native scripts, transliterations, and tipping culture under "localEtiquette".
    9. Include practical emergency contacts, eco-friendly travel recommendations, and a realistic "budgetEstimate" tailored directly to their budget tier.
    10. Assess the itinerary with an "aiTravelScore" (score from 80-99 and explanation) reflecting how rich and deeply local this trip is.
    11. Identify the local currency for the destination area and fill in "localCurrency" with its standard 3-letter currency code, currency symbol, full currency name, and a realistic rateToUSD (how much local currency equals 1 USD, e.g. 155.20 for JPY, 83.50 for INR, 0.92 for EUR, etc.).

Generate the output as a valid JSON object matching this TypeScript interface:

interface JourneyResponse {
  overview: string; // Destination's cultural background, significance, climate, safety
  summary: string;  // Curated explanation matching traveler style & interests
  itinerary: Array<{
    dayNumber: number;
    theme: string;
    experiences: Array<{
      name: string;
      whyItMatters: string;
      timeSlot: string; // Specific time-to-time schedule (e.g. "09:00 - 11:30")
      timeNeeded: string;
      bestTime: string;
      cost: string;
      difficulty: 'Easy' | 'Moderate' | 'Strenuous';
      authenticityScore: number; // 1 to 10
      crowdScore: number;        // 1 to 10
      photographyScore: number;  // 1 to 10
      familyFriendly: boolean;
      accessibility: string;
      storytelling: string; // Immersive narrative with sounds, smells, emotions
      alternative: {
        name: string;
        why: string;
        cost: string;
      };
    }>;
  }>;
  hiddenGems: Array<{
    name: string;
    story: string;
    whyItMatters: string;
  }>;
  mustTryFood: Array<{
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Street Food' | 'Dessert' | 'Drink';
    name: string;
    history: string;
    ingredients: string[];
    bestPlace: string;
    cost: string;
    etiquette: string;
    dietaryNotes: string;
  }>;
  culturalExperiences: Array<{
    name: string;
    description: string;
    etiquette: string;
  }>;
  localEvents: Array<{
    name: string;
    date: string;
    location: string;
    price: string;
    description: string;
  }>;
  accommodations: Array<{
    name: string;
    type: 'Heritage' | 'Boutique' | 'Eco-Lodge' | 'Homestay' | 'Local Inn';
    description: string;
    whyItFitsPhilosophy: string;
    priceRange: string;
    location: string;
    sustainableFeatures: string[];
  }>;
  budgetEstimate: {
    accommodation: number; // in USD
    food: number;          // in USD
    transport: number;     // in USD
    tickets: number;       // in USD
    shopping: number;      // in USD
    emergencyBuffer: number; // in USD
    cheaperAlternatives: string; // actionable cheaper options
  };
  localEtiquette: {
    dos: string[];
    donts: string[];
    dressCode: string;
    greetings: Array<{
      native: string;
      transliteration: string;
      meaning: string;
    }>;
    tippingCulture: string;
    scamAwareness: string;
  };
  sustainableTravelTips: string[];
  emergencyInformation: {
    police: string;
    medical: string;
    consularAdvice: string;
    usefulPhrases: Array<{
      phrase: string;
      meaning: string;
    }>;
  };
  culturalMissions: Array<{
    id: string;
    title: string;
    description: string;
    badgeName: string;
    howToAccomplish: string;
    culturalContext: string;
  }>;
  aiTravelScore: {
    score: number;
    explanation: string;
  };
  localCurrency: {
    code: string;
    symbol: string;
    name: string;
    rateToUSD: number;
  };
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON safely
    const parsedJourney = JSON.parse(responseText.trim());
    res.json(parsedJourney);
  } catch (error: any) {
    console.error('Error in /api/generate-journey:', error);
    // Clean up error message to prevent client leakage of sensitive system errors
    res.status(500).json({
      error: 'An error occurred while crafting your cultural journey. Please try again with a different destination.'
    });
  }
});

// Setup Vite Dev Server / Static serving depending on environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  
  if (process.env.NODE_ENV !== 'production') {
    import('vite').then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      }).then((vite) => {
        app.use(vite.middlewares);
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`Roamora Dev Server running on port ${PORT}`);
        });
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Roamora Server running on port ${PORT}`);
    });
  }
}

export default app;
