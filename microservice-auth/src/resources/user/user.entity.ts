import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column({ unique: true }) // Ajout important : l'email doit être unique
    email: string;

    @Column({ nullable: true, name: 'password_hash' }) // On mappe vers le nom de colonne SQL exact
    passwordHash: string; // En TS, on préfère le camelCase

    // TypeORM gère ça tout seul maintenant :
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}