import { Router } from 'express';
import { Server as SocketServer } from 'socket.io';
import { MessageController } from './message.controller';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { CreateMessageDto } from './message.dto';

export function getMessageRoutes(io: SocketServer): Router {
    const router = Router();
    const messageController = new MessageController(io);

    // GET /rooms/:roomId/messages/search?q=term - Rechercher dans les messages
    router.get('/:roomId/messages/search', authMiddleware, messageController.searchMessages.bind(messageController));

    // GET /rooms/:roomId/messages - Récupérer les messages d'un salon
    // Supporte ?since=ISO_DATE pour polling
    // Supporte ?page=1&limit=50 pour pagination
    router.get('/:roomId/messages', authMiddleware, messageController.getRoomMessages.bind(messageController));

    // POST /rooms/:roomId/messages - Envoyer un message
    router.post(
        '/:roomId/messages',
        authMiddleware,
        validationMiddleware(CreateMessageDto),
        messageController.createMessage.bind(messageController)
    );

    // PUT /messages/:messageId - Modifier un message
    router.put(
        '/messages/:messageId',
        authMiddleware,
        messageController.updateMessage.bind(messageController)
    );

    // DELETE /messages/:messageId - Supprimer un message
    router.delete(
        '/messages/:messageId',
        authMiddleware,
        messageController.deleteMessage.bind(messageController)
    );

    return router;
}
