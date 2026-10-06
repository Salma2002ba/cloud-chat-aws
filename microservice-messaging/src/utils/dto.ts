import { plainToClass, ClassConstructor } from "class-transformer";

export abstract class Dto {
    static fromEntity<T>(this: ClassConstructor<T>, entity: any): T {
        return plainToClass(this, entity, { excludeExtraneousValues: true });
    }

    static fromEntities<T>(this: ClassConstructor<T>, entities: any[]): T[] {
        return entities.map(entity => plainToClass(this, entity, { excludeExtraneousValues: true }));
    }
}
