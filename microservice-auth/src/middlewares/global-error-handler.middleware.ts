import {Request, Response, NextFunction} from 'express';

export const globalErrorHandlerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("❌ ERREUR EXPRESS CATCHÉE :", err);

    // On répond proprement au lieu de laisser Lambda crasher
    res.status(500).json({
        message: "Internal Server Error",
    });
}