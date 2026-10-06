import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './config';
import { AppDataSource } from './db/data-source';

// Routes
import { getRoomRoutes } from './resources/room/room.routes';
import invitationRoutes from './resources/invitation/invitation.routes';
import userRoutes from './resources/user/user.routes';
import { getMessageRoutes } from './resources/message/message.routes';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: "*", // En prod on mettrait l'URL du S3, mais "*" pour l'atelier c'est ok
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes REST API
app.use('/rooms', getRoomRoutes(io));
app.use('/rooms', getMessageRoutes(io)); // Sous-routes des messages avec io
app.use('/invitations', invitationRoutes);
app.use('/users', userRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ service: 'messaging', status: 'healthy' });
});

// Socket.IO pour le temps réel
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);
        console.log(`📨 Client ${socket.id} joined room ${roomId}`);
    });

    socket.on('leaveRoom', (roomId: string) => {
        socket.leave(roomId);
        console.log(`📤 Client ${socket.id} left room ${roomId}`);
    });

    socket.on('message', (data: any) => {
        io.to(data.roomId).emit('message', data);
    });

    socket.on('typing', (data: { roomId: string; userId: number; username: string }) => {
        socket.to(data.roomId).emit('typing', data);
    });

    socket.on('stopTyping', (data: { roomId: string; userId: number }) => {
        socket.to(data.roomId).emit('stopTyping', data);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

const startServer = async () => {
    try {
        // Initialiser TypeORM
        await AppDataSource.initialize();
        console.log('✅ Messaging Service: TypeORM initialized');

        server.listen(config.port, () => {
            console.log(`💬 Messaging Service listening on port ${config.port}`);
            console.log(`📡 API: http://localhost:${config.port}`);
            console.log(`🔌 WebSocket ready`);
        });
    } catch (error) {
        console.error('❌ Failed to start messaging service:', error);
        process.exit(1);
    }
};

startServer();
