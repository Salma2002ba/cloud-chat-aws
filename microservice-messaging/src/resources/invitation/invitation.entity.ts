import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { InvitationStatus } from "../../types/enums";
import { Room } from "../room/room.entity";

@Entity('invitations')
export class Invitation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'room_id' })
    roomId: number;

    @Column({ name: 'inviter_user_id' })
    inviterUserId: number; // Référence vers microservice-auth

    @Column({ name: 'invitee_user_id' })
    @Index() // Index pour requêtes "mes invitations"
    inviteeUserId: number; // Référence vers microservice-auth

    @Column({
        type: "enum",
        enum: InvitationStatus,
        default: InvitationStatus.PENDING
    })
    status: InvitationStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Room, room => room.invitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'room_id' })
    room: Room;
}
