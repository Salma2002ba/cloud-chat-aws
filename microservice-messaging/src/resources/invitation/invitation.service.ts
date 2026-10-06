import { AppDataSource } from "../../db/data-source";
import { Invitation } from "./invitation.entity";
import { InvitationStatus, MemberRole } from "../../types/enums";
import { roomService } from "../room/room.service";

export class InvitationService {
    private invitationRepository = AppDataSource.getRepository(Invitation);

    async create(roomId: number, inviterUserId: number, inviteeUserId: number): Promise<Invitation> {
        // Vérifier si une invitation existe déjà
        const existing = await this.invitationRepository.findOne({
            where: {
                roomId,
                inviteeUserId,
                status: InvitationStatus.PENDING
            }
        });

        if (existing) {
            throw new Error('Une invitation est déjà en attente pour cet utilisateur');
        }

        // Vérifier si l'utilisateur est déjà membre
        const isMember = await roomService.isMember(roomId, inviteeUserId);
        if (isMember) {
            throw new Error('Cet utilisateur est déjà membre du salon');
        }

        const invitation = new Invitation();
        invitation.roomId = roomId;
        invitation.inviterUserId = inviterUserId;
        invitation.inviteeUserId = inviteeUserId;
        invitation.status = InvitationStatus.PENDING;

        return await this.invitationRepository.save(invitation);
    }

    async findByUser(userId: number): Promise<Invitation[]> {
        return await this.invitationRepository.find({
            where: {
                inviteeUserId: userId,
                status: InvitationStatus.PENDING
            },
            relations: ['room'],
            order: { createdAt: 'DESC' }
        });
    }

    async findById(invitationId: number): Promise<Invitation | null> {
        return await this.invitationRepository.findOne({
            where: { id: invitationId },
            relations: ['room']
        });
    }

    async respond(invitationId: number, userId: number, status: InvitationStatus): Promise<void> {
        const invitation = await this.findById(invitationId);

        if (!invitation) {
            throw new Error('Invitation introuvable');
        }

        if (invitation.inviteeUserId !== userId) {
            throw new Error('Vous n\'êtes pas autorisé à répondre à cette invitation');
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new Error('Cette invitation a déjà été traitée');
        }

        if (status !== InvitationStatus.ACCEPTED && status !== InvitationStatus.REJECTED) {
            throw new Error('Statut invalide');
        }

        // Mettre à jour le statut
        invitation.status = status;
        await this.invitationRepository.save(invitation);

        // Si acceptée, ajouter l'utilisateur comme membre du salon
        if (status === InvitationStatus.ACCEPTED) {
            await roomService.addMember(invitation.roomId, userId, MemberRole.MEMBER);
        }
    }

    async countPendingByUser(userId: number): Promise<number> {
        return await this.invitationRepository.count({
            where: {
                inviteeUserId: userId,
                status: InvitationStatus.PENDING
            }
        });
    }
}

export const invitationService = new InvitationService();
