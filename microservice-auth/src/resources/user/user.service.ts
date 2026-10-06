import {User} from "./user.entity";
import {AppDataSource} from "../../db/data-source";
import {ILike} from "typeorm";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async create(username: string, email: string, passwordHash: string): Promise<User> {

        const newUser = new User();
        newUser.username = username;
        newUser.email = email;
        newUser.passwordHash = passwordHash;

        return await this.userRepository.save(newUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOneBy({email});
    }

    async findByUsername(username: string): Promise<User | null> {
        // Recherche insensible à la casse
        return await this.userRepository.findOneBy({username: ILike(username)});
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOneBy({id});
    }

    async update(id: number, updateData: Partial<User>): Promise<User> {
        const user = await this.userRepository.preload({
            id: id,
            ...updateData
        });

        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        return await this.userRepository.save(user);
    }
}

export const userService = new UserService();