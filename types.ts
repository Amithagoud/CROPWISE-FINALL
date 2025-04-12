export interface ClimateData {
  temperature: number;
  rainfall: number;
  humidity: number;
  month: string;
}

export interface MonthlyClimate {
  temperature: number;
  rainfall: number;
  humidity: number;
  suitableCrops: string[];
  season: string;
}

export interface Crop {
  id: string;
  name: string;
  season: string;
  growthDuration: string;
  idealTemperature: string;
  waterRequirement: string;
  soilPreference: string[];
}

export interface SoilType {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

export interface PlantingRecommendation {
  bestTime: string;
  confidence: number;
  expectedYield: number;
  recommendations: string[];
}