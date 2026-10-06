import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {config} from '../../config';
import {userService} from "../user/user.service";
import {plainToInstance} from "class-transformer";
import {UserDto} from "../user/user.dto";

export class AuthService {

    constructor() {
    }

    async register(username: string, email: string, password: string): Promise<{ user: UserDto; token: string }> {
        const existingEmail = await userService.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already in use');
        }

        const existingUsername = await userService.findByUsername(username);
        if (existingUsername) {
            throw new Error('Username already taken');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userService.create(username, email, passwordHash);

        const token = this.generateToken(user.id);
        return {user: UserDto.fromEntity(user), token};
    }

    async login(identifier: string, password: string): Promise<{ user: UserDto; token: string }> {
        // Chercher par username ou email
        let user = await userService.findByUsername(identifier);
        if (!user) {
            user = await userService.findByEmail(identifier);
        }

        if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user.id);

        return {user: UserDto.fromEntity(user), token};
    }

    async verifyToken(token: string): Promise<{ userId: number; user: UserDto }> {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
            const user = await userService.findById(decoded.userId);

            if (!user) {
                throw new Error('User not found');
            }

            return {userId: decoded.userId, user: UserDto.fromEntity(user)};
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const user = await userService.findById(userId);

        if (!user || !user.passwordHash) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid old password');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await userService.update(userId, {...user, passwordHash: newPasswordHash});
    }

    private generateToken(userId: number): string {
        return jwt.sign(
            {userId},
            config.jwt.secret,
            {expiresIn: '7d'}
        );
    }
}

export const authService = new AuthService();
