import { Request, Response, NextFunction, RequestHandler } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export function validation(dtoClass: any): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        const output: any = plainToInstance(dtoClass, req.body);

        const errors = await validate(output);

        if (errors.length > 0) {
            const errorMessages = errors.map(error =>
                Object.values(error.constraints || {})
            ).flat();

            res.status(400).json({ errors: errorMessages });
            return;
        }

        req.body = output;
        next();
    };
}