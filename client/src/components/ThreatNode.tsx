import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { FlowNode, NodeType } from '../types';

interface ThreatNodeData extends FlowNode['data'] {
  icon?: string;
}

const nodeColors: Record<NodeType, { bg: string; border: string; glow: string }> = {
  server: {
    bg: 'from-cyan-900/80 to-blue-900/80',
    border: 'border-cyan-500/50',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
  },
  database: {
    bg: 'from-purple-900/80 to-pink-900/80',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_20px_rgba(255,0,255,0.3)]',
  },
  api: {
    bg: 'from-green-900/80 to-teal-900/80',
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
  },
  client: {
    bg: 'from-orange-900/80 to-red-900/80',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_20px_rgba(255,107,53,0.3)]',
  },
  firewall: {
    bg: 'from-yellow-900/80 to-amber-900/80',
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_20px_rgba(255,193,7,0.3)]',
  },
  cloud: {
    bg: 'from-sky-900/80 to-blue-900/80',
    border: 'border-sky-500/50',
    glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]',
  },
  mobile: {
    bg: 'from-indigo-900/80 to-violet-900/80',
    border: 'border-indigo-500/50',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
  },
  iot: {
    bg: 'from-rose-900/80 to-red-900/80',
    border: 'border-rose-500/50',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
  },
};

const ThreatNode: React.FC<NodeProps<ThreatNodeData>> = ({ data, type, selected }) => {
  const colors = nodeColors[type as NodeType] || nodeColors.server;
  const threatCount = data.threatCount || 0;

  return (
    <div
      className={`
        relative min-w-[140px] max-w-[200px] rounded-lg
        bg-gradient-to-br ${colors.bg}
        border-2 ${colors.border}
        ${selected ? colors.glow : ''}
        ${selected ? 'ring-2 ring-cyan-400/50' : ''}
        backdrop-blur-sm
        transition-all duration-200
        hover:scale-105
      `}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-cyan-500 !border-2 !border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-cyan-500 !border-2 !border-gray-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-cyan-500 !border-2 !border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-cyan-500 !border-2 !border-gray-900"
      />

      {/* Threat indicator */}
      {threatCount > 0 && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold animate-pulse shadow-lg">
          {threatCount}
        </div>
      )}

      {/* Trust boundary indicator */}
      {data.trustBoundary && (
        <div className="absolute -inset-1 rounded-xl border-2 border-dashed border-yellow-500/50 pointer-events-none" />
      )}

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{data.icon}</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            {type}
          </span>
        </div>
        
        <div className="font-semibold text-white text-sm truncate" title={data.label}>
          {data.label}
        </div>
        
        {data.description && (
          <div className="mt-2 text-xs text-gray-400 line-clamp-2" title={data.description}>
            {data.description}
          </div>
        )}

        {/* Assets tags */}
        {data.assets && data.assets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {data.assets.slice(0, 2).map((asset, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 text-[9px] bg-gray-800/80 text-gray-300 rounded border border-gray-700"
              >
                {asset}
              </span>
            ))}
            {data.assets.length > 2 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-gray-800/80 text-gray-400 rounded border border-gray-700">
                +{data.assets.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ThreatNode);
