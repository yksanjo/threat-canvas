import React, { useState } from 'react';
import { FiDownload, FiFileText, FiCode, FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from 'axios';
import { FlowNode, FlowEdge, STRIDEThreat, AttackTree } from '../types';

interface ExportPanelProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  threats: STRIDEThreat[];
  attackTrees: AttackTree[];
  title: string;
  author: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ExportPanel: React.FC<ExportPanelProps> = ({
  nodes,
  edges,
  threats,
  attackTrees,
  title,
  author,
}) => {
  const [isExporting, setIsExporting] = useState<'pdf' | 'json' | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    setExportStatus('idle');

    try {
      const response = await axios.post(
        `${API_URL}/api/export/pdf`,
        {
          nodes,
          edges,
          threats,
          attackTrees,
          title,
          author,
        },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_threat_model.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportStatus('success');
    } catch (error) {
      console.error('PDF export error:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting('json');
    setExportStatus('idle');

    try {
      const response = await axios.post(
        `${API_URL}/api/export/json`,
        {
          nodes,
          edges,
          threats,
          attackTrees,
          title,
          author,
        }
      );

      // Create download link
      const jsonStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_threat_model.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportStatus('success');
    } catch (error) {
      console.error('JSON export error:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(null);
    }
  };

  const stats = [
    { label: 'Components', value: nodes.length, icon: FiFileText },
    { label: 'Threats', value: threats.length, icon: FiCheckCircle },
    { label: 'Attack Trees', value: attackTrees.length, icon: FiCode },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiDownload className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Export</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Export your threat model to various formats
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700">
              <Icon className="mx-auto mb-1 text-gray-500" size={16} />
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-[10px] text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Export options */}
        <div className="space-y-3">
          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            className="w-full p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <FiFileText className="text-red-400" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-white">Export as PDF</div>
                <div className="text-xs text-gray-400">Professional threat model report</div>
              </div>
              {isExporting === 'pdf' ? (
                <FiLoader className="text-cyan-400 animate-spin" size={20} />
              ) : (
                <FiDownload className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
              )}
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            disabled={isExporting !== null}
            className="w-full p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <FiCode className="text-blue-400" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-white">Export as JSON</div>
                <div className="text-xs text-gray-400">Machine-readable format</div>
              </div>
              {isExporting === 'json' ? (
                <FiLoader className="text-cyan-400 animate-spin" size={20} />
              ) : (
                <FiDownload className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
              )}
            </div>
          </button>
        </div>

        {/* Export status */}
        {exportStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            <FiCheckCircle size={16} />
            Export completed successfully!
          </div>
        )}
        {exportStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <FiXCircle size={16} />
            Export failed. Please try again.
          </div>
        )}

        {/* What's included */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">What's Included</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              System architecture diagram
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              STRIDE threat analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Attack tree visualizations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              Risk assessment summary
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              Mitigation recommendations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
