import { MITRETechnique, MITRETactic } from '../types';

export class MitreData {
  private tactics: MITRETactic[] = [
    {
      id: 'TA0043',
      name: 'Reconnaissance',
      description: 'The adversary is trying to gather information they can use to plan future operations.',
      techniques: ['T1595', 'T1598', 'T1593'],
    },
    {
      id: 'TA0042',
      name: 'Resource Development',
      description: 'The adversary is trying to establish resources they can use to support operations.',
      techniques: ['T1583', 'T1584', 'T1587'],
    },
    {
      id: 'TA0001',
      name: 'Initial Access',
      description: 'The adversary is trying to get into your network.',
      techniques: ['T1566', 'T1190', 'T1133', 'T1078'],
    },
    {
      id: 'TA0002',
      name: 'Execution',
      description: 'The adversary is trying to run malicious code.',
      techniques: ['T1059', 'T1609', 'T1610'],
    },
    {
      id: 'TA0003',
      name: 'Persistence',
      description: 'The adversary is trying to maintain their foothold.',
      techniques: ['T1098', 'T1136', 'T1543', 'T1547'],
    },
    {
      id: 'TA0004',
      name: 'Privilege Escalation',
      description: 'The adversary is trying to gain higher-level permissions.',
      techniques: ['T1068', 'T1548', 'T1134'],
    },
    {
      id: 'TA0005',
      name: 'Defense Evasion',
      description: 'The adversary is trying to avoid being detected.',
      techniques: ['T1070', 'T1562', 'T1027'],
    },
    {
      id: 'TA0006',
      name: 'Credential Access',
      description: 'The adversary is trying to steal account names and passwords.',
      techniques: ['T1110', 'T1552', 'T1003', 'T1555'],
    },
    {
      id: 'TA0007',
      name: 'Discovery',
      description: 'The adversary is trying to figure out your environment.',
      techniques: ['T1083', 'T1057', 'T1018', 'T1046'],
    },
    {
      id: 'TA0008',
      name: 'Lateral Movement',
      description: 'The adversary is trying to move through your environment.',
      techniques: ['T1021', 'T1550', 'T1210'],
    },
    {
      id: 'TA0009',
      name: 'Collection',
      description: 'The adversary is trying to gather data of interest to their goal.',
      techniques: ['T1560', 'T1005', 'T1039'],
    },
    {
      id: 'TA0011',
      name: 'Command and Control',
      description: 'The adversary is trying to communicate with compromised systems.',
      techniques: ['T1071', 'T1572', 'T1568'],
    },
    {
      id: 'TA0010',
      name: 'Exfiltration',
      description: 'The adversary is trying to steal data.',
      techniques: ['T1041', 'T1048', 'T1567'],
    },
    {
      id: 'TA0040',
      name: 'Impact',
      description: 'The adversary is trying to manipulate, interrupt, or destroy systems.',
      techniques: ['T1498', 'T1499', 'T1565', 'T1493'],
    },
  ];

