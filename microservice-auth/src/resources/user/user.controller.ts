import { Request, Response } from 'express';
import { userService } from './user.service';
import { UserDto } from './user.dto';
import { parseNumberParam, parseParam } from '../../utils/helpers';

export class UserController {
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseNumberParam(req.params.userId);
            const user = await userService.findById(userId);

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json(UserDto.fromEntity(user));
        } catch (error: any) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getUserByUsername(req: Request, res: Response): Promise<void> {
        try {
            const username = parseParam(req.params.username);
            const user = await userService.findByUsername(username);

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json(UserDto.fromEntity(user));
        } catch (error: any) {
            console.error('Error fetching user by username:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const userController = new UserController();
