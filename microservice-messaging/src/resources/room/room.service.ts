import { AppDataSource } from "../../db/data-source";
import { Room } from "./room.entity";
import { RoomMember } from "./room-member.entity";
import { RoomType, RoomTheme, MemberRole } from "../../types/enums";

export class RoomService {
    private roomRepository = AppDataSource.getRepository(Room);
    private memberRepository = AppDataSource.getRepository(RoomMember);

    async create(name: string, type: RoomType, ownerUserId: number, theme?: RoomTheme): Promise<Room> {
        // Créer le salon
        const room = new Room();
        room.name = name;
        room.type = type;
        room.ownerUserId = ownerUserId;
        room.theme = theme || RoomTheme.INDIGO;

        const savedRoom = await this.roomRepository.save(room);

        // Ajouter le propriétaire comme membre
        const member = new RoomMember();
        member.roomId = savedRoom.id;
        member.userId = ownerUserId;
        member.role = MemberRole.OWNER;

        await this.memberRepository.save(member);

        return savedRoom;
    }

    async findByUser(userId: number): Promise<Room[]> {
        // Trouver les salons dont l'utilisateur est membre OU qui sont publics
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoin('room.members', 'member')
            .where('room.type = :type', { type: RoomType.GENERAL })
            .orWhere('member.userId = :userId', { userId })
            .orderBy('room.createdAt', 'DESC')
            .getMany();

        return rooms;
    }

    async findById(roomId: number): Promise<Room | null> {
        return await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ['members']
        });
    }

    async updateTheme(roomId: number, theme: RoomTheme): Promise<void> {
        await this.roomRepository.update(roomId, { theme });
    }

    async isMember(roomId: number, userId: number): Promise<boolean> {
        const member = await this.memberRepository.findOne({
            where: { roomId, userId }
        });
        return !!member;
    }

    async addMember(roomId: number, userId: number, role: MemberRole = MemberRole.MEMBER): Promise<void> {
        const member = new RoomMember();
        member.roomId = roomId;
        member.userId = userId;
        member.role = role;

        await this.memberRepository.save(member);
    }

    async getMembers(roomId: number): Promise<RoomMember[]> {
        return await this.memberRepository.find({
            where: { roomId },
            order: { joinedAt: 'ASC' }
        });
    }

    async deleteRoom(roomId: number, userId: number): Promise<void> {
        const room = await this.roomRepository.findOne({ where: { id: roomId } });
        if (!room) throw new Error('Room not found');
        if (room.ownerUserId !== userId) throw new Error('Forbidden');
        await this.roomRepository.remove(room);
    }

    async renameRoom(roomId: number, userId: number, newName: string): Promise<void> {
        const room = await this.roomRepository.findOne({ where: { id: roomId } });
        if (!room) throw new Error('Room not found');
        if (room.ownerUserId !== userId) throw new Error('Forbidden');
        await this.roomRepository.update(roomId, { name: newName });
    }

    async getCommonRooms(userId1: number, userId2: number): Promise<Room[]> {
        // Trouver les salons communs entre deux utilisateurs
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .innerJoin('room.members', 'member1', 'member1.userId = :userId1', { userId1 })
            .innerJoin('room.members', 'member2', 'member2.userId = :userId2', { userId2 })
            .orderBy('room.createdAt', 'DESC')
            .getMany();

        return rooms;
    }
}

export const roomService = new RoomService();
