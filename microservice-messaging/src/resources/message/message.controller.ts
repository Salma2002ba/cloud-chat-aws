import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { messageService } from './message.service';
import { MessageDto, CreateMessageDto } from './message.dto';
import { authService } from '../../services/auth.service';
import { parseNumberParam } from '../../utils/helpers';

export class MessageController {
    constructor(private io: SocketServer) {}

    async getRoomMessages(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const { since, page, limit } = req.query;

            let messages;

            if (page) {
                // Pagination
                const result = await messageService.findByRoomPaginated(
                    roomId,
                    parseNumberParam(page),
                    limit ? parseNumberParam(limit) : 50
                );
                messages = result.messages;
                res.setHeader('X-Total-Count', result.total.toString());
                res.setHeader('X-Has-More', result.hasMore.toString());
            } else if (since) {
                // Depuis une date (pour polling)
                messages = await messageService.findByRoomSince(
                    roomId,
                    new Date(since as string)
                );
            } else {
                // Tous les messages récents
                messages = await messageService.findByRoom(roomId);
            }

            // Enrichir avec les noms d'utilisateurs (auteurs + auteurs des messages cités)
            const authorIds = messages.map(m => m.authorUserId);
            const replyAuthorIds = messages
                .filter(m => m.replyTo)
                .map(m => m.replyTo!.authorUserId);
            const userIds = [...new Set([...authorIds, ...replyAuthorIds])];
            const authHeader = req.headers.authorization as string | undefined;
            const users = await authService.getUsersByIds(userIds, authHeader);

            const enrichedMessages = messages.map(msg => {
                const dto = MessageDto.fromEntity(msg);
                const user = users.get(msg.authorUserId);
                dto.authorName = user?.username || 'Utilisateur';

                // Enrichir les infos du message cité
                dto.replyToId = msg.replyToId;
                if (msg.replyTo) {
                    dto.replyToContent = msg.replyTo.content;
                    const replyUser = users.get(msg.replyTo.authorUserId);
                    dto.replyToAuthorName = replyUser?.username || 'Utilisateur';
                }

                return dto;
            });

            res.json(enrichedMessages);
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async searchMessages(req: Request, res: Response): Promise<void> {
        try {
            const roomId = parseNumberParam(req.params.roomId);
            const q = req.query.q as string;

            if (!q || !q.trim()) {
                res.json([]);
                return;
            }

            const messages = await messageService.searchInRoom(roomId, q.trim());

            const authorIds = messages.map(m => m.authorUserId);
            const replyAuthorIds = messages
                .filter(m => m.replyTo)
                .map(m => m.replyTo!.authorUserId);
            const userIds = [...new Set([...authorIds, ...replyAuthorIds])];
            const authHeader = req.headers.authorization as string | undefined;
            const users = await authService.getUsersByIds(userIds, authHeader);

            const enrichedMessages = messages.map(msg => {
                const dto = MessageDto.fromEntity(msg);
                const user = users.get(msg.authorUserId);
                dto.authorName = user?.username || 'Utilisateur';
                dto.replyToId = msg.replyToId;
                if (msg.replyTo) {
                    dto.replyToContent = msg.replyTo.content;
                    const replyUser = users.get(msg.replyTo.authorUserId);
                    dto.replyToAuthorName = replyUser?.username || 'Utilisateur';
                }
                return dto;
            });

            res.json(enrichedMessages);
        } catch (error: any) {
            console.error('Error searching messages:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createMessage(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateMessageDto = req.body;
            const message = await messageService.create(
                dto.roomId,
                dto.authorUserId,
                dto.content,
                dto.replyToId
            );

            // Enrichir avec le nom de l'auteur
            const authHeader = req.headers.authorization as string | undefined;

            const user = await authService.getUserById(message.authorUserId, authHeader);

            const messageDto = MessageDto.fromEntity(message);
            messageDto.authorName = user?.username || 'Utilisateur';
            messageDto.replyToId = message.replyToId;

            // Enrichir les infos du message cité
            if (message.replyToId) {
                const replyTo = await messageService.findById(message.replyToId);
                if (replyTo) {
                    messageDto.replyToContent = replyTo.content;
                    const replyUser = await authService.getUserById(replyTo.authorUserId, authHeader);
                    messageDto.replyToAuthorName = replyUser?.username || 'Utilisateur';
                }
            }

            const payload = { ...messageDto };

            this.io.to(String(message.roomId)).emit('message', payload);

            res.status(201).json(messageDto);
        } catch (error: any) {
            console.error('Error creating message:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    async updateMessage(req: Request, res: Response) {
        try {
            const messageId = Number(req.params.messageId);
            const { content, userId } = req.body;

            const message = await messageService.updateMessage(messageId, userId, content);
            const messageDto = MessageDto.fromEntity(message);

            // Enrichir avec le nom de l'auteur
            const authHeader = req.headers.authorization as string | undefined;
            const user = await authService.getUserById(message.authorUserId, authHeader);
            messageDto.authorName = user?.username || 'Utilisateur';

            // Propager la modification aux autres utilisateurs
            this.io.to(String(message.roomId)).emit('messageUpdated', messageDto);

            res.json(messageDto);
        } catch (error: any) {
            console.error('Error updating message:', error);
            res.status(400).json({ error: error.message || 'Internal server error' });
        }
    }

    async deleteMessage(req: Request, res: Response) {
        try {
            const messageId = Number(req.params.messageId);
            const { userId, roomId } = req.body;

            await messageService.deleteMessage(messageId, userId);

            // Propager la suppression aux autres utilisateurs
            this.io.to(String(roomId)).emit('messageDeleted', { messageId });

            res.json({ success: true });
        } catch (error: any) {
            console.error('Error deleting message:', error);
            res.status(400).json({ error: error.message || 'Internal server error' });
        }
    }
}
