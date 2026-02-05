import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { 
  CollaborationRoom, 
  User, 
  CanvasNode, 
  CanvasEdge,
  ClientToServerEvents,
  ServerToClientEvents
} from '../types';

const USER_COLORS = [
  '#00d4ff', // Cyan
  '#ff00ff', // Magenta
  '#00ff88', // Green
  '#ff6b35', // Orange
  '#9d4edd', // Purple
  '#ff1744', // Red
  '#ffff00', // Yellow
  '#00ffff', // Aqua
];

export class CollaborationHandler {
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userRooms: Map<string, string> = new Map();
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
  }

  initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join room
      socket.on('join-room', (roomId: string, userName: string) => {
        this.handleJoinRoom(socket, roomId, userName);
      });

      // Leave room
      socket.on('leave-room', (roomId: string) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Cursor movement
      socket.on('cursor-move', (data: { roomId: string; x: number; y: number }) => {
        this.handleCursorMove(socket, data);
      });

      // Node operations
      socket.on('add-node', (data: { roomId: string; node: CanvasNode }) => {
        this.handleAddNode(socket, data);
      });

      socket.on('update-node', (data: { roomId: string; nodeId: string; updates: Partial<CanvasNode> }) => {
        this.handleUpdateNode(socket, data);
      });

      socket.on('remove-node', (data: { roomId: string; nodeId: string }) => {
        this.handleRemoveNode(socket, data);
      });

      // Edge operations
      socket.on('add-edge', (data: { roomId: string; edge: CanvasEdge }) => {
        this.handleAddEdge(socket, data);
      });

      socket.on('remove-edge', (data: { roomId: string; edgeId: string }) => {
        this.handleRemoveEdge(socket, data);
      });

      // Sync request
      socket.on('sync-request', (roomId: string) => {
        this.handleSyncRequest(socket, roomId);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleJoinRoom(socket: Socket, roomId: string, userName: string): void {
    const room = this.getOrCreateRoom(roomId);
    
    // Create user
    const user: User = {
      id: socket.id,
      name: userName || `User ${room.users.size + 1}`,
      color: USER_COLORS[room.users.size % USER_COLORS.length],
      lastSeen: new Date(),
    };

    // Join socket room
    socket.join(roomId);
    
    // Add user to room
    room.users.set(socket.id, user);
    this.userRooms.set(socket.id, roomId);

    // Notify other users
    socket.to(roomId).emit('user-joined', user);

    // Send current room state to new user
    socket.emit('canvas-sync', room.canvasState);

    console.log(`User ${user.name} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);
      this.userRooms.delete(socket.id);
      socket.to(roomId).emit('user-left', socket.id);
      socket.leave(roomId);

      // Clean up empty rooms
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  private handleCursorMove(socket: Socket, data: { roomId: string; x: number; y: number }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      const user = room.users.get(socket.id);
      if (user) {
        user.cursor = { x: data.x, y: data.y };
        user.lastSeen = new Date();
        
        socket.to(data.roomId).emit('cursor-update', {
          userId: socket.id,
          x: data.x,
          y: data.y,
        });
      }
    }
  }

  private handleAddNode(socket: Socket, data: { roomId: string; node: CanvasNode }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.canvasState.nodes.push(data.node);
      socket.to(data.roomId).emit('node-added', data.node);
    }
  }

  private handleUpdateNode(socket: Socket, data: { roomId: string; nodeId: string; updates: Partial<CanvasNode> }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      const nodeIndex = room.canvasState.nodes.findIndex(n => n.id === data.nodeId);
      if (nodeIndex !== -1) {
        room.canvasState.nodes[nodeIndex] = {
          ...room.canvasState.nodes[nodeIndex],
          ...data.updates,
        };
        socket.to(data.roomId).emit('node-updated', {
          nodeId: data.nodeId,
          updates: data.updates,
        });
      }
    }
  }

  private handleRemoveNode(socket: Socket, data: { roomId: string; nodeId: string }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.canvasState.nodes = room.canvasState.nodes.filter(n => n.id !== data.nodeId);
      room.canvasState.edges = room.canvasState.edges.filter(
        e => e.source !== data.nodeId && e.target !== data.nodeId
      );
      socket.to(data.roomId).emit('node-removed', data.nodeId);
    }
  }

  private handleAddEdge(socket: Socket, data: { roomId: string; edge: CanvasEdge }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.canvasState.edges.push(data.edge);
      socket.to(data.roomId).emit('edge-added', data.edge);
    }
  }

  private handleRemoveEdge(socket: Socket, data: { roomId: string; edgeId: string }): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.canvasState.edges = room.canvasState.edges.filter(e => e.id !== data.edgeId);
      socket.to(data.roomId).emit('edge-removed', data.edgeId);
    }
  }

  private handleSyncRequest(socket: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      socket.emit('canvas-sync', room.canvasState);
    }
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);
    
    const roomId = this.userRooms.get(socket.id);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.users.delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        
        if (room.users.size === 0) {
          this.rooms.delete(roomId);
        }
      }
      this.userRooms.delete(socket.id);
    }
  }

  private getOrCreateRoom(roomId: string): CollaborationRoom {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        name: `Room ${roomId}`,
        users: new Map(),
        canvasState: {
          nodes: [],
          edges: [],
        },
        createdAt: new Date(),
      });
    }
    return this.rooms.get(roomId)!;
  }

  getActiveRooms(): Array<{ id: string; name: string; userCount: number; createdAt: Date }> {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      userCount: room.users.size,
      createdAt: room.createdAt,
    }));
  }
}
