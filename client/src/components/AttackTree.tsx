import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
} from 'react-flow-renderer';
import { FiGitBranch, FiTarget, FiActivity, FiShield, FiFlag } from 'react-icons/fi';
import { AttackTree as AttackTreeType, AttackNode, NodeType } from '../types';

interface AttackTreeProps {
  trees: AttackTreeType[];
  onTreeSelect?: (tree: AttackTreeType) => void;
}

interface AttackTreeNodeData {
  label: string;
  description: string;
  type: AttackNode['type'];
  difficulty: string;
  likelihood: string;
  impact: string;
  mitreTechnique?: string;
}

const typeIcons: Record<AttackNode['type'], React.ElementType> = {
  goal: FiTarget,
  subgoal: FiFlag,
  technique: FiActivity,
  countermeasure: FiShield,
};

const typeColors: Record<AttackNode['type'], { bg: string; border: string; glow: string }> = {
  goal: {
    bg: 'from-red-900/90 to-red-800/90',
    border: 'border-red-500',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  },
  subgoal: {
    bg: 'from-orange-900/90 to-orange-800/90',
    border: 'border-orange-500',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
  },
  technique: {
    bg: 'from-cyan-900/90 to-blue-900/90',
    border: 'border-cyan-500',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
  },
  countermeasure: {
    bg: 'from-green-900/90 to-emerald-800/90',
    border: 'border-green-500',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  },
};

const difficultyColors: Record<string, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
};

const likelihoodColors: Record<string, string> = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
};

const impactColors: Record<string, string> = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
};

const AttackTreeNodeComponent: React.FC<NodeProps<AttackTreeNodeData>> = ({ data }) => {
  const Icon = typeIcons[data.type];
  const colors = typeColors[data.type];

  return (
    <div
      className={`
        min-w-[180px] max-w-[250px] rounded-lg
        bg-gradient-to-br ${colors.bg}
        border-2 ${colors.border}
        ${colors.glow}
        backdrop-blur-sm
      `}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-white/50" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-white/50" />

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Icon size={16} className="text-white/80" />
          <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
            {data.type}
          </span>
        </div>

        {/* Title */}
        <div className="font-semibold text-white text-sm mb-2 leading-tight">
          {data.label}
        </div>

        {/* Description */}
        <div className="text-xs text-white/70 mb-3 line-clamp-2">
          {data.description}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-1 text-[10px] bg-black/30 rounded p-2">
          <div className="text-center">
            <div className={`font-semibold ${difficultyColors[data.difficulty]}`}>
              {data.difficulty}
            </div>
            <div className="text-white/40">Diff</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className={`font-semibold ${likelihoodColors[data.likelihood]}`}>
              {data.likelihood}
            </div>
            <div className="text-white/40">Like</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className={`font-semibold ${impactColors[data.impact]}`}>
              {data.impact}
            </div>
            <div className="text-white/40">Imp</div>
          </div>
        </div>

        {/* MITRE Technique */}
        {data.mitreTechnique && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
              {data.mitreTechnique}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  attackNode: AttackTreeNodeComponent,
};

const AttackTreeFlow: React.FC<{ tree: AttackTreeType }> = ({ tree }) => {
  // Convert attack tree nodes to ReactFlow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node<AttackTreeNodeData>[] = [];
    const edges: Edge[] = [];

    const processNode = (node: AttackNode, level: number = 0, parentId?: string, index: number = 0) => {
      const xOffset = 220;
      const yOffset = 150;

      // Calculate position based on tree structure
      const x = level * xOffset;
      const y = parentId 
        ? (index - (node.children?.length || 0) / 2) * yOffset + (parentId ? nodes.find(n => n.id === parentId)?.position.y || 0 : 0)
        : 100;

      // Calculate actual y position for better tree layout
      const actualY = parentId
        ? (nodes.find(n => n.id === parentId)?.position.y || 0) + (index * yOffset - ((node.children?.length || 0) * yOffset) / 2)
        : 250;

      const rfNode: Node<AttackTreeNodeData> = {
        id: node.id,
        type: 'attackNode',
        position: { x, y: actualY },
        data: {
          label: node.label,
          description: node.description,
          type: node.type,
          difficulty: node.difficulty,
          likelihood: node.likelihood,
          impact: node.impact,
          mitreTechnique: node.mitreTechnique,
        },
      };

      nodes.push(rfNode);

      if (parentId) {
        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#00d4ff', strokeWidth: 2 },
        });
      }

      // Process children
      node.children?.forEach((childId, childIndex) => {
        const childNode = tree.nodes[childId];
        if (childNode) {
          processNode(childNode, level + 1, node.id, childIndex);
        }
      });
    };

    const rootNode = tree.nodes[tree.rootNodeId];
    if (rootNode) {
      processNode(rootNode, 0, undefined, 0);
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [tree]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[500px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-900 rounded-lg"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="bg-gray-800 border-gray-700" />
      </ReactFlow>
    </div>
  );
};

const AttackTree: React.FC<AttackTreeProps> = ({ trees, onTreeSelect }) => {
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const selectedTree = trees.find((t) => t.id === selectedTreeId) || trees[0];

  return (
    <div className="h-full flex flex-col bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiGitBranch className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Attack Trees</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {trees.length} attack tree{trees.length !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* Tree selector */}
      {trees.length > 1 && (
        <div className="px-4 py-3 border-b border-gray-700">
          <select
            value={selectedTreeId || trees[0]?.id}
            onChange={(e) => setSelectedTreeId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-cyan-500/50"
          >
            {trees.map((tree) => (
              <option key={tree.id} value={tree.id}>
                Attack Tree - {new Date(tree.generatedAt).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tree visualization */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedTree ? (
          <ReactFlowProvider>
            <AttackTreeFlow tree={selectedTree} />
          </ReactFlowProvider>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <FiGitBranch size={48} className="mb-4 opacity-50" />
            <p>No attack trees generated yet</p>
            <p className="text-sm mt-1">Run AI analysis to generate attack trees</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackTree;
