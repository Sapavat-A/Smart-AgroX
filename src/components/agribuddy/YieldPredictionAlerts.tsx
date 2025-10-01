import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Target, Bell } from 'lucide-react';
import { YieldPrediction } from '@/services/yieldPredictionService';

interface YieldPredictionAlertsProps {
  prediction: YieldPrediction | null;
  onActionClick?: (action: string) => void;
}

const YieldPredictionAlerts: React.FC<YieldPredictionAlertsProps> = ({ 
  prediction, 
  onActionClick 
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!prediction) return;

    const newAlerts = [];

    // Low yield alert
    if (prediction.predictedYield < 2.0) {
      newAlerts.push({
        id: 'low_yield',
        type: 'warning',
        title: 'Low Yield Prediction',
        message: `Predicted yield of ${prediction.predictedYield} t/ha is below average`,
        severity: 'high',
        actions: ['increase_fertilization', 'improve_irrigation', 'pest_management']
      });
    }

    // Low confidence alert
    if (prediction.confidenceScore < 70) {
      newAlerts.push({
        id: 'low_confidence',
        type: 'info',
        title: 'Low Prediction Confidence',
        message: `Model confidence is ${prediction.confidenceScore}%. Consider improving data quality`,
        severity: 'medium',
        actions: ['update_farm_data', 'soil_testing']
      });
    }

    // High risk factors
    const highRisks = prediction.riskAssessment.filter(risk => risk.severity === 'high');
    if (highRisks.length > 0) {
      newAlerts.push({
        id: 'high_risks',
        type: 'danger',
        title: 'High Risk Factors Detected',
        message: `${highRisks.length} high-severity risks identified`,
        severity: 'high',
        actions: ['view_risks', 'implement_mitigation']
      });
    }

    setAlerts(newAlerts);
  }, [prediction]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`border-l-4 ${
          alert.type === 'danger' ? 'border-l-red-500 bg-red-50' :
          alert.type === 'warning' ? 'border-l-orange-500 bg-orange-50' :
          'border-l-blue-500 bg-blue-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {alert.type === 'danger' ? 
                    <AlertTriangle className="h-5 w-5 text-red-600" /> :
                    alert.type === 'warning' ? 
                    <TrendingDown className="h-5 w-5 text-orange-600" /> :
                    <Bell className="h-5 w-5 text-blue-600" />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' : 
                      alert.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {alert.severity} priority
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                {alert.actions.slice(0, 2).map((action: string) => (
                  <Button
                    key={action}
                    size="sm"
                    variant="outline"
                    onClick={() => onActionClick?.(action)}
                    className="text-xs"
                  >
                    {action.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default YieldPredictionAlerts;
