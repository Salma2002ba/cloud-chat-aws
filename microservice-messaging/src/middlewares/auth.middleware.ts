import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Étendre l'interface Request pour inclure userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
            req.userId = decoded.userId;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};

// Middleware optionnel : vérifie le token s'il est présent, mais n'échoue pas s'il est absent
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
                req.userId = decoded.userId;
            } catch (error) {
                // Token invalide mais on continue quand même
                console.warn('Invalid token in optional auth:', error);
            }
        }

        next();
    } catch (error) {
        next();
    }
};
