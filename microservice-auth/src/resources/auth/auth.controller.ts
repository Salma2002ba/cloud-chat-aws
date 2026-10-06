import {Request, Response} from 'express';
import {RegisterDto} from "./dto/register.dto";
import {authService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";

export class AuthController {

    constructor() {
    }

    register = async (req: Request, res: Response) => {
        try {
            const dto = req.body as RegisterDto;

            const result = await authService.register(
                dto.username,
                dto.email,
                dto.password);

            res.status(201).json({
                message: 'User registered successfully',
                user: result.user,
                token: result.token,
            });
        } catch (error: any) {
            if (error.message.includes('already')) {
                res.status(409).json({error: error.message});
            } else {
                console.error('Register error:', error);
                res.status(500).json({error: 'Internal server error'});
            }
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {

        const {identifier, password} = req.body as LoginDto;

        const result = await authService.login(identifier, password);

        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            token: result.token,
        });
    };

    verify = async (req: Request, res: Response): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({error: 'No token provided'});
                return;
            }

            const token = authHeader.substring(7);
            const result = await authService.verifyToken(token);

            res.status(200).json({
                message: 'Token valid',
                userId: result.userId,
                user: result.user,
            });
        } catch (error: any) {
            res.status(401).json({error: 'Invalid token'});
        }
    };

    changePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const {userId, oldPassword, newPassword} = req.body;

            if (!userId || !oldPassword || !newPassword) {
                res.status(400).json({error: 'All fields are required'});
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json({error: 'New password must be at least 6 characters'});
                return;
            }

            await authService.changePassword(userId, oldPassword, newPassword);

            res.status(200).json({
                message: 'Password changed successfully',
            });
        } catch (error: any) {
            if (error.message === 'Invalid old password') {
                res.status(401).json({error: error.message});
            } else {
                console.error('Change password error:', error);
                res.status(500).json({error: 'Internal server error'});
            }
        }
    };
}
