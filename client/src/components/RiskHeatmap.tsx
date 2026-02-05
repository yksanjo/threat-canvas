import React, { useMemo } from 'react';
import { FiActivity, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { STRIDEThreat } from '../types';

interface RiskHeatmapProps {
  threats: STRIDEThreat[];
}

const likelihoodValues = ['Low', 'Medium', 'High'];
const impactValues = ['Low', 'Medium', 'High'];

// Risk score calculation
const calculateRiskScore = (likelihood: string, impact: string): number => {
  const likelihoodScores: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
  const impactScores: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
  return likelihoodScores[likelihood] * impactScores[impact];
};

// Get cell color based on risk score
const getRiskColor = (score: number): string => {
  if (score >= 9) return 'bg-red-600';
  if (score >= 6) return 'bg-orange-500';
  if (score >= 4) return 'bg-yellow-500';
  if (score >= 2) return 'bg-green-500';
  return 'bg-gray-700';
};

// Get risk label
const getRiskLabel = (score: number): string => {
  if (score >= 9) return 'Critical';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Medium';
  if (score >= 2) return 'Low';
  return 'Minimal';
};

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ threats }) => {
  // Calculate risk matrix data
  const matrixData = useMemo(() => {
    const matrix: Record<string, Record<string, { threats: STRIDEThreat[]; score: number }>> = {};

    // Initialize matrix
    likelihoodValues.forEach((likelihood) => {
      matrix[likelihood] = {};
      impactValues.forEach((impact) => {
        matrix[likelihood][impact] = { threats: [], score: calculateRiskScore(likelihood, impact) };
      });
    });

    // Map severity to likelihood/impact for display purposes
    const severityToLikelihood: Record<string, string> = {
      Low: 'Low',
      Medium: 'Medium',
      High: 'High',
      Critical: 'High',
    };

    const severityToImpact: Record<string, string> = {
      Low: 'Low',
      Medium: 'Medium',
      High: 'High',
      Critical: 'High',
    };

    // Distribute threats into matrix
    threats.forEach((threat) => {
      const likelihood = severityToLikelihood[threat.severity];
      const impact = severityToImpact[threat.severity];
      
      // Add to appropriate cell (and adjacent cells for visualization)
      if (matrix[likelihood] && matrix[likelihood][impact]) {
        matrix[likelihood][impact].threats.push(threat);
      }
    });

    return matrix;
  }, [threats]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalThreats = threats.length;
    const criticalThreats = threats.filter((t) => t.severity === 'Critical').length;
    const highThreats = threats.filter((t) => t.severity === 'High').length;
    const mediumThreats = threats.filter((t) => t.severity === 'Medium').length;
    const lowThreats = threats.filter((t) => t.severity === 'Low').length;

    // Calculate average risk score
    const avgScore = totalThreats > 0
      ? threats.reduce((sum, t) => {
          const likelihood = t.severity === 'Critical' || t.severity === 'High' ? 'High' : t.severity === 'Medium' ? 'Medium' : 'Low';
          const impact = likelihood;
          return sum + calculateRiskScore(likelihood, impact);
        }, 0) / totalThreats
      : 0;

    return {
      totalThreats,
      criticalThreats,
      highThreats,
      mediumThreats,
      lowThreats,
      avgScore,
    };
  }, [threats]);

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiActivity className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Risk Heatmap</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Visual risk assessment based on likelihood and impact
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Threats</span>
              <FiShield className="text-cyan-400" size={18} />
            </div>
            <div className="text-3xl font-bold text-white mt-1">{stats.totalThreats}</div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Avg Risk Score</span>
              <FiAlertTriangle className={stats.avgScore >= 6 ? 'text-red-400' : stats.avgScore >= 4 ? 'text-orange-400' : 'text-green-400'} size={18} />
            </div>
            <div className={`text-3xl font-bold mt-1 ${stats.avgScore >= 6 ? 'text-red-400' : stats.avgScore >= 4 ? 'text-orange-400' : 'text-green-400'}`}>
              {stats.avgScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Severity distribution */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Threat Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: stats.criticalThreats, color: 'bg-red-500', textColor: 'text-red-400' },
              { label: 'High', count: stats.highThreats, color: 'bg-orange-500', textColor: 'text-orange-400' },
              { label: 'Medium', count: stats.mediumThreats, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
              { label: 'Low', count: stats.lowThreats, color: 'bg-green-500', textColor: 'text-green-400' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`text-sm ${textColor} w-16`}>{label}</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{
                      width: `${stats.totalThreats > 0 ? (count / stats.totalThreats) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Risk Matrix</h3>
          
          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 whitespace-nowrap">
              Likelihood →
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-1">
              {/* Header row */}
              <div className="text-xs text-gray-500 text-center py-2">Impact →</div>
              {impactValues.map((impact) => (
                <div key={impact} className="text-xs text-gray-400 text-center py-2 font-medium">
                  {impact}
                </div>
              ))}

              {/* Data rows */}
              {likelihoodValues.map((likelihood) => (
                <React.Fragment key={likelihood}>
                  <div className="text-xs text-gray-400 text-center py-3 font-medium">
                    {likelihood}
                  </div>
                  {impactValues.map((impact) => {
                    const cell = matrixData[likelihood]?.[impact];
                    const threatCount = cell?.threats.length || 0;
                    const score = cell?.score || 0;

                    return (
                      <div
                        key={`${likelihood}-${impact}`}
                        className={`
                          relative aspect-square rounded-lg border border-gray-700
                          flex flex-col items-center justify-center
                          transition-all duration-200 hover:scale-105 cursor-pointer
                          ${getRiskColor(score)}
                          ${threatCount > 0 ? 'ring-2 ring-white/20' : ''}
                        `}
                      >
                        {threatCount > 0 && (
                          <>
                            <span className="text-2xl font-bold text-white drop-shadow-lg">
                              {threatCount}
                            </span>
                            <span className="text-[10px] text-white/80">
                              threats
                            </span>
                          </>
                        )}
                        
                        {/* Tooltip */}
                        {threatCount > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                            <span className="text-[10px] text-white font-medium px-2 text-center">
                              {getRiskLabel(score)} Risk
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-400">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-gray-400">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-gray-400">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-600" />
              <span className="text-gray-400">Critical</span>
            </div>
          </div>
        </div>

        {/* STRIDE category breakdown */}
        {threats.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Threats by Category</h3>
            <div className="space-y-2">
              {Object.entries(
                threats.reduce((acc, threat) => {
                  acc[threat.category] = (acc[threat.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-400">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(count / threats.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-cyan-400 font-medium w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskHeatmap;
