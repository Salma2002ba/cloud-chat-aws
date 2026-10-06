import "reflect-metadata"
import { DataSource } from "typeorm"
import {User} from "../resources/user/user.entity";
import {config} from "../config";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: config.db.ssl,
    synchronize: config.db.sync, // ⚠️ Créera les tables auto (vrai pour dev, faux pour prod)
    logging: false,
    entities: [User], // Liste de tes tables/classes
    migrations: [],
    subscribers: [],
})