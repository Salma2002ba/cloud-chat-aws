import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validationMiddleware<T extends object>(dtoClass: new () => T) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoInstance = plainToInstance(dtoClass, req.body);
        const errors: ValidationError[] = await validate(dtoInstance);

        if (errors.length > 0) {
            const messages = errors.map(error => ({
                property: error.property,
                constraints: error.constraints
            }));

            res.status(400).json({
                error: 'Validation failed',
                details: messages
            });
            return;
        }

        req.body = dtoInstance;
        next();
    };
}
