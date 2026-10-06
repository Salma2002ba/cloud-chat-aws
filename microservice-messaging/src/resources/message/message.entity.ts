import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { Room } from "../room/room.entity";

@Entity('messages')
@Index(['roomId', 'createdAt']) // Index composite pour les requêtes de messages
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'room_id' })
    @Index()
    roomId: number;

    @Column({ name: 'author_user_id' })
    authorUserId: number; // Référence vers microservice-auth

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'reply_to_id', nullable: true })
    replyToId: number | null;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;

    // Relations
    @ManyToOne(() => Room, room => room.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'room_id' })
    room: Room;

    @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reply_to_id' })
    replyTo: Message | null;
}
