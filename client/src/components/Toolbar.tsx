import React from 'react';
import {
  FiMousePointer,
  FiHand,
  FiServer,
  FiDatabase,
  FiCloud,
  FiSmartphone,
  FiCpu,
  FiGlobe,
  FiShield,
  FiLink,
} from 'react-icons/fi';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const tools: { id: ToolType; icon: React.ElementType; label: string; category: 'navigation' | 'nodes' | 'connection' }[] = [
  { id: 'select', icon: FiMousePointer, label: 'Select', category: 'navigation' },
  { id: 'pan', icon: FiHand, label: 'Pan', category: 'navigation' },
  { id: 'server', icon: FiServer, label: 'Server', category: 'nodes' },
  { id: 'database', icon: FiDatabase, label: 'Database', category: 'nodes' },
  { id: 'api', icon: FiLink, label: 'API', category: 'nodes' },
  { id: 'client', icon: FiGlobe, label: 'Client', category: 'nodes' },
  { id: 'firewall', icon: FiShield, label: 'Firewall', category: 'nodes' },
  { id: 'cloud', icon: FiCloud, label: 'Cloud', category: 'nodes' },
  { id: 'mobile', icon: FiSmartphone, label: 'Mobile', category: 'nodes' },
  { id: 'iot', icon: FiCpu, label: 'IoT', category: 'nodes' },
  { id: 'connect', icon: FiLink, label: 'Connect', category: 'connection' },
];

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange }) => {
  const handleToolClick = (toolId: ToolType) => {
    onToolChange(toolId);
  };

  const handleDragStart = (event: React.DragEvent, toolId: ToolType) => {
    if (toolId !== 'select' && toolId !== 'pan' && toolId !== 'connect') {
      event.dataTransfer.setData('application/reactflow', toolId);
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const categories = ['navigation', 'nodes', 'connection'] as const;
  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    nodes: 'Components',
    connection: 'Connection',
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      {categories.map((category, catIndex) => (
        <div key={category}>
          {catIndex > 0 && <div className="h-px bg-gray-700" />}
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {categoryLabels[category]}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {tools
                .filter((tool) => tool.category === category)
                .map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      onDragStart={(e) => handleDragStart(e, tool.id)}
                      draggable={tool.category === 'nodes'}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-lg
                        transition-all duration-200 min-w-[60px]
                        ${isActive
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                          : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        }
                      `}
                      title={tool.label}
                    >
                      <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : ''} />
                      <span className="text-[10px] mt-1 font-medium">{tool.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toolbar;
