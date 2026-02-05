# 🛡️ Threat Canvas

A visual threat modeling tool with AI-assisted attack trees. Collaborate in real-time, generate STRIDE analysis, and export professional threat models.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Visual Architecture Modeling** - Drag-and-drop system architecture drawing with ReactFlow
- **AI-Powered Analysis** - Claude API integration for auto-generated STRIDE analysis
- **Attack Tree Generation** - Visual attack tree visualization with branching paths
- **Real-Time Collaboration** - WebSocket-powered multi-user editing with live cursors
- **Risk Heatmaps** - Visual risk assessment with color-coded heatmaps
- **MITRE ATT&CK Mapping** - Built-in mapping to MITRE ATT&CK framework
- **Export Options** - Export to PDF and JSON formats
- **Cybersecurity Theme** - Dark mode with neon cyan/purple accents

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone and navigate to the project
cd threat-canvas

# Start all services
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Manual Setup

#### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key (for AI features)

#### Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your Anthropic API key

npm run dev
```

#### Frontend Setup

```bash
cd client
npm install
npm start
```

## 📁 Project Structure

```
threat-canvas/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript interfaces
│   │   ├── styles/         # Global styles
│   │   └── App.tsx         # Main application
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── handlers/       # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Entry point
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## 🎨 Usage

### Creating a Threat Model

1. **Draw Architecture** - Use the toolbar to add components (Server, Database, API, Client)
2. **Connect Components** - Drag connections between components
3. **AI Analysis** - Click "Generate Analysis" to get AI-powered STRIDE analysis
4. **View Attack Trees** - Switch to Attack Tree view to see potential attack paths
5. **Risk Assessment** - Review the risk heatmap for prioritization
6. **Collaborate** - Share the URL for real-time collaboration
7. **Export** - Export to PDF or JSON for documentation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save model |
| `Ctrl/Cmd + E` | Export to PDF |
| `Delete` | Remove selected node |
| `Space` | Pan mode |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |

## 🔧 Configuration

### Environment Variables

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_WS_URL=ws://localhost:4000
```

#### Server (.env)
```env
PORT=4000
ANTHROPIC_API_KEY=your_api_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/analyze` | POST | AI threat analysis |
| `/api/export/pdf` | POST | Export to PDF |
| `/api/export/json` | POST | Export to JSON |
| `/api/mitre/techniques` | GET | Get MITRE techniques |

## 🤝 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join collaboration room |
| `node-update` | Bidirectional | Sync node changes |
| `cursor-move` | Client → Server | Broadcast cursor position |
| `user-joined` | Server → Client | New user notification |

## 🛡️ STRIDE Categories

The tool analyzes threats across six STRIDE categories:

- **S**poofing - Authentication issues
- **T**ampering - Data integrity threats
- **R**epudiation - Non-repudiation issues
- **I**nformation Disclosure - Confidentiality breaches
- **D**enial of Service - Availability threats
- **E**levation of Privilege - Authorization issues

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [ReactFlow](https://reactflow.dev/) - Node-based UI
- [MITRE ATT&CK](https://attack.mitre.org/) - Threat framework
- [Anthropic Claude](https://anthropic.com/) - AI analysis
- [Socket.io](https://socket.io/) - Real-time collaboration

---

Built with 💜 for the cybersecurity community
