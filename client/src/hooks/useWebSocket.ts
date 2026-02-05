import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FlowNode, FlowEdge, Collaborator, AIAnalysisRequest, AIAnalysisResponse } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

interface ServerToClientEvents {
  'user-joined': (user: Collaborator) => void;
  'user-left': (userId: string) => void;
  'cursor-update': (data: { userId: string; x: number; y: number }) => void;
  'node-updated': (data: { nodeId: string; updates: Partial<FlowNode> }) => void;
  'node-added': (node: FlowNode) => void;
  'node-removed': (nodeId: string) => void;
  'edge-added': (edge: FlowEdge) => void;
  'edge-removed': (edgeId: string) => void;
  'canvas-sync': (state: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  'analysis-complete': (analysis: AIAnalysisResponse) => void;
  'error': (message: string) => void;
}

interface ClientToServerEvents {
  'join-room': (roomId: string, userName: string) => void;
  'leave-room': (roomId: string) => void;
  'cursor-move': (data: { roomId: string; x: number; y: number }) => void;
  'update-node': (data: { roomId: string; nodeId: string; updates: Partial<FlowNode> }) => void;
  'add-node': (data: { roomId: string; node: FlowNode }) => void;
  'remove-node': (data: { roomId: string; nodeId: string }) => void;
  'add-edge': (data: { roomId: string; edge: FlowEdge }) => void;
  'remove-edge': (data: { roomId: string; edgeId: string }) => void;
  'request-analysis': (data: { roomId: string; request: AIAnalysisRequest }) => void;
  'sync-request': (roomId: string) => void;
}

export function useWebSocket(roomId: string | null, userName: string) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      setError(null);
      socket.emit('join-room', roomId, userName);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to collaboration server');
      setIsConnected(false);
    });

    socket.on('user-joined', (user: Collaborator) => {
      setCollaborators((prev) => [...prev.filter((c) => c.id !== user.id), { ...user, isOnline: true }]);
    });

    socket.on('user-left', (userId: string) => {
      setCollaborators((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, isOnline: false } : c))
      );
    });

    socket.on('cursor-update', ({ userId, x, y }) => {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === userId ? { ...c, cursor: { x, y }, isOnline: true } : c
        )
      );
    });

    socket.on('error', (message: string) => {
      setError(message);
    });

    return () => {
      socket.emit('leave-room', roomId);
      socket.disconnect();
    };
  }, [roomId, userName]);

  const updateCursor = useCallback((x: number, y: number) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('cursor-move', { roomId, x, y });
    }
  }, [roomId, isConnected]);

  const addNode = useCallback((node: FlowNode) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('add-node', { roomId, node });
    }
  }, [roomId, isConnected]);

  const updateNode = useCallback((nodeId: string, updates: Partial<FlowNode>) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('update-node', { roomId, nodeId, updates });
    }
  }, [roomId, isConnected]);

  const removeNode = useCallback((nodeId: string) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('remove-node', { roomId, nodeId });
    }
  }, [roomId, isConnected]);

  const addEdge = useCallback((edge: FlowEdge) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('add-edge', { roomId, edge });
    }
  }, [roomId, isConnected]);

  const removeEdge = useCallback((edgeId: string) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('remove-edge', { roomId, edgeId });
    }
  }, [roomId, isConnected]);

  const requestAnalysis = useCallback((request: AIAnalysisRequest) => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('request-analysis', { roomId, request });
    }
  }, [roomId, isConnected]);

  const requestSync = useCallback(() => {
    if (socketRef.current && isConnected && roomId) {
      socketRef.current.emit('sync-request', roomId);
    }
  }, [roomId, isConnected]);

  const onCanvasSync = useCallback((callback: (state: { nodes: FlowNode[]; edges: FlowEdge[] }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('canvas-sync', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('canvas-sync', callback);
      }
    };
  }, []);

  const onNodeAdded = useCallback((callback: (node: FlowNode) => void) => {
    if (socketRef.current) {
      socketRef.current.on('node-added', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('node-added', callback);
      }
    };
  }, []);

  const onNodeUpdated = useCallback((callback: (data: { nodeId: string; updates: Partial<FlowNode> }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('node-updated', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('node-updated', callback);
      }
    };
  }, []);

  const onNodeRemoved = useCallback((callback: (nodeId: string) => void) => {
    if (socketRef.current) {
      socketRef.current.on('node-removed', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('node-removed', callback);
      }
    };
  }, []);

  const onEdgeAdded = useCallback((callback: (edge: FlowEdge) => void) => {
    if (socketRef.current) {
      socketRef.current.on('edge-added', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('edge-added', callback);
      }
    };
  }, []);

  const onEdgeRemoved = useCallback((callback: (edgeId: string) => void) => {
    if (socketRef.current) {
      socketRef.current.on('edge-removed', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('edge-removed', callback);
      }
    };
  }, []);

  const onAnalysisComplete = useCallback((callback: (analysis: AIAnalysisResponse) => void) => {
    if (socketRef.current) {
      socketRef.current.on('analysis-complete', callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('analysis-complete', callback);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    collaborators,
    error,
    updateCursor,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    requestAnalysis,
    requestSync,
    onCanvasSync,
    onNodeAdded,
    onNodeUpdated,
    onNodeRemoved,
    onEdgeAdded,
    onEdgeRemoved,
    onAnalysisComplete,
  };
}
