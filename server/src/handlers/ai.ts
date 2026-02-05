import Anthropic from '@anthropic-ai/sdk';
import { 
  AIAnalysisRequest, 
  AIAnalysisResponse, 
  STRIDEThreat, 
  AttackTree,
  STRIDECategory 
} from '../types';

export class AIHandler {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async analyzeThreats(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.anthropic) {
      // Return mock analysis if no API key
      return this.generateMockAnalysis(request);
    }

    try {
      const systemPrompt = `You are a cybersecurity expert specializing in threat modeling using the STRIDE methodology. 
Analyze the provided system architecture and identify potential threats across all STRIDE categories:
- Spoofing (authentication issues)
- Tampering (data integrity)
- Repudiation (non-repudiation)
- Information Disclosure (confidentiality)
- Denial of Service (availability)
- Elevation of Privilege (authorization)

For each threat, provide:
1. The STRIDE category
2. A detailed description of the threat
3. Severity level (Low, Medium, High, Critical)
4. Recommended mitigation strategy
5. Related MITRE ATT&CK technique IDs (if applicable)

Also provide:
- Overall risk score (0-100)
- General recommendations for improving security
- Suggested attack tree root goals`;

      const userPrompt = this.buildAnalysisPrompt(request);

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Parse the response
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return this.parseAIResponse(content, request);
    } catch (error) {
      console.error('Claude API error:', error);
      // Fallback to mock analysis
      return this.generateMockAnalysis(request);
    }
  }

  async generateAttackTree(request: AIAnalysisRequest): Promise<AttackTree> {
    if (!this.anthropic) {
      return this.generateMockAttackTree(request);
    }

    try {
      const prompt = `Generate a detailed attack tree for the following system architecture.
An attack tree shows how an attacker could achieve a specific goal through various paths.

Architecture:
${JSON.stringify(request.nodes, null, 2)}

Connections:
${JSON.stringify(request.edges, null, 2)}

Generate an attack tree with:
- Root goal (what the attacker wants to achieve)
- Sub-goals (intermediate objectives)
- Techniques (specific attack methods)
- Difficulty, likelihood, and impact ratings for each node
- References to MITRE ATT&CK techniques where applicable

Return as JSON with this structure:
{
  "rootNodeId": "node-1",
  "nodes": {
    "node-1": {
      "id": "node-1",
      "type": "goal",
      "label": "Goal description",
      "description": "Detailed description",
      "difficulty": "Medium",
      "likelihood": "High",
      "impact": "High",
      "mitreTechnique": "T1234",
      "children": ["node-2", "node-3"]
    }
  }
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `attack-tree-${Date.now()}`,
          ...parsed,
          generatedAt: new Date().toISOString(),
        };
      }

      throw new Error('Failed to parse attack tree');
    } catch (error) {
      console.error('Attack tree generation error:', error);
      return this.generateMockAttackTree(request);
    }
  }

  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const nodes = request.nodes.map(n => 
      `- ${n.type}: ${n.label} (${n.data.description || 'No description'})`
    ).join('\n');

    const edges = request.edges.map(e => 
      `- ${e.source} → ${e.target}${e.label ? ` (${e.label})` : ''}`
    ).join('\n');

    const context = request.context ? `\nAdditional context: ${request.context}` : '';

    return `Please analyze the following system architecture for security threats:

System Components:
${nodes}

Connections:
${edges}${context}

Provide your analysis in a structured format with threats, mitigations, and recommendations.`;
  }

  private parseAIResponse(content: string, request: AIAnalysisRequest): AIAnalysisResponse {
    // Extract structured data from AI response
    // This is a simplified parser - in production, use more robust parsing
    const threats: STRIDEThreat[] = [];
    const recommendations: string[] = [];
    
    // Parse threats from the content
    const threatMatches = content.match(/\d+\.\s*\*\*(Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege)\*\*[^]*?(?=\d+\.\s*\*\*|$)/gi);
    
    if (threatMatches) {
      threatMatches.forEach(match => {
        const categoryMatch = match.match(/\*\*(Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege)\*\*/i);
        const severityMatch = match.match(/Severity:\s*(Low|Medium|High|Critical)/i);
        
        if (categoryMatch) {
          threats.push({
            category: categoryMatch[1].replace(' ', '') as STRIDECategory,
            description: match.slice(0, 200).replace(/\*\*/g, ''),
            severity: (severityMatch?.[1] as STRIDEThreat['severity']) || 'Medium',
            mitigation: 'Implement appropriate security controls',
            mitreTechniques: [],
          });
        }
      });
    }

    // If no threats parsed, use defaults
    if (threats.length === 0) {
      return this.generateMockAnalysis(request);
    }

    // Extract recommendations
    const recMatches = content.match(/recommendations?:([^]*?)(?=\n\n|$)/i);
    if (recMatches) {
      const recs = recMatches[1].split('\n').filter(r => r.trim().startsWith('-') || r.trim().match(/^\d+\./));
      recommendations.push(...recs.map(r => r.replace(/^[-\d.\s]+/, '').trim()));
    }

    // Calculate risk score based on threat severity
    const severityScores = { Low: 20, Medium: 40, High: 70, Critical: 100 };
    const avgScore = threats.length > 0 
      ? threats.reduce((sum, t) => sum + severityScores[t.severity], 0) / threats.length 
      : 50;

    return {
      threats,
      attackTrees: [],
      recommendations: recommendations.length > 0 ? recommendations : ['Review and implement security best practices'],
      riskScore: Math.round(avgScore),
      generatedAt: new Date().toISOString(),
    };
  }

  private generateMockAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    const threats: STRIDEThreat[] = [
      {
        category: 'Spoofing',
        description: 'Unauthorized users may attempt to impersonate legitimate users or services to gain access to the system.',
        severity: 'High',
        mitigation: 'Implement strong authentication mechanisms including MFA, certificate-based authentication, and regular credential rotation.',
        mitreTechniques: ['T1078', 'T1550'],
      },
      {
        category: 'Tampering',
        description: 'Attackers may attempt to modify data in transit or at rest to manipulate system behavior.',
        severity: 'High',
        mitigation: 'Implement end-to-end encryption, digital signatures for data integrity, and input validation.',
        mitreTechniques: ['T1565', 'T1493'],
      },
      {
        category: 'Repudiation',
        description: 'Users may deny performing actions without adequate logging and auditing mechanisms.',
        severity: 'Medium',
        mitigation: 'Implement comprehensive audit logging with timestamps, digital signatures on logs, and immutable log storage.',
        mitreTechniques: ['T1070', 'T1562'],
      },
      {
        category: 'InformationDisclosure',
        description: 'Sensitive data may be exposed through insufficient access controls or misconfigurations.',
        severity: 'Critical',
        mitigation: 'Apply least privilege access, encrypt sensitive data, implement data classification, and regular security assessments.',
        mitreTechniques: ['T1552', 'T1083', 'T1005'],
      },
      {
        category: 'DenialOfService',
        description: 'The system may be overwhelmed by malicious traffic, making it unavailable to legitimate users.',
        severity: 'High',
        mitigation: 'Implement rate limiting, DDoS protection, resource quotas, and redundancy in critical components.',
        mitreTechniques: ['T1498', 'T1499'],
      },
      {
        category: 'ElevationOfPrivilege',
        description: 'Attackers may exploit vulnerabilities to gain higher-level permissions than authorized.',
        severity: 'Critical',
        mitigation: 'Apply defense in depth, principle of least privilege, regular security patching, and privilege access management.',
        mitreTechniques: ['T1068', 'T1548', 'T1134'],
      },
    ];

    return {
      threats,
      attackTrees: [this.generateMockAttackTree(request)],
      recommendations: [
        'Implement comprehensive input validation across all entry points',
        'Enable detailed security logging and monitoring',
        'Regular vulnerability scanning and penetration testing',
        'Establish incident response procedures',
        'Implement zero-trust architecture principles',
      ],
      riskScore: 72,
      generatedAt: new Date().toISOString(),
    };
  }

  private generateMockAttackTree(request: AIAnalysisRequest): AttackTree {
    const nodes: AttackTree['nodes'] = {
      'root': {
        id: 'root',
        type: 'goal',
        label: 'Gain Unauthorized System Access',
        description: 'Attacker aims to gain unauthorized access to sensitive system resources',
        difficulty: 'Medium',
        likelihood: 'High',
        impact: 'Critical',
        children: ['auth-bypass', 'data-exfil', 'priv-esc'],
      },
      'auth-bypass': {
        id: 'auth-bypass',
        type: 'subgoal',
        label: 'Bypass Authentication',
        description: 'Circumvent authentication mechanisms',
        difficulty: 'Hard',
        likelihood: 'Medium',
        impact: 'High',
        mitreTechnique: 'T1078',
        children: ['credential-stuffing', 'session-hijack'],
      },
      'credential-stuffing': {
        id: 'credential-stuffing',
        type: 'technique',
        label: 'Credential Stuffing',
        description: 'Use stolen credentials from other breaches',
        difficulty: 'Easy',
        likelihood: 'High',
        impact: 'Medium',
        mitreTechnique: 'T1110',
        children: [],
      },
      'session-hijack': {
        id: 'session-hijack',
        type: 'technique',
        label: 'Session Hijacking',
        description: 'Steal or forge session tokens',
        difficulty: 'Medium',
        likelihood: 'Medium',
        impact: 'High',
        mitreTechnique: 'T1563',
        children: [],
      },
      'data-exfil': {
        id: 'data-exfil',
        type: 'subgoal',
        label: 'Exfiltrate Sensitive Data',
        description: 'Extract sensitive information from the system',
        difficulty: 'Medium',
        likelihood: 'High',
        impact: 'Critical',
        mitreTechnique: 'T1041',
        children: ['sql-injection', 'api-abuse'],
      },
      'sql-injection': {
        id: 'sql-injection',
        type: 'technique',
        label: 'SQL Injection',
        description: 'Inject malicious SQL queries',
        difficulty: 'Easy',
        likelihood: 'Medium',
        impact: 'High',
        mitreTechnique: 'T1190',
        children: [],
      },
      'api-abuse': {
        id: 'api-abuse',
        type: 'technique',
        label: 'API Abuse',
        description: 'Exploit API vulnerabilities to access data',
        difficulty: 'Medium',
        likelihood: 'High',
        impact: 'Medium',
        mitreTechnique: 'T1059',
        children: [],
      },
      'priv-esc': {
        id: 'priv-esc',
        type: 'subgoal',
        label: 'Escalate Privileges',
        description: 'Gain higher-level access permissions',
        difficulty: 'Hard',
        likelihood: 'Low',
        impact: 'Critical',
        mitreTechnique: 'T1068',
        children: ['vuln-exploit'],
      },
      'vuln-exploit': {
        id: 'vuln-exploit',
        type: 'technique',
        label: 'Exploit Known Vulnerability',
        description: 'Use unpatched vulnerabilities for privilege escalation',
        difficulty: 'Medium',
        likelihood: 'Low',
        impact: 'Critical',
        mitreTechnique: 'T1068',
        children: [],
      },
    };

    return {
      id: `attack-tree-${Date.now()}`,
      rootNodeId: 'root',
      nodes,
      generatedAt: new Date().toISOString(),
    };
  }
}