  private techniques: MITRETechnique[] = [
    {
      id: 'T1078',
      name: 'Valid Accounts',
      tactic: 'Initial Access',
      description: 'Adversaries may obtain and abuse credentials of existing accounts.',
      platforms: ['Windows', 'Linux', 'macOS', 'AWS', 'Azure', 'GCP'],
      dataSources: ['Authentication logs', 'Process monitoring'],
    },
    {
      id: 'T1566',
      name: 'Phishing',
      tactic: 'Initial Access',
      description: 'Adversaries may send phishing messages to gain access.',
      platforms: ['Windows', 'Linux', 'macOS', 'SaaS'],
      dataSources: ['Email gateway logs', 'Network traffic'],
    },
    {
      id: 'T1190',
      name: 'Exploit Public-Facing Application',
      tactic: 'Initial Access',
      description: 'Adversaries may attempt to exploit vulnerabilities in internet-facing applications.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Web server logs', 'Application logs'],
    },
    {
      id: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      description: 'Adversaries may abuse command and script interpreters to execute commands.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Process monitoring', 'Command-line logging'],
    },
    {
      id: 'T1068',
      name: 'Exploitation for Privilege Escalation',
      tactic: 'Privilege Escalation',
      description: 'Adversaries may exploit software vulnerabilities to elevate privileges.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Vulnerability scans', 'System calls'],
    },
    {
      id: 'T1548',
      name: 'Abuse Elevation Control Mechanism',
      tactic: 'Privilege Escalation',
      description: 'Adversaries may circumvent mechanisms designed to control elevation privileges.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Process monitoring', 'Authentication logs'],
    },
    {
      id: 'T1070',
      name: 'Indicator Removal',
      tactic: 'Defense Evasion',
      description: 'Adversaries may delete or modify artifacts generated on a host system.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['File monitoring', 'Process monitoring'],
    },
    {
      id: 'T1562',
      name: 'Impair Defenses',
      tactic: 'Defense Evasion',
      description: 'Adversaries may maliciously modify components of a victim environment.',
      platforms: ['Windows', 'Linux', 'macOS', 'Network'],
      dataSources: ['System configuration', 'Process monitoring'],
    },
    {
      id: 'T1110',
      name: 'Brute Force',
      tactic: 'Credential Access',
      description: 'Adversaries may use brute force techniques to gain access to accounts.',
      platforms: ['Windows', 'Linux', 'macOS', 'IaaS', 'SaaS'],
      dataSources: ['Authentication logs', 'Network traffic'],
    },
    {
      id: 'T1552',
      name: 'Unsecured Credentials',
      tactic: 'Credential Access',
      description: 'Adversaries may search compromised systems to find and obtain insecurely stored credentials.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['File monitoring', 'Command-line logging'],
    },
    {
      id: 'T1003',
      name: 'OS Credential Dumping',
      tactic: 'Credential Access',
      description: 'Adversaries may attempt to dump credentials to obtain account login information.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['API monitoring', 'Process monitoring'],
    },
    {
      id: 'T1083',
      name: 'File and Directory Discovery',
      tactic: 'Discovery',
      description: 'Adversaries may enumerate files and directories.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['File monitoring', 'Process monitoring'],
    },
    {
      id: 'T1046',
      name: 'Network Service Scanning',
      tactic: 'Discovery',
      description: 'Adversaries may attempt to get a listing of services running on remote hosts.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Network device logs', 'Network traffic'],
    },
    {
      id: 'T1021',
      name: 'Remote Services',
      tactic: 'Lateral Movement',
      description: 'Adversaries may use valid accounts to log into remote services.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Authentication logs', 'Network traffic'],
    },
    {
      id: 'T1005',
      name: 'Data from Local System',
      tactic: 'Collection',
      description: 'Adversaries may search local system sources to find files of interest.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['File monitoring', 'Process monitoring'],
    },
    {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      tactic: 'Exfiltration',
      description: 'Adversaries may steal data by exfiltrating it over an existing C2 channel.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Network traffic', 'Process monitoring'],
    },
    {
      id: 'T1048',
      name: 'Exfiltration Over Alternative Protocol',
      tactic: 'Exfiltration',
      description: 'Adversaries may steal data using an alternate communication channel.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Network traffic', 'Process monitoring'],
    },
    {
      id: 'T1498',
      name: 'Network Denial of Service',
      tactic: 'Impact',
      description: 'Adversaries may perform Network Denial of Service (DoS) attacks.',
      platforms: ['Windows', 'Linux', 'macOS', 'Network'],
      dataSources: ['Network traffic', 'Network device logs'],
    },
    {
      id: 'T1499',
      name: 'Endpoint Denial of Service',
      tactic: 'Impact',
      description: 'Adversaries may perform Endpoint Denial of Service (DoS) attacks.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Process monitoring', 'System calls'],
    },
    {
      id: 'T1565',
      name: 'Data Manipulation',
      tactic: 'Impact',
      description: 'Adversaries may insert, delete, or manipulate data.',
      platforms: ['Windows', 'Linux', 'macOS', 'IaaS'],
      dataSources: ['File monitoring', 'API monitoring'],
    },
    {
      id: 'T1493',
      name: 'Transmitted Data Manipulation',
      tactic: 'Impact',
      description: 'Adversaries may alter data en route to storage or other systems.',
      platforms: ['Windows', 'Linux', 'macOS', 'Network'],
      dataSources: ['Network traffic', 'Packet capture'],
    },
    {
      id: 'T1134',
      name: 'Access Token Manipulation',
      tactic: 'Privilege Escalation',
      description: 'Adversaries may modify access tokens to operate under a different security context.',
      platforms: ['Windows'],
      dataSources: ['API monitoring', 'Process monitoring'],
    },
    {
      id: 'T1550',
      name: 'Use Alternate Authentication Material',
      tactic: 'Lateral Movement',
      description: 'Adversaries may use alternate authentication material to move laterally.',
      platforms: ['Windows', 'macOS'],
      dataSources: ['Authentication logs', 'Network traffic'],
    },
    {
      id: 'T1563',
      name: 'Remote Service Session Hijacking',
      tactic: 'Lateral Movement',
      description: 'Adversaries may take control of pre-existing sessions with remote services.',
      platforms: ['Windows', 'Linux'],
      dataSources: ['Authentication logs', 'Network traffic'],
    },
    {
      id: 'T1071',
      name: 'Application Layer Protocol',
      tactic: 'Command and Control',
      description: 'Adversaries may communicate using OSI application layer protocols.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['Network traffic', 'Packet capture'],
    },
    {
      id: 'T1027',
      name: 'Obfuscated Files or Information',
      tactic: 'Defense Evasion',
      description: 'Adversaries may attempt to make an executable or file difficult to analyze.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['File monitoring', 'Network traffic'],
    },
    {
      id: 'T1098',
      name: 'Account Manipulation',
      tactic: 'Persistence',
      description: 'Adversaries may manipulate accounts to maintain access.',
      platforms: ['Windows', 'Linux', 'macOS', 'IaaS', 'SaaS'],
      dataSources: ['Authentication logs', 'Account management logs'],
    },
    {
      id: 'T1136',
      name: 'Create Account',
      tactic: 'Persistence',
      description: 'Adversaries may create an account to maintain access.',
      platforms: ['Windows', 'Linux', 'macOS', 'IaaS', 'SaaS'],
      dataSources: ['Authentication logs', 'Process monitoring'],
    },
    {
      id: 'T1595',
      name: 'Active Scanning',
      tactic: 'Reconnaissance',
      description: 'Adversaries may execute active reconnaissance scans to gather information.',
      platforms: ['Windows', 'Linux', 'macOS', 'Network'],
      dataSources: ['Network device logs', 'Network traffic'],
    },
    {
      id: 'T1560',
      name: 'Archive Collected Data',
      tactic: 'Collection',
      description: 'Adversaries may compress and/or encrypt data that is collected prior to exfiltration.',
      platforms: ['Windows', 'Linux', 'macOS'],
      dataSources: ['File monitoring', 'Process monitoring'],
    },
  ];

  getTactics(): MITRETactic[] {
    return this.tactics;
  }

  getTechniques(tacticId?: string, platform?: string): MITRETechnique[] {
    let filtered = this.techniques;

    if (tacticId) {
      const tactic = this.tactics.find(t => t.id === tacticId || t.name.toLowerCase() === tacticId.toLowerCase());
      if (tactic) {
        filtered = filtered.filter(t => t.tactic === tactic.name || tactic.techniques.includes(t.id));
      }
    }

    if (platform) {
      filtered = filtered.filter(t => t.platforms.some(p => p.toLowerCase() === platform.toLowerCase()));
    }

    return filtered;
  }

  getTechniqueById(id: string): MITRETechnique | undefined {
    return this.techniques.find(t => t.id === id);
  }

  getTechniquesByCategory(category: string): MITRETechnique[] {
    return this.techniques.filter(t => t.tactic.toLowerCase() === category.toLowerCase());
  }

  searchTechniques(query: string): MITRETechnique[] {
    const lowerQuery = query.toLowerCase();
    return this.techniques.filter(t => 
      t.id.toLowerCase().includes(lowerQuery) ||
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
    );
  }
}
