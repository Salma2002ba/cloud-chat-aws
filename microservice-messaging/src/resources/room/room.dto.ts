import { Expose } from "class-transformer";
import { IsString, IsEnum, IsNumber, IsOptional, MinLength, MaxLength } from "class-validator";
import { Dto } from "../../utils/dto";
import { RoomType, RoomTheme } from "../../types/enums";

export class RoomDto extends Dto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    type: RoomType;

    @Expose()
    ownerUserId: number;

    @Expose()
    theme: RoomTheme;

    @Expose()
    createdAt: Date;
}

export class CreateRoomDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @IsEnum(RoomType)
    type: RoomType;

    @IsNumber()
    ownerUserId: number;

    @IsOptional()
    @IsEnum(RoomTheme)
    theme?: RoomTheme;
}

export class UpdateRoomThemeDto {
    @IsEnum(RoomTheme)
    theme: RoomTheme;
}

export class RenameRoomDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;
}
