// Node Types
export type NodeType = 'server' | 'database' | 'api' | 'client' | 'firewall' | 'cloud' | 'mobile' | 'iot';

export interface NodeData {
  label: string;
  description?: string;
  trustBoundary?: boolean;
  assets?: string[];
  threatCount?: number;
  icon?: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'trustBoundary' | 'dataFlow';
  animated?: boolean;
}

// STRIDE Types
export type STRIDECategory = 'Spoofing' | 'Tampering' | 'Repudiation' | 'InformationDisclosure' | 'DenialOfService' | 'ElevationOfPrivilege';

export interface STRIDEThreat {
  id: string;
  category: STRIDECategory;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string;
  mitreTechniques: string[];
  affectedNodes?: string[];
}

// MITRE ATT&CK Types
export interface MITRETechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  platforms: string[];
  dataSources?: string[];
  url?: string;
}

export interface MITRETactic {
  id: string;
  name: string;
  description: string;
  techniques: string[];
}

// Attack Tree Types
export type AttackNodeType = 'goal' | 'subgoal' | 'technique' | 'countermeasure';

export interface AttackNode {
  id: string;
  type: AttackNodeType;
  label: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitreTechnique?: string;
  children: string[];
  parent?: string;
}

export interface AttackTree {
  id: string;
  rootNodeId: string;
  nodes: Record<string, AttackNode>;
  generatedAt: string;
  targetNode?: string;
}

// Collaboration Types
export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isOnline: boolean;
}

// AI Analysis Types
export interface AIAnalysisRequest {
  nodes: FlowNode[];
  edges: FlowEdge[];
  context?: string;
}

export interface AIAnalysisResponse {
  threats: STRIDEThreat[];
  attackTrees: AttackTree[];
  recommendations: string[];
  riskScore: number;
  generatedAt: string;
}

// Canvas State
export interface CanvasState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
}

// UI State
export interface UIState {
  sidebarOpen: boolean;
  activePanel: 'threats' | 'attack-tree' | 'mitre' | 'collaboration' | null;
  darkMode: boolean;
  showGrid: boolean;
  zoom: number;
}

// Export Types
export interface ExportData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  threats: STRIDEThreat[];
  attackTrees: AttackTree[];
  title: string;
  author?: string;
  createdAt?: string;
}

// Tool Types
export type ToolType = 'select' | 'pan' | 'server' | 'database' | 'api' | 'client' | 'firewall' | 'cloud' | 'mobile' | 'iot' | 'connect';

// Risk Heatmap Data
export interface RiskHeatmapCell {
  x: string;
  y: string;
  value: number;
  threats: STRIDEThreat[];
}

export interface RiskMatrixData {
  likelihood: string[];
  impact: string[];
  cells: RiskHeatmapCell[];
}
