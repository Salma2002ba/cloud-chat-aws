import { Expose } from "class-transformer";
import { IsString, IsNumber, IsOptional, MinLength, MaxLength } from "class-validator";
import { Dto } from "../../utils/dto";
import { IsNull } from "typeorm";

export class MessageDto extends Dto {
    @Expose()
    id: number;

    @Expose()
    roomId: number;

    @Expose()
    authorUserId: number;

    @Expose()
    content: string;

    @Expose()
    createdAt: Date;

    // Champs enrichis (depuis API auth)
    @Expose()
    authorName?: string;

    // Reply
    @Expose()
    replyToId?: number | null;

    @Expose()
    replyToContent?: string;

    @Expose()
    replyToAuthorName?: string;
}

export class CreateMessageDto {
    @IsNumber()
    roomId: number;

    @IsNumber()
    authorUserId: number;

    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    content: string;

    @IsOptional()
    @IsNumber()
    replyToId?: number;
}
