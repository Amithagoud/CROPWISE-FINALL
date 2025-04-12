import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane as Plant } from 'lucide-react';
import { ClimateDisplay } from './components/ClimateDisplay';
import { CropSelector } from './components/CropSelector';
import { SoilSelector } from './components/SoilSelector';
import { YieldInput } from './components/YieldInput';
import { AIChat } from './components/AIChat';
import { DiseaseDetection } from './components/DiseaseDetection';
import { DroneManagement } from './components/DroneManagement';
import { LanguageSelector } from './components/LanguageSelector';
import { monthlyClimate } from './data/monthlyClimate';
import { crops } from './data/crops';
import { soilTypes } from './data/soilTypes';
import './i18n';

function App() {
  const { t } = useTranslation();
  const [selectedSoil, setSelectedSoil] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [desiredYield, setDesiredYield] = useState(10);
  const [recommendation, setRecommendation] = useState<{
    bestTime: string;
    confidence: number;
    expectedYield: number;
    recommendations: string[];
  } | null>(null);

  const getRecommendation = () => {
    const suitableMonths = Object.entries(monthlyClimate)
      .filter(([_, data]) => data.suitableCrops.includes(selectedCrop))
      .map(([month]) => month);

    // Enhanced prediction logic
    const crop = crops.find(c => c.id === selectedCrop);
    const soil = soilTypes.find(s => s.id === selectedSoil);
    
    const soilSuitability = crop?.soilPreference.includes(selectedSoil) ? 1 : 0.8;
    const seasonalYieldFactor = suitableMonths.length > 3 ? 1 : 0.9;
    const expectedYield = desiredYield * soilSuitability * seasonalYieldFactor;
    
    const confidence = Math.round(
      (soilSuitability * 40 + seasonalYieldFactor * 40 + (suitableMonths.length / 12) * 20)
    );

    setRecommendation({
      bestTime: suitableMonths.join(', '),
      confidence,
      expectedYield,
      recommendations: [
        `Best planting months: ${suitableMonths.join(', ')}`,
        'Prepare soil 2 weeks before planting',
        'Ensure proper irrigation system',
        'Monitor soil moisture regularly',
        ...(soil?.characteristics.map(char => `Utilize ${char}`) || [])
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Plant className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
              {t('appName')}
            </h1>
          </div>
          <LanguageSelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 backdrop-blur-lg bg-opacity-90">
              <ClimateDisplay />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 backdrop-blur-lg bg-opacity-90">
              <CropSelector selectedCrop={selectedCrop} onSelect={setSelectedCrop} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 backdrop-blur-lg bg-opacity-90">
              <SoilSelector selectedSoil={selectedSoil} onSelect={setSelectedSoil} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 backdrop-blur-lg bg-opacity-90">
              <YieldInput desiredYield={desiredYield} onYieldChange={setDesiredYield} />
            </div>

            <DroneManagement />

            <DiseaseDetection />

            <button
              onClick={getRecommendation}
              disabled={!selectedSoil || !selectedCrop}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-sm"
            >
              {t('recommendations.getButton')}
            </button>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <AIChat />
            
            {recommendation && (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8 backdrop-blur-lg bg-opacity-90">
                <h2 className="text-xl font-semibold mb-4">{t('recommendations.title')}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('recommendations.bestTime')}</p>
                    <p className="font-semibold text-lg">{recommendation.bestTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('recommendations.confidence')}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${recommendation.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{recommendation.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('recommendations.expectedYield')}</p>
                    <p className="font-semibold">{recommendation.expectedYield.toFixed(1)} tons/ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{t('recommendations.keyRecommendations')}</p>
                    <ul className="space-y-2">
                      {recommendation.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;