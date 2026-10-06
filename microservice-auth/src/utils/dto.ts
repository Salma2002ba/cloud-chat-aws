import { plainToInstance } from "class-transformer";

export abstract class Dto {
    static fromEntity<T>(this: new () => T, entity: any): T {
        return plainToInstance(this, entity, { excludeExtraneousValues: true });
    }
}