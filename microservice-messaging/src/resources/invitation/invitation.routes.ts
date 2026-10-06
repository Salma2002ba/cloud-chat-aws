import { Router } from 'express';
import { invitationController } from './invitation.controller';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { CreateInvitationDto, RespondInvitationDto } from './invitation.dto';

const router = Router();

// GET /invitations/user/:userId - Récupérer toutes les invitations d'un utilisateur
router.get('/user/:userId', authMiddleware, invitationController.getUserInvitations.bind(invitationController));

// GET /invitations/user/:userId/count - Compter les invitations en attente
router.get('/user/:userId/count', authMiddleware, invitationController.getPendingCount.bind(invitationController));

// POST /invitations - Créer une invitation
router.post(
    '/',
    authMiddleware,
    validationMiddleware(CreateInvitationDto),
    invitationController.createInvitation.bind(invitationController)
);

// PATCH /invitations/:invitationId/respond - Répondre à une invitation
router.patch(
    '/:invitationId/respond',
    authMiddleware,
    validationMiddleware(RespondInvitationDto),
    invitationController.respondToInvitation.bind(invitationController)
);

export default router;
