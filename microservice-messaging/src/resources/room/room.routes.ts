import { Router } from 'express';
import { Server as SocketServer } from 'socket.io';
import { RoomController } from './room.controller';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { CreateRoomDto, UpdateRoomThemeDto, RenameRoomDto } from './room.dto';

export function getRoomRoutes(io: SocketServer): Router {
    const router = Router();
    const roomController = new RoomController(io);

    // GET /rooms/user/:userId - Récupérer tous les salons d'un utilisateur
    router.get('/user/:userId', authMiddleware, roomController.getUserRooms.bind(roomController));

    // GET /rooms/:roomId - Récupérer un salon par ID
    router.get('/:roomId', authMiddleware, roomController.getRoomById.bind(roomController));

    // POST /rooms - Créer un nouveau salon
    router.post(
        '/',
        authMiddleware,
        validationMiddleware(CreateRoomDto),
        roomController.createRoom.bind(roomController)
    );

    // PATCH /rooms/:roomId/theme - Mettre à jour le thème d'un salon
    router.patch(
        '/:roomId/theme',
        authMiddleware,
        validationMiddleware(UpdateRoomThemeDto),
        roomController.updateRoomTheme.bind(roomController)
    );

    // GET /rooms/:roomId/members - Récupérer les membres d'un salon
    router.get('/:roomId/members', authMiddleware, roomController.getRoomMembers.bind(roomController));

    // DELETE /rooms/:roomId - Supprimer un salon (owner uniquement)
    router.delete(
        '/:roomId',
        authMiddleware,
        roomController.deleteRoom.bind(roomController)
    );

    // PATCH /rooms/:roomId/name - Renommer un salon (owner uniquement)
    router.patch(
        '/:roomId/name',
        authMiddleware,
        validationMiddleware(RenameRoomDto),
        roomController.renameRoom.bind(roomController)
    );

    return router;
}
