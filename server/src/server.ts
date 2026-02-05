import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { CollaborationHandler } from './handlers/collaboration';
import { AIHandler } from './handlers/ai';
import { ExportHandler } from './handlers/export';
import { MitreData } from './utils/mitreData';
import { ClientToServerEvents, ServerToClientEvents } from './types';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
  pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '20000'),
});

const PORT = process.env.PORT || 4000;

// Initialize handlers
const collaborationHandler = new CollaborationHandler(io);
const aiHandler = new AIHandler();
const exportHandler = new ExportHandler();
const mitreData = new MitreData();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// MITRE ATT&CK routes
app.get('/api/mitre/tactics', (req: Request, res: Response) => {
  res.json(mitreData.getTactics());
});

app.get('/api/mitre/techniques', (req: Request, res: Response) => {
  const { tactic, platform } = req.query;
  res.json(mitreData.getTechniques(tactic as string, platform as string));
});

app.get('/api/mitre/techniques/:id', (req: Request, res: Response) => {
  const technique = mitreData.getTechniqueById(req.params.id);
  if (technique) {
    res.json(technique);
  } else {
    res.status(404).json({ error: 'Technique not found' });
  }
});

// AI Analysis routes
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const analysis = await aiHandler.analyzeThreats(req.body);
    res.json(analysis);
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/generate-attack-tree', async (req: Request, res: Response) => {
  try {
    const attackTree = await aiHandler.generateAttackTree(req.body);
    res.json(attackTree);
  } catch (error) {
    console.error('Attack Tree generation error:', error);
    res.status(500).json({ 
      error: 'Attack tree generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export routes
app.post('/api/export/pdf', async (req: Request, res: Response) => {
  try {
    const pdfBuffer = await exportHandler.exportToPDF(req.body);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${req.body.title || 'threat-model'}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Export error:', error);
    res.status(500).json({ 
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/export/json', (req: Request, res: Response) => {
  try {
    const jsonData = exportHandler.exportToJSON(req.body);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${req.body.title || 'threat-model'}.json"`);
    res.json(jsonData);
  } catch (error) {
    console.error('JSON Export error:', error);
    res.status(500).json({ 
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get active rooms (for admin/debug)
app.get('/api/rooms', (req: Request, res: Response) => {
  res.json(collaborationHandler.getActiveRooms());
});

// Initialize WebSocket handlers
collaborationHandler.initialize();

// Start server
httpServer.listen(PORT, () => {
  console.log(`🛡️  Threat Canvas Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, io };
