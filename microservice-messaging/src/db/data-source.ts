import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { Room } from "../resources/room/room.entity";
import { RoomMember } from "../resources/room/room-member.entity";
import { Message } from "../resources/message/message.entity";
import { Invitation } from "../resources/invitation/invitation.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: config.db.ssl,
    synchronize: config.db.sync, // ⚠️ true pour dev, false pour prod
    logging: false,
    entities: [Room, RoomMember, Message, Invitation],
    migrations: [],
    subscribers: [],
});
