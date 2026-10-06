import { Request, Response } from 'express';
import { roomService } from '../room/room.service';
import { authService } from '../../services/auth.service';
import { RoomDto } from '../room/room.dto';
import { parseNumberParam } from '../../utils/helpers';

export class UserController {
    /**
     * Récupérer le profil public d'un utilisateur avec les salons communs
     * GET /users/:userId/profile?currentUserId=123
     */
    async getPublicProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseNumberParam(req.params.userId);
            const { currentUserId } = req.query;

            if (!currentUserId) {
                res.status(400).json({ error: 'currentUserId is required' });
                return;
            }

            // Récupérer les infos de l'utilisateur depuis le service auth
            const user = await authService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Récupérer les salons communs
            const commonRooms = await roomService.getCommonRooms(
                userId,
                parseNumberParam(currentUserId)
            );

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                commonRooms: commonRooms.map(room => RoomDto.fromEntity(room))
            });
        } catch (error: any) {
            console.error('Error fetching public profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const userController = new UserController();
