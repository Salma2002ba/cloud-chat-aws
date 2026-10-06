import { Expose } from "class-transformer";
import {Dto} from "../../utils/dto";

export class UserDto extends Dto {
    @Expose()
    id: number;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}