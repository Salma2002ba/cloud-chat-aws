import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany
} from "typeorm";
import { RoomType, RoomTheme } from "../../types/enums";
import { RoomMember } from "./room-member.entity";
import { Message } from "../message/message.entity";
import { Invitation } from "../invitation/invitation.entity";

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({
        type: "enum",
        enum: RoomType,
        default: RoomType.PRIVATE
    })
    type: RoomType;

    @Column({ name: 'owner_user_id' })
    ownerUserId: number; // Référence vers microservice-auth

    @Column({
        type: "enum",
        enum: RoomTheme,
        default: RoomTheme.INDIGO
    })
    theme: RoomTheme;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @OneToMany(() => RoomMember, member => member.room, { cascade: true })
    members: RoomMember[];

    @OneToMany(() => Message, message => message.room, { cascade: true })
    messages: Message[];

    @OneToMany(() => Invitation, invitation => invitation.room, { cascade: true })
    invitations: Invitation[];
}
