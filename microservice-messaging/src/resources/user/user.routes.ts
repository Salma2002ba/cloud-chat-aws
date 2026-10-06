import { Router } from 'express';
import { userController } from './user.controller';
import { roomService } from '../room/room.service';
import { invitationController } from '../invitation/invitation.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { RoomDto } from '../room/room.dto';
import { parseNumberParam } from '../../utils/helpers';

const router = Router();

// GET /users/:userId/rooms - Récupérer tous les salons d'un utilisateur
router.get('/:userId/rooms', authMiddleware, async (req, res) => {
    try {
        const userId = parseNumberParam(req.params.userId);
        const rooms = await roomService.findByUser(userId);
        const roomDtos = rooms.map(room => RoomDto.fromEntity(room));
        res.json(roomDtos);
    } catch (error: any) {
        console.error('Error fetching user rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /users/:userId/invitations - Récupérer les invitations d'un utilisateur
router.get('/:userId/invitations', authMiddleware, invitationController.getUserInvitations.bind(invitationController));

// GET /users/:userId/invitations/count - Compter les invitations en attente
router.get('/:userId/invitations/count', authMiddleware, invitationController.getPendingCount.bind(invitationController));

// GET /users/:userId/profile?currentUserId=123 - Profil public avec salons communs
router.get('/:userId/profile', authMiddleware, userController.getPublicProfile.bind(userController));

export default router;
