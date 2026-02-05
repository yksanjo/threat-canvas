import React, { useState } from 'react';
import { FiShield, FiLock, FiEye, FiActivity, FiUserX, FiTrendingUp, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import { STRIDEThreat, MITRETechnique } from '../types';

interface STRIDEAnalysisProps {
  threats: STRIDEThreat[];
  onMitreClick?: (techniqueId: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  Spoofing: FiUserX,
  Tampering: FiActivity,
  Repudiation: FiLock,
  InformationDisclosure: FiEye,
  DenialOfService: FiShield,
  ElevationOfPrivilege: FiTrendingUp,
};

const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
  Spoofing: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-400' },
  Tampering: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400' },
  Repudiation: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400' },
  InformationDisclosure: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400' },
  DenialOfService: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: 'text-cyan-400' },
  ElevationOfPrivilege: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400' },
};

const severityColors: Record<string, string> = {
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STRIDEAnalysis: React.FC<STRIDEAnalysisProps> = ({ threats, onMitreClick }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedThreat, setSelectedThreat] = useState<STRIDEThreat | null>(null);

  // Group threats by category
  const groupedThreats = threats.reduce((acc, threat) => {
    if (!acc[threat.category]) {
      acc[threat.category] = [];
    }
    acc[threat.category].push(threat);
    return acc;
  }, {} as Record<string, STRIDEThreat[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      Spoofing: 'Authentication threats where attackers impersonate users or systems',
      Tampering: 'Data integrity threats where attackers modify system data',
      Repudiation: 'Non-repudiation threats where actions cannot be traced',
      InformationDisclosure: 'Confidentiality threats exposing sensitive data',
      DenialOfService: 'Availability threats making systems unavailable',
      ElevationOfPrivilege: 'Authorization threats granting unauthorized access',
    };
    return descriptions[category] || '';
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiShield className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">STRIDE Analysis</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {threats.length} threats identified across {Object.keys(groupedThreats).length} categories
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Object.entries(groupedThreats).map(([category, categoryThreats]) => {
          const Icon = categoryIcons[category];
          const colors = categoryColors[category];
          const isExpanded = expandedCategories.has(category);

          return (
            <div
              key={category}
              className={`rounded-lg border ${colors.border} overflow-hidden`}
            >
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className={`w-full px-4 py-3 flex items-center justify-between ${colors.bg} hover:bg-opacity-20 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className={colors.icon} size={20} />}
                  <div className="text-left">
                    <div className="font-semibold text-white">{category}</div>
                    <div className="text-xs text-gray-400">{categoryThreats.length} threats</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Severity badges */}
                  <div className="flex gap-1">
                    {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
                      const count = categoryThreats.filter((t) => t.severity === sev).length;
                      if (count === 0) return null;
                      return (
                        <span
                          key={sev}
                          className={`px-2 py-0.5 text-[10px] rounded-full border ${severityColors[sev]}`}
                        >
                          {count} {sev[0]}
                        </span>
                      );
                    })}
                  </div>
                  {isExpanded ? (
                    <FiChevronUp className="text-gray-400" size={18} />
                  ) : (
                    <FiChevronDown className="text-gray-400" size={18} />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-3 bg-gray-900/50 space-y-2">
                  <p className="text-xs text-gray-500 mb-3">{getCategoryDescription(category)}</p>
                  
                  {categoryThreats.map((threat) => (
                    <div
                      key={threat.id}
                      onClick={() => setSelectedThreat(threat)}
                      className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{threat.description}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-[10px] rounded border flex-shrink-0 ${severityColors[threat.severity]}`}
                        >
                          {threat.severity}
                        </span>
                      </div>

                      {/* MITRE techniques */}
                      {threat.mitreTechniques.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {threat.mitreTechniques.map((technique) => (
                            <button
                              key={technique}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMitreClick?.(technique);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                            >
                              {technique}
                              <FiExternalLink size={10} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {threats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FiShield size={40} className="mx-auto mb-3 opacity-50" />
            <p>No threats analyzed yet</p>
            <p className="text-sm">Run AI analysis to identify threats</p>
          </div>
        )}
      </div>

      {/* Threat detail modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Threat Details</h3>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <span className={`inline-block px-2 py-1 text-xs rounded border ${severityColors[selectedThreat.severity]} mb-2`}>
                  {selectedThreat.severity} Severity
                </span>
                <span className={`inline-block px-2 py-1 text-xs rounded border ml-2 ${categoryColors[selectedThreat.category]?.bg} ${categoryColors[selectedThreat.category]?.border} ${categoryColors[selectedThreat.category]?.icon}`}>
                  {selectedThreat.category}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                <p className="text-gray-300">{selectedThreat.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Mitigation</h4>
                <p className="text-gray-300">{selectedThreat.mitigation}</p>
              </div>

              {selectedThreat.mitreTechniques.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">MITRE ATT&CK Techniques</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedThreat.mitreTechniques.map((technique) => (
                      <button
                        key={technique}
                        onClick={() => onMitreClick?.(technique)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                      >
                        {technique}
                        <FiExternalLink size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default STRIDEAnalysis;
