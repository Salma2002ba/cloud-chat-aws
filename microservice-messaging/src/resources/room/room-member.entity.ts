import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn
} from "typeorm";
import { MemberRole } from "../../types/enums";
import { Room } from "./room.entity";

@Entity('room_members')
export class RoomMember {
    @PrimaryColumn({ name: 'room_id' })
    roomId: number;

    @PrimaryColumn({ name: 'user_id' })
    userId: number; // Référence vers microservice-auth

    @Column({
        type: "enum",
        enum: MemberRole,
        default: MemberRole.MEMBER
    })
    role: MemberRole;

    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date;

    // Relations
    @ManyToOne(() => Room, room => room.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'room_id' })
    room: Room;
}
