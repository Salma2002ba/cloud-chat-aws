import { Request, Response } from 'express';
import { invitationService } from './invitation.service';
import { InvitationDto, CreateInvitationDto, RespondInvitationDto } from './invitation.dto';
import { authService } from '../../services/auth.service';
import { parseNumberParam } from '../../utils/helpers';

export class InvitationController {
    async getUserInvitations(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseNumberParam(req.params.userId);
            const invitations = await invitationService.findByUser(userId);

            // Enrichir avec les noms
            const userIds = [...new Set(invitations.map(inv => inv.inviterUserId))];
            const users = await authService.getUsersByIds(userIds);

            const enrichedInvitations = invitations.map(inv => {
                const dto = InvitationDto.fromEntity(inv);
                const user = users.get(inv.inviterUserId);
                dto.inviterName = user?.username || 'Utilisateur';
                dto.roomName = inv.room?.name || 'Salon';
                return dto;
            });

            res.json(enrichedInvitations);
        } catch (error: any) {
            console.error('Error fetching invitations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createInvitation(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateInvitationDto = req.body;

            // Récupérer l'utilisateur par username
            const invitee = await authService.getUserByUsername(dto.inviteeUsername);
            if (!invitee) {
                res.status(404).json({ error: 'Utilisateur introuvable' });
                return;
            }

            const invitation = await invitationService.create(
                dto.roomId,
                dto.inviterUserId,
                invitee.id
            );

            res.status(201).json(InvitationDto.fromEntity(invitation));
        } catch (error: any) {
            console.error('Error creating invitation:', error);
            res.status(400).json({ error: error.message || 'Internal server error' });
        }
    }

    async respondToInvitation(req: Request, res: Response): Promise<void> {
        try {
            const invitationId = parseNumberParam(req.params.invitationId);
            const { userId } = req.body; // Devrait venir d'un middleware auth
            const dto: RespondInvitationDto = req.body;

            await invitationService.respond(
                invitationId,
                userId,
                dto.status
            );

            res.json({ message: 'Invitation traitée avec succès' });
        } catch (error: any) {
            console.error('Error responding to invitation:', error);
            res.status(400).json({ error: error.message || 'Internal server error' });
        }
    }

    async getPendingCount(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseNumberParam(req.params.userId);
            const count = await invitationService.countPendingByUser(userId);
            res.json({ count });
        } catch (error: any) {
            console.error('Error counting invitations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const invitationController = new InvitationController();
