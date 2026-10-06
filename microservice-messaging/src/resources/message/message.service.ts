import { AppDataSource } from "../../db/data-source";
import { Message } from "./message.entity";
import { LessThan, MoreThan } from "typeorm";

export class MessageService {
    private messageRepository = AppDataSource.getRepository(Message);

    async create(roomId: number, authorUserId: number, content: string, replyToId?: number): Promise<Message> {
        const message = new Message();
        message.roomId = roomId;
        message.authorUserId = authorUserId;
        message.content = content;
        message.replyToId = replyToId || null;

        return await this.messageRepository.save(message);
    }

    async findById(messageId: number): Promise<Message | null> {
        return await this.messageRepository.findOneBy({ id: messageId });
    }

    async findByRoom(roomId: number, limit: number = 100): Promise<Message[]> {
        return await this.messageRepository.find({
            where: { roomId },
            relations: ['replyTo'],
            order: { createdAt: 'ASC' },
            take: limit
        });
    }

    async findByRoomSince(roomId: number, since: Date, limit: number = 100): Promise<Message[]> {
        return await this.messageRepository.find({
            where: {
                roomId,
                createdAt: MoreThan(since)
            },
            relations: ['replyTo'],
            order: { createdAt: 'ASC' },
            take: limit
        });
    }

    async findByRoomPaginated(
        roomId: number,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: Message[], total: number, hasMore: boolean }> {
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { roomId },
            relations: ['replyTo'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit
        });

        return {
            messages: messages.reverse(), // Inverser pour avoir l'ordre chronologique
            total,
            hasMore: page * limit < total
        };
    }

    async searchInRoom(roomId: number, query: string, limit: number = 50): Promise<Message[]> {
        return await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.replyTo', 'replyTo')
            .where('message.roomId = :roomId', { roomId })
            .andWhere('LOWER(message.content) LIKE LOWER(:query)', { query: `%${query}%` })
            .orderBy('message.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }

    async delete(messageId: number): Promise<void> {
        await this.messageRepository.delete(messageId);
    }

    async updateMessage(messageId: number, userId: number, content: string) {
        const message = await this.messageRepository.findOneBy({ id: messageId });
        if (!message) throw new Error('Message not found');
        if (message.authorUserId !== userId) throw new Error('Forbidden');

        message.content = content;
        return this.messageRepository.save(message);
    }

    async deleteMessage(messageId: number, userId: number) {
        const message = await this.messageRepository.findOneBy({ id: messageId });
        if (!message) throw new Error('Message not found');
        if (message.authorUserId !== userId) throw new Error('Forbidden');

        await this.messageRepository.remove(message);
    }
}

export const messageService = new MessageService();
