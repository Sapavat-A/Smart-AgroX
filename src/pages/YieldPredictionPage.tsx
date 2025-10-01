import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Sprout, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFarms } from '@/lib/firestore';
import YieldPredictionComponent from '@/components/agribuddy/YieldPrediction';
import MainLayout from '@/components/layout/MainLayout';

const YieldPredictionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFarms();
  }, [currentUser]);

  const loadFarms = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userFarms = await getUserFarms(currentUser.uid);
      setFarms(userFarms);
      
      if (userFarms.length > 0) {
        setSelectedFarm(userFarms[0]);
        setSelectedCrop(userFarms[0].cropType || 'rice');
      }
    } catch (err) {
      console.error('Error loading farms:', err);
      setError('Failed to load farm data');
    } finally {
      setLoading(false);
    }
  };

  const handleFarmChange = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      setSelectedFarm(farm);
      setSelectedCrop(farm.cropType || 'rice');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading farm data...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || farms.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-lg font-semibold mb-2">No Farm Data Available</h3>
              <p className="text-gray-600 mb-4">
                {error || 'Please add farm data to generate yield predictions.'}
              </p>
              <Button onClick={() => window.location.href = '/farm'}>
                Manage Farms
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <Sprout className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔮 YieldX Predictor
              </h1>
              <p className="text-gray-600">
                AI-Powered Yield Forecasting with Multimodal Data Analysis
              </p>
            </div>
          </div>

          {/* Farm and Crop Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Select Farm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedFarm?.id || ''} onValueChange={handleFarmChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        <div className="flex items-center space-x-2">
                          <span>{farm.name || `Farm ${farm.id.slice(0, 6)}`}</span>
                          <Badge variant="outline" className="text-xs">
                            {farm.cropType || 'Mixed'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Sprout className="h-4 w-4 mr-2" />
                  Select Crop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">🌾 Rice</SelectItem>
                    <SelectItem value="wheat">🌾 Wheat</SelectItem>
                    <SelectItem value="corn">🌽 Corn</SelectItem>
                    <SelectItem value="tomato">🍅 Tomato</SelectItem>
                    <SelectItem value="potato">🥔 Potato</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Current Selection Info */}
          {selectedFarm && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-green-800">
                      Analyzing: {selectedFarm.name || `Farm ${selectedFarm.id.slice(0, 6)}`}
                    </h3>
                    <p className="text-sm text-green-600">
                      Crop: {selectedCrop} • Size: {selectedFarm.size || '2.5'} hectares • 
                      Location: {selectedFarm.location || 'Hyderabad, India'}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Ready for Prediction
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Yield Prediction Component */}
        {selectedFarm && (
          <YieldPredictionComponent
            farmData={selectedFarm}
            cropType={selectedCrop}
            onRecommendationClick={(recommendation) => {
              console.log('Recommendation clicked:', recommendation);
              // Handle recommendation click - could navigate to relevant section
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default YieldPredictionPage;
