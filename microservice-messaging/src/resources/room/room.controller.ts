import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { roomService } from './room.service';
import { RoomDto, CreateRoomDto, UpdateRoomThemeDto, RenameRoomDto } from './room.dto';
import { authService } from '../../services/auth.service';
import { parseNumberParam } from '../../utils/helpers';

export class RoomController {
    constructor(private io: SocketServer) {}

    async getUserRooms(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseNumberParam(req.params.userId);
            const rooms = await roomService.findByUser(userId);
            const roomDtos = rooms.map(room => RoomDto.fromEntity(room));
            res.json(roomDtos);
        } catch (error: any) {
            console.error('Error fetching user rooms:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createRoom(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateRoomDto = req.body;
            const room = await roomService.create(
                dto.name,
                dto.type,
                dto.ownerUserId,
                dto.theme
            );
            res.status(201).json(RoomDto.fromEntity(room));
        } catch (error: any) {
            console.error('Error creating room:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    async updateRoomTheme(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const dto: UpdateRoomThemeDto = req.body;

            await roomService.updateTheme(roomId, dto.theme);
            res.json({ message: 'Theme updated successfully' });
        } catch (error: any) {
            console.error('Error updating room theme:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    async getRoomById(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const room = await roomService.findById(roomId);

            if (!room) {
                res.status(404).json({ error: 'Room not found' });
                return;
            }

            res.json(RoomDto.fromEntity(room));
        } catch (error: any) {
            console.error('Error fetching room:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    async getRoomMembers(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const members = await roomService.getMembers(roomId);

            const userIds = members.map(m => m.userId);
            const authHeader = req.headers.authorization as string | undefined;
            const users = await authService.getUsersByIds(userIds, authHeader);

            const enriched = members.map(m => {
                const user = users.get(m.userId);
                return {
                    userId: m.userId,
                    role: m.role,
                    joinedAt: m.joinedAt,
                    username: user?.username || 'Utilisateur',
                };
            });

            res.json(enriched);
        } catch (error: any) {
            console.error('Error fetching room members:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteRoom(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const { userId } = req.body;

            await roomService.deleteRoom(roomId, userId);
            this.io.to(String(roomId)).emit('roomDeleted', { roomId });
            res.json({ message: 'Room deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Forbidden') {
                res.status(403).json({ error: 'Vous n\'êtes pas le propriétaire de ce salon' });
                return;
            }
            if (error.message === 'Room not found') {
                res.status(404).json({ error: 'Salon introuvable' });
                return;
            }
            console.error('Error deleting room:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    async renameRoom(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const { userId, name } = req.body;

            await roomService.renameRoom(roomId, userId, name);
            this.io.to(String(roomId)).emit('roomRenamed', { roomId, name });
            res.json({ message: 'Room renamed successfully' });
        } catch (error: any) {
            if (error.message === 'Forbidden') {
                res.status(403).json({ error: 'Vous n\'êtes pas le propriétaire de ce salon' });
                return;
            }
            if (error.message === 'Room not found') {
                res.status(404).json({ error: 'Salon introuvable' });
                return;
            }
            console.error('Error renaming room:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
