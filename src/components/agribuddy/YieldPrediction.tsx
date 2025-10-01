import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Leaf,
  Brain,
  Zap,
  Eye,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import yieldPredictionService, { 
  YieldPrediction, 
  YieldPredictionInput, 
  YieldHeatmapData, 
  FieldZone,
  InfluencingFactor,
  RiskFactor,
  ActionableRecommendation
} from '@/services/yieldPredictionService';

interface YieldPredictionProps {
  farmData: any;
  cropType: string;
  onRecommendationClick?: (recommendation: ActionableRecommendation) => void;
}

const YieldPredictionComponent: React.FC<YieldPredictionProps> = ({ 
  farmData, 
  cropType, 
  onRecommendationClick 
}) => {
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [heatmapData, setHeatmapData] = useState<YieldHeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZone, setSelectedZone] = useState<FieldZone | null>(null);

  useEffect(() => {
    if (farmData && cropType) {
      generateYieldPrediction();
    }
  }, [farmData, cropType]);

  const generateYieldPrediction = async () => {
    try {
      setLoading(true);
      console.log('🔮 Generating yield prediction for:', cropType);

      const input: YieldPredictionInput = {
        farmId: farmData.id,
        cropType,
        plantingDate: new Date(farmData.plantingDate || Date.now()),
        farmSize: farmData.size || 2.5,
        soilType: farmData.soilType || 'loamy',
        irrigationSystem: farmData.irrigationSystem || 'drip',
        location: { 
          lat: farmData.latitude || 17.3850, 
          lon: farmData.longitude || 78.4867 
        },
        currentStage: farmData.currentStage || 'vegetative'
      };

      const [predictionResult, heatmapResult] = await Promise.all([
        yieldPredictionService.predictYield(input),
        yieldPredictionService.generateYieldHeatmap(input)
      ]);

      setPrediction(predictionResult);
      setHeatmapData(heatmapResult);
      console.log('✅ Yield prediction completed:', predictionResult);
    } catch (error) {
      console.error('❌ Yield prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYieldTrendData = () => {
    if (!prediction) return [];
    
    const baseYield = prediction.predictedYield;
    return [
      { month: 'Jan', yield: baseYield * 0.2, stage: 'Planting' },
      { month: 'Feb', yield: baseYield * 0.3, stage: 'Germination' },
      { month: 'Mar', yield: baseYield * 0.5, stage: 'Vegetative' },
      { month: 'Apr', yield: baseYield * 0.7, stage: 'Flowering' },
      { month: 'May', yield: baseYield * 0.9, stage: 'Grain Filling' },
      { month: 'Jun', yield: baseYield, stage: 'Harvest' }
    ];
  };

  const getFactorImpactData = () => {
    if (!prediction) return [];
    
    return prediction.keyFactors.map(factor => ({
      name: factor.factor.split(' ')[0],
      impact: factor.weight * 100,
      status: factor.impact
    }));
  };

  const getRiskColors = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };
  const getHeatmapColor = (yieldValue: number, maxYield: number) => {
    const intensity = yieldValue / maxYield;
    if (intensity > 0.8) return '#10b981'; // High yield - green
    if (intensity > 0.6) return '#84cc16'; // Good yield - lime
    if (intensity > 0.4) return '#eab308'; // Medium yield - yellow
    if (intensity > 0.2) return '#f97316'; // Low yield - orange
    return '#ef4444'; // Very low yield - red
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-lg">Analyzing multimodal data for yield prediction...</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Satellite imagery analysis</span>
              <span>Processing...</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Weather data integration</span>
              <span>Processing...</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Soil health assessment</span>
              <span>Processing...</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>ML model prediction</span>
              <span>Processing...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No yield prediction available. Please ensure farm data is complete.</p>
          <Button onClick={generateYieldPrediction} className="mt-4">
            Generate Prediction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Predicted Yield</p>
                <p className="text-2xl font-bold">{prediction.predictedYield} t/ha</p>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Confidence Score</p>
                <p className="text-2xl font-bold">{prediction.confidenceScore}%</p>
              </div>
              <Brain className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Yield Range</p>
                <p className="text-lg font-bold">
                  {prediction.yieldRange.min} - {prediction.yieldRange.max} t/ha
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Harvest Date</p>
                <p className="text-lg font-bold">
                  {prediction.harvestDate.toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Field Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="factors">Key Factors</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Model Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Model Type</span>
                    <Badge variant="secondary">{prediction.modelMetrics.modelType}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm font-medium">{prediction.modelMetrics.accuracy}%</span>
                    </div>
                    <Progress value={prediction.modelMetrics.accuracy} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Quality</span>
                      <span className="text-sm font-medium">{prediction.modelMetrics.dataQuality}%</span>
                    </div>
                    <Progress value={prediction.modelMetrics.dataQuality} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prediction.riskAssessment.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{risk.risk}</p>
                        <p className="text-xs text-gray-600">{risk.impact}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={risk.severity === 'high' ? 'destructive' : 
                                  risk.severity === 'medium' ? 'default' : 'secondary'}
                        >
                          {risk.severity}
                        </Badge>
                        <span className="text-sm font-medium">{risk.probability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Field Yield Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heatmapData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                    {heatmapData.fieldZones.map((zone, index) => {
                      const maxYield = Math.max(...heatmapData.fieldZones.map(z => z.predictedYield));
                      return (
                        <div
                          key={zone.id}
                          className="aspect-square rounded-lg border-2 border-gray-200 cursor-pointer transition-all hover:scale-105"
                          style={{ 
                            backgroundColor: getHeatmapColor(zone.predictedYield, maxYield),
                            opacity: selectedZone?.id === zone.id ? 1 : 0.8
                          }}
                          onClick={() => setSelectedZone(zone)}
                        >
                          <div className="h-full flex flex-col items-center justify-center text-white text-xs font-medium">
                            <span>{zone.predictedYield.toFixed(1)}</span>
                            <span>t/ha</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedZone && (
                    <Card className="mt-4">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Zone Details: {selectedZone.id}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Predicted Yield:</span>
                            <span className="ml-2 font-medium">{selectedZone.predictedYield} t/ha</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">{selectedZone.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">NDVI Value:</span>
                            <span className="ml-2 font-medium">{selectedZone.ndviValue.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Level:</span>
                            <Badge 
                              variant={selectedZone.riskLevel === 'high' ? 'destructive' : 
                                      selectedZone.riskLevel === 'medium' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {selectedZone.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Low Yield</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Medium Yield</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>High Yield</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Yield Progression Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getYieldTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value} t/ha`, 'Predicted Yield']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Key Influencing Factors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.keyFactors.map((factor, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{factor.factor}</h4>
                      <Badge 
                        variant={factor.impact === 'positive' ? 'default' : 
                                factor.impact === 'negative' ? 'destructive' : 'secondary'}
                      >
                        {factor.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Impact Weight</span>
                        <span>{Math.round(factor.weight * 100)}%</span>
                      </div>
                      <Progress value={factor.weight * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                      <span>Current: {(factor.currentValue || 0).toFixed(2)}</span>
                        <span>Optimal: {factor.optimalRange.min}-{factor.optimalRange.max}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Factor Impact Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getFactorImpactData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {prediction.recommendations.map((rec, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onRecommendationClick?.(rec)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 
                                  rec.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{rec.action}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.expectedImpact}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>⏱️ {rec.timeframe}</span>
                        <span>🛠️ {rec.resources.join(', ')}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {rec.priority === 'high' ? 
                        <AlertTriangle className="h-5 w-5 text-red-500" /> :
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default YieldPredictionComponent;
