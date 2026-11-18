import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';


/**
 * @DTO Login
 * - El usuario se compara en minúscula; la contraseña tal cual.
 */
export class LoginDto {

    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsString()
    @IsNotEmpty({ message: 'Ingresá el usuario' })
    @MaxLength(50)
    usu_username: string;

    @IsString()
    @IsNotEmpty({ message: 'Ingresá la contraseña' })
    @MaxLength(128)
    password: string;
}

