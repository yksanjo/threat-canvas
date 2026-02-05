import React, { useState, useCallback, useEffect } from 'react';
import {
  FiMenu,
  FiX,
  FiZap,
  FiShield,
  FiGitBranch,
  FiActivity,
  FiDownload,
  FiUsers,
  FiMoon,
  FiSun,
  FiBook,
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import Canvas from './components/Canvas';
import AIPanel from './components/AIPanel';
import STRIDEAnalysis from './components/STRIDEAnalysis';
import AttackTree from './components/AttackTree';
import RiskHeatmap from './components/RiskHeatmap';
import ExportPanel from './components/ExportPanel';
import MitrePanel from './components/MitrePanel';
import { FlowNode, FlowEdge, STRIDEThreat, AttackTree as AttackTreeType, AIAnalysisResponse } from './types';
import './styles/globals.css';

type PanelType = 'ai' | 'stride' | 'attack-tree' | 'risk' | 'mitre' | 'export' | null;

function App() {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelType>('ai');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Anonymous');
  const [modelTitle, setModelTitle] = useState('Untitled Threat Model');
  const [darkMode, setDarkMode] = useState(true);

  // Data state
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [threats, setThreats] = useState<STRIDEThreat[]>([]);
  const [attackTrees, setAttackTrees] = useState<AttackTreeType[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  // Initialize room
  useEffect(() => {
    // Get or create room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    if (room) {
      setRoomId(room);
    } else {
      const newRoomId = uuidv4().slice(0, 8);
      setRoomId(newRoomId);
      window.history.replaceState({}, '', `?room=${newRoomId}`);
    }

    // Get user name from localStorage or prompt
    const storedName = localStorage.getItem('threatCanvasUserName');
    if (storedName) {
      setUserName(storedName);
    } else {
      const name = prompt('Enter your name for collaboration:') || 'Anonymous';
      setUserName(name);
      localStorage.setItem('threatCanvasUserName', name);
    }
  }, []);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback((analysis: AIAnalysisResponse) => {
    setThreats(analysis.threats);
    setAttackTrees(analysis.attackTrees);
    
    // Update node threat counts
    const threatCounts: Record<string, number> = {};
    analysis.threats.forEach((threat) => {
      threat.affectedNodes?.forEach((nodeId) => {
        threatCounts[nodeId] = (threatCounts[nodeId] || 0) + 1;
      });
    });

    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          threatCount: threatCounts[node.id] || 0,
        },
      }))
    );
  }, []);

  // Panel content renderer
  const renderPanel = () => {
    switch (activePanel) {
      case 'ai':
        return (
          <AIPanel
            nodes={nodes}
            edges={edges}
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      case 'stride':
        return (
          <STRIDEAnalysis
            threats={threats}
            onMitreClick={(techniqueId) => {
              window.open(`https://attack.mitre.org/techniques/${techniqueId}/`, '_blank');
            }}
          />
        );
      case 'attack-tree':
        return <AttackTree trees={attackTrees} />;
      case 'risk':
        return <RiskHeatmap threats={threats} />;
      case 'mitre':
        return <MitrePanel />;
      case 'export':
        return (
          <ExportPanel
            nodes={nodes}
            edges={edges}
            threats={threats}
            attackTrees={attackTrees}
            title={modelTitle}
            author={userName}
          />
        );
      default:
        return null;
    }
  };

  const menuItems: { id: PanelType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'ai', label: 'AI Analysis', icon: FiZap },
    { id: 'stride', label: 'STRIDE Analysis', icon: FiShield, badge: threats.length },
    { id: 'attack-tree', label: 'Attack Trees', icon: FiGitBranch, badge: attackTrees.length },
    { id: 'risk', label: 'Risk Heatmap', icon: FiActivity },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: FiBook },
    { id: 'export', label: 'Export', icon: FiDownload },
  ];

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FiShield className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Threat Canvas
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Threat Modeling</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Model title */}
          <input
            type="text"
            value={modelTitle}
            onChange={(e) => setModelTitle(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
            placeholder="Model Title"
          />

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Collaboration status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
            <FiUsers className="text-cyan-400" size={16} />
            <span className="text-sm text-gray-400">Room:</span>
            <span className="text-sm text-cyan-400 font-mono">{roomId}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'w-64' : 'w-0'}
            bg-gray-900 border-r border-gray-800 transition-all duration-300 overflow-hidden
            flex flex-col
          `}
        >
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full
                      ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-3 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {userName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-300 truncate">{userName}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1 relative bg-gray-950">
          <Canvas
            roomId={roomId}
            userName={userName}
            onNodeSelect={setSelectedNode}
            onThreatsUpdate={(count) => {}}
          />
        </main>

        {/* Right panel */}
        <aside
          className={`
            ${activePanel ? 'w-96' : 'w-0'}
            bg-gray-900 border-l border-gray-800 transition-all duration-300 overflow-hidden
          `}
        >
          {activePanel && renderPanel()}
        </aside>
      </div>

      {/* Node detail modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Component Details</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <div className="text-white font-medium">{selectedNode.data.label}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                <div className="text-cyan-400 font-medium capitalize">{selectedNode.type}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <p className="text-gray-300 text-sm">{selectedNode.data.description || 'No description'}</p>
              </div>
              {selectedNode.data.threatCount !== undefined && selectedNode.data.threatCount > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Threats</label>
                  <span className="inline-flex items-center px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 text-sm">
                    {selectedNode.data.threatCount} identified threats
                  </span>
                </div>
              )}
              {selectedNode.data.assets && selectedNode.data.assets.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Assets</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.data.assets.map((asset, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded border border-gray-600"
                      >
                        {asset}
                      </span>
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
}

export default App;
