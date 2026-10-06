import { Expose } from "class-transformer";
import { IsString, IsEnum, IsNumber } from "class-validator";
import { Dto } from "../../utils/dto";
import { InvitationStatus } from "../../types/enums";

export class InvitationDto extends Dto {
    @Expose()
    id: number;

    @Expose()
    roomId: number;

    @Expose()
    inviterUserId: number;

    @Expose()
    inviteeUserId: number;

    @Expose()
    status: InvitationStatus;

    @Expose()
    createdAt: Date;

    // Champs enrichis (depuis API auth et room)
    @Expose()
    inviterName?: string;

    @Expose()
    roomName?: string;
}

export class CreateInvitationDto {
    @IsNumber()
    roomId: number;

    @IsNumber()
    inviterUserId: number;

    @IsString()
    inviteeUsername: string; // On cherchera le user par username
}

export class RespondInvitationDto {
    @IsNumber()
    userId: number;

    @IsEnum(InvitationStatus)
    status: InvitationStatus; // ACCEPTED ou REJECTED uniquement
}
