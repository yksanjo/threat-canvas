import React, { useState } from 'react';
import { FiZap, FiLoader, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useAI } from '../hooks/useAI';
import { FlowNode, FlowEdge, STRIDEThreat, AIAnalysisResponse } from '../types';

interface AIPanelProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onAnalysisComplete: (analysis: AIAnalysisResponse) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ nodes, edges, onAnalysisComplete }) => {
  const { isAnalyzing, error, analyze } = useAI();
  const [context, setContext] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    const analysis = await analyze({
      nodes,
      edges,
      context: context || undefined,
    });

    if (analysis) {
      setLastAnalysis(analysis);
      onAnalysisComplete(analysis);
    }
  };

  const getSeverityColor = (severity: STRIDEThreat['severity']) => {
    const colors: Record<STRIDEThreat['severity'], string> = {
      Low: 'bg-green-500/20 text-green-400 border-green-500/50',
      Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      High: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      Critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[severity];
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiZap className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">AI Threat Analysis</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Claude-powered STRIDE analysis and attack tree generation
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe your system architecture, security requirements, or specific concerns..."
            className="w-full h-24 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none text-sm"
          />
        </div>

        {/* Analysis stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-2xl font-bold text-cyan-400">{nodes.length}</div>
            <div className="text-xs text-gray-500">Components</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{edges.length}</div>
            <div className="text-xs text-gray-500">Connections</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-2xl font-bold text-green-400">
              {lastAnalysis?.threats.length || 0}
            </div>
            <div className="text-xs text-gray-500">Threats</div>
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || nodes.length === 0}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white
            transition-all duration-200
            ${isAnalyzing || nodes.length === 0
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            {isAnalyzing ? (
              <>
                <FiLoader className="animate-spin" size={18} />
                Analyzing...
              </>
            ) : (
              <>
                <FiZap size={18} />
                Generate Analysis
              </>
            )}
          </div>
        </button>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <FiAlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Results */}
        {lastAnalysis && (
          <div className="space-y-4">
            {/* Risk Score */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Overall Risk Score</div>
              <div className={`text-4xl font-bold ${getRiskScoreColor(lastAnalysis.riskScore)}`}>
                {lastAnalysis.riskScore}/100
              </div>
              <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    lastAnalysis.riskScore >= 70
                      ? 'bg-red-500'
                      : lastAnalysis.riskScore >= 40
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${lastAnalysis.riskScore}%` }}
                />
              </div>
            </div>

            {/* Threats summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Threats by Severity</h3>
              <div className="space-y-2">
                {['Critical', 'High', 'Medium', 'Low'].map((severity) => {
                  const count = lastAnalysis.threats.filter(
                    (t) => t.severity === severity
                  ).length;
                  if (count === 0) return null;
                  
                  return (
                    <div
                      key={severity}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${getSeverityColor(severity as STRIDEThreat['severity'])}`}
                    >
                      <span className="text-sm font-medium">{severity}</span>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            {lastAnalysis.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {lastAnalysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                    >
                      <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
