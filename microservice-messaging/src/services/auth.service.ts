import { config } from '../config';

interface UserInfo {
    id: number;
    username: string;
    email: string;
}

export class AuthService {
    private authServiceUrl = config.authServiceUrl;

    /**
     * Récupérer les infos d'un utilisateur par ID
     */
    async getUserById(userId: number, authHeader?: string): Promise<UserInfo | null> {
        try {
            console.log(`🔍 Recherche user ID: ${this.authServiceUrl}/auth/user/${userId}`);
            const response = await fetch(`${this.authServiceUrl}/auth/user/${userId}`, {
            headers: authHeader ? { Authorization: authHeader } : undefined,
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Récupérer les infos de plusieurs utilisateurs
     */
    async getUsersByIds(userIds: number[], authHeader?: string): Promise<Map<number, UserInfo>> {
        const users = new Map<number, UserInfo>();

        await Promise.all(
            userIds.map(async (id) => {
            const user = await this.getUserById(id, authHeader);
            if (user) users.set(id, user);
            })
        );

        return users;
    }

    /**
     * Récupérer les infos d'un utilisateur par username
     */
    async getUserByUsername(username: string): Promise<UserInfo | null> {
        try {
            const response = await fetch(`${this.authServiceUrl}/auth/user/username/${username}`);
            if (!response.ok) {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching user by username ${username}:`, error);
            return null;
        }
    }
}

export const authService = new AuthService();
