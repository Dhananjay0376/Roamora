export interface TravelParams {
  destination: string;
  duration: number;
  travelers: number;
  ageGroup: string;
  budget: 'budget' | 'moderate' | 'luxury';
  travelStyle: string[];
  physicalLimitations: string;
  languagesKnown: string;
  dietaryRestrictions: string;
  accessibilityRequirements: string;
  transportationPreference: string;
  interests: string[]; // ranked highest to lowest
  preferredCurrency?: string;
}

export interface Experience {
  name: string;
  whyItMatters: string;
  timeSlot: string; // Specific time-to-time schedule (e.g. "09:00 - 11:30")
  timeNeeded: string;
  bestTime: string;
  cost: string;
  difficulty: string;
  authenticityScore: number;
  crowdScore: number;
  photographyScore: number;
  familyFriendly: boolean;
  accessibility: string;
  storytelling: string;
  alternative: {
    name: string;
    why: string;
    cost: string;
  };
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  experiences: Experience[];
}

export interface HiddenGem {
  name: string;
  story: string;
  whyItMatters: string;
}

export interface FoodItem {
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Street Food' | 'Dessert' | 'Drink';
  name: string;
  history: string;
  ingredients: string[];
  bestPlace: string;
  cost: string;
  etiquette: string;
  dietaryNotes: string;
}

export interface CulturalExperience {
  name: string;
  description: string;
  etiquette: string;
}

export interface LocalEvent {
  name: string;
  date: string;
  location: string;
  price: string;
  description: string;
}

export interface BudgetEstimate {
  accommodation: number;
  food: number;
  transport: number;
  tickets: number;
  shopping: number;
  emergencyBuffer: number;
  cheaperAlternatives: string;
}

export interface Greeting {
  native: string;
  transliteration: string;
  meaning: string;
}

export interface LocalEtiquette {
  dos: string[];
  donts: string[];
  dressCode: string;
  greetings: Greeting[];
  tippingCulture: string;
  scamAwareness: string;
}

export interface EmergencyPhrase {
  phrase: string;
  meaning: string;
}

export interface EmergencyInformation {
  police: string;
  medical: string;
  consularAdvice: string;
  usefulPhrases: EmergencyPhrase[];
}

export interface CulturalMission {
  id: string;
  title: string;
  description: string;
  badgeName: string;
  howToAccomplish: string;
  culturalContext: string;
}

export interface Accommodation {
  name: string;
  type: 'Heritage' | 'Boutique' | 'Eco-Lodge' | 'Homestay' | 'Local Inn';
  description: string;
  whyItFitsPhilosophy: string;
  priceRange: string;
  location: string;
  sustainableFeatures: string[];
}

export interface AiTravelScore {
  score: number;
  explanation: string;
}

export interface LocalCurrency {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number;
}

export interface JourneyResponse {
  overview: string;
  summary: string;
  itinerary: DayPlan[];
  hiddenGems: HiddenGem[];
  mustTryFood: FoodItem[];
  culturalExperiences: CulturalExperience[];
  localEvents: LocalEvent[];
  accommodations: Accommodation[];
  budgetEstimate: BudgetEstimate;
  localEtiquette: LocalEtiquette;
  sustainableTravelTips: string[];
  emergencyInformation: EmergencyInformation;
  culturalMissions: CulturalMission[];
  aiTravelScore: AiTravelScore;
  localCurrency?: LocalCurrency;
}
