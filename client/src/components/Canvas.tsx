import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
} from 'react-flow-renderer';
import { v4 as uuidv4 } from 'uuid';
import { FlowNode, FlowEdge, ToolType, NodeType } from '../types';
import ThreatNode from './ThreatNode';
import Toolbar from './Toolbar';
import CollaborationCursors from './CollaborationCursors';
import { useWebSocket } from '../hooks/useWebSocket';

import 'react-flow-renderer/dist/style.css';

const nodeTypes = {
  server: ThreatNode,
  database: ThreatNode,
  api: ThreatNode,
  client: ThreatNode,
  firewall: ThreatNode,
  cloud: ThreatNode,
  mobile: ThreatNode,
  iot: ThreatNode,
};

const getNodeIcon = (type: NodeType): string => {
  const icons: Record<NodeType, string> = {
    server: '🖥️',
    database: '🗄️',
    api: '🔌',
    client: '💻',
    firewall: '🛡️',
    cloud: '☁️',
    mobile: '📱',
    iot: '📟',
  };
  return icons[type];
};

interface CanvasProps {
  roomId: string | null;
  userName: string;
  onNodeSelect: (node: FlowNode | null) => void;
  onThreatsUpdate: (threatCount: number) => void;
}

const FlowCanvas: React.FC<CanvasProps> = ({ roomId, userName, onNodeSelect, onThreatsUpdate }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const { project, fitView } = useReactFlow();
  
  const {
    isConnected,
    collaborators,
    updateCursor,
    addNode: wsAddNode,
    updateNode: wsUpdateNode,
    removeNode: wsRemoveNode,
    addEdge: wsAddEdge,
    removeEdge: wsRemoveEdge,
    onCanvasSync,
    onNodeAdded,
    onNodeUpdated,
    onNodeRemoved,
    onEdgeAdded,
    onEdgeRemoved,
  } = useWebSocket(roomId, userName);

  // Handle WebSocket events
  useEffect(() => {
    const cleanupSync = onCanvasSync((state) => {
      setNodes(state.nodes.map(n => ({ ...n, data: { ...n.data, icon: getNodeIcon(n.type as NodeType) } })));
      setEdges(state.edges);
    });

    const cleanupNodeAdded = onNodeAdded((node) => {
      setNodes((nds) => [...nds.filter(n => n.id !== node.id), { ...node, data: { ...node.data, icon: getNodeIcon(node.type as NodeType) } }]);
    });

    const cleanupNodeUpdated = onNodeUpdated(({ nodeId, updates }) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
      );
    });

    const cleanupNodeRemoved = onNodeRemoved((nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    });

    const cleanupEdgeAdded = onEdgeAdded((edge) => {
      setEdges((eds) => addEdge(edge, eds));
    });

    const cleanupEdgeRemoved = onEdgeRemoved((edgeId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    });

    return () => {
      cleanupSync?.();
      cleanupNodeAdded?.();
      cleanupNodeUpdated?.();
      cleanupNodeRemoved?.();
      cleanupEdgeAdded?.();
      cleanupEdgeRemoved?.();
    };
  }, [onCanvasSync, onNodeAdded, onNodeUpdated, onNodeRemoved, onEdgeAdded, onEdgeRemoved]);

  // Track cursor position
  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (reactFlowWrapper.current) {
        const { left, top } = reactFlowWrapper.current.getBoundingClientRect();
        const position = project({
          x: event.clientX - left,
          y: event.clientY - top,
        });
        updateCursor(position.x, position.y);
      }
    },
    [project, updateCursor]
  );

  // Handle connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const edge: FlowEdge = {
        id: uuidv4(),
        source: connection.source!,
        target: connection.target!,
        label: 'data flow',
        animated: true,
      };
      setEdges((eds) => addEdge(edge, eds));
      wsAddEdge(edge);
    },
    [setEdges, wsAddEdge]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseNodeEvent, node: Node) => {
      if (activeTool === 'select') {
        onNodeSelect(node as FlowNode);
      }
    },
    [activeTool, onNodeSelect]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Drop new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current && activeTool !== 'select' && activeTool !== 'pan' && activeTool !== 'connect') {
        const { left, top } = reactFlowWrapper.current.getBoundingClientRect();
        const position = project({
          x: event.clientX - left,
          y: event.clientY - top,
        });

        const newNode: FlowNode = {
          id: uuidv4(),
          type: activeTool as NodeType,
          position,
          data: {
            label: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${nodes.length + 1}`,
            description: '',
            trustBoundary: false,
            threatCount: 0,
            icon: getNodeIcon(activeTool as NodeType),
          },
        };

        setNodes((nds) => [...nds, newNode]);
        wsAddNode(newNode);
      }
    },
    [activeTool, nodes.length, project, setNodes, wsAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drag stop (sync position)
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      wsUpdateNode(node.id, { position: node.position });
    },
    [wsUpdateNode]
  );

  // Handle node removal
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => {
        wsRemoveNode(node.id);
      });
    },
    [wsRemoveNode]
  );

  // Handle edge removal
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((edge) => {
        wsRemoveEdge(edge.id);
      });
    },
    [wsRemoveEdge]
  );

  return (
    <div className="relative w-full h-full">
      <div
        ref={reactFlowWrapper}
        className="w-full h-full"
        onMouseMove={onMouseMove}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStop={onNodeDragStop}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-900"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-gray-800 border-gray-700" />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === 'server') return '#00d4ff';
              if (n.type === 'database') return '#ff00ff';
              return '#00ff88';
            }}
            nodeColor={(n) => {
              if (n.type === 'server') return '#0a1628';
              if (n.type === 'database') return '#1a0a28';
              return '#0a2816';
            }}
            className="bg-gray-800 border-gray-700"
          />
          <Panel position="top-left" className="m-4">
            <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
          </Panel>
          <Panel position="top-right" className="m-4">
            <div className="bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-300">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {collaborators.filter(c => c.isOnline).length} online
              </div>
            </div>
          </Panel>
        </ReactFlow>
        <CollaborationCursors collaborators={collaborators} />
      </div>
    </div>
  );
};

const Canvas: React.FC<CanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default Canvas;
