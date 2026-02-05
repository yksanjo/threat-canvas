// MITRE ATT&CK Types
export interface MITRETechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  platforms: string[];
  dataSources?: string[];
}

export interface MITRETactic {
  id: string;
  name: string;
  description: string;
  techniques: string[];
}

// STRIDE Types
export type STRIDECategory = 'Spoofing' | 'Tampering' | 'Repudiation' | 'InformationDisclosure' | 'DenialOfService' | 'ElevationOfPrivilege';

export interface STRIDEThreat {
  category: STRIDECategory;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string;
  mitreTechniques: string[];
}

// Node Types
export type NodeType = 'server' | 'database' | 'api' | 'client' | 'firewall' | 'cloud' | 'mobile' | 'iot';

export interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: {
    description?: string;
    trustBoundary?: boolean;
    assets?: string[];
    threatCount?: number;
  };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'trustBoundary' | 'dataFlow';
}

// Attack Tree Types
export interface AttackNode {
  id: string;
  type: 'goal' | 'subgoal' | 'technique' | 'countermeasure';
  label: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitreTechnique?: string;
  children: string[];
}

export interface AttackTree {
  id: string;
  rootNodeId: string;
  nodes: Record<string, AttackNode>;
  generatedAt: string;
}

// Collaboration Types
export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: Date;
}

export interface CollaborationRoom {
  id: string;
  name: string;
  users: Map<string, User>;
  canvasState: {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
  };
  createdAt: Date;
}

// AI Analysis Types
export interface AIAnalysisRequest {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  context?: string;
}

export interface AIAnalysisResponse {
  threats: STRIDEThreat[];
  attackTrees: AttackTree[];
  recommendations: string[];
  riskScore: number;
  generatedAt: string;
}

// Export Types
export interface ExportRequest {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  threats: STRIDEThreat[];
  attackTrees: AttackTree[];
  title: string;
  author?: string;
}

export interface PDFExportOptions {
  includeAttackTrees: boolean;
  includeMitigations: boolean;
  includeMitreMapping: boolean;
}

// WebSocket Event Types
export interface ServerToClientEvents {
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'cursor-update': (data: { userId: string; x: number; y: number }) => void;
  'node-updated': (data: { nodeId: string; updates: Partial<CanvasNode> }) => void;
  'node-added': (node: CanvasNode) => void;
  'node-removed': (nodeId: string) => void;
  'edge-added': (edge: CanvasEdge) => void;
  'edge-removed': (edgeId: string) => void;
  'canvas-sync': (state: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => void;
  'analysis-complete': (analysis: AIAnalysisResponse) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: string, userName: string) => void;
  'leave-room': (roomId: string) => void;
  'cursor-move': (data: { roomId: string; x: number; y: number }) => void;
  'update-node': (data: { roomId: string; nodeId: string; updates: Partial<CanvasNode> }) => void;
  'add-node': (data: { roomId: string; node: CanvasNode }) => void;
  'remove-node': (data: { roomId: string; nodeId: string }) => void;
  'add-edge': (data: { roomId: string; edge: CanvasEdge }) => void;
  'remove-edge': (data: { roomId: string; edgeId: string }) => void;
  'request-analysis': (data: { roomId: string; request: AIAnalysisRequest }) => void;
  'sync-request': (roomId: string) => void;
}
