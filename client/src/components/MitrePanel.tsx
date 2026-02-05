import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiSearch, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { MITRETechnique, MITRETactic } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface MitrePanelProps {
  onTechniqueSelect?: (technique: MITRETechnique) => void;
}

const MitrePanel: React.FC<MitrePanelProps> = ({ onTechniqueSelect }) => {
  const [tactics, setTactics] = useState<MITRETactic[]>([]);
  const [techniques, setTechniques] = useState<MITRETechnique[]>([]);
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTactics();
    fetchTechniques();
  }, []);

  const fetchTactics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/mitre/tactics`);
      setTactics(response.data);
    } catch (error) {
      console.error('Failed to fetch tactics:', error);
    }
  };

  const fetchTechniques = async (tacticId?: string) => {
    try {
      setLoading(true);
      const url = tacticId
        ? `${API_URL}/api/mitre/techniques?tactic=${tacticId}`
        : `${API_URL}/api/mitre/techniques`;
      const response = await axios.get(url);
      setTechniques(response.data);
    } catch (error) {
      console.error('Failed to fetch techniques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTacticChange = (tacticId: string) => {
    setSelectedTactic(tacticId);
    fetchTechniques(tacticId);
  };

  const filteredTechniques = techniques.filter(
    (tech) =>
      tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiShield className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">MITRE ATT&CK</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Threat intelligence framework reference
        </p>
      </div>

      {/* Search and filter */}
      <div className="p-4 space-y-3 border-b border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search techniques..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 text-sm"
          />
        </div>

        <select
          value={selectedTactic || ''}
          onChange={(e) => handleTacticChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">All Tactics</option>
          {tactics.map((tactic) => (
            <option key={tactic.id} value={tactic.id}>
              {tactic.name}
            </option>
          ))}
        </select>
      </div>

      {/* Techniques list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
            Loading techniques...
          </div>
        ) : filteredTechniques.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiShield size={40} className="mx-auto mb-3 opacity-50" />
            <p>No techniques found</p>
          </div>
        ) : (
          filteredTechniques.map((technique) => (
            <div
              key={technique.id}
              onClick={() => onTechniqueSelect?.(technique)}
              className="group p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400">{technique.id}</span>
                    <span className="text-xs text-gray-500">{technique.tactic}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white mt-1 group-hover:text-cyan-400 transition-colors">
                    {technique.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {technique.description}
                  </p>
                  
                  {technique.platforms && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {technique.platforms.slice(0, 3).map((platform) => (
                        <span
                          key={platform}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700"
                        >
                          {platform}
                        </span>
                      ))}
                      {technique.platforms.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">
                          +{technique.platforms.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <a
                  href={`https://attack.mitre.org/techniques/${technique.id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-700 bg-gray-900/30">
        <p className="text-xs text-gray-500 text-center">
          MITRE ATT&CK® is a globally-accessible knowledge base of adversary tactics and techniques
        </p>
      </div>
    </div>
  );
};

export default MitrePanel;
