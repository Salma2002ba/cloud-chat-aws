import { IsEmail, IsNotEmpty, MinLength, IsString } from "class-validator";
import {Dto} from "../../../utils/dto";

export class RegisterDto extends Dto {
    @IsNotEmpty({ message: "Le nom est obligatoire" })
    @IsString()
    username: string;

    @IsEmail({}, { message: "L'email n'est pas valide" })
    email: string;

    @MinLength(8, { message: "Le mot de passe doit faire au moins 8 caractères" })
    password: string;
}
