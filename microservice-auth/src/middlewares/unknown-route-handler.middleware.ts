import express, {NextFunction, Response, Request} from "express";

export const unknownRouteHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} inconnue`
    });
}