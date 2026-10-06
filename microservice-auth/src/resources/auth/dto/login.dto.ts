import {IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: "L'email n'est pas valide" })
    identifier: string;

    @IsNotEmpty({ message: "Le mot de passe est vide" })
    password: string;
}