import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../../../../common/exceptions/App.exception';
import { JwtPayload } from '../../../../common/guards/JwtAuth.guard';
import { verifyPassword } from '../../../../common/utils/password.util';
import { EUser, UserResponse } from '../../../user/domain/entities/User.entity';
import { UserRep } from '../../../user/repositories/User.repository';
import { LoginDto } from '../../dto/Login.dto';

export type LoginResponse = {
    access_token: string;
    /** ISO: el front cierra la sesión sola al llegar a esta hora */
    expires_at: string;
    user: UserResponse;
};

/** Hash válido de una contraseña al azar: se usa para que el tiempo de respuesta no revele si el usuario existe */
const DUMMY_HASH = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + 'A'.repeat(86) + '==';

/**
 * @UseCase Login con usuario y contraseña
 * 1. Mismo mensaje para "no existe", "contraseña incorrecta" y "dado de baja" (no revela qué falló).
 * 2. Firma un JWT (sub = usu_id) con la duración de JWT_EXPIRES_IN (un turno).
 * 3. Registra usu_last_login_at.
 */
@Injectable()
export class LoginSrv {

    constructor(
        private readonly UserRep: UserRep,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) {}

    execute = async ({ usu_username, password }: LoginDto): Promise<LoginResponse> => {
        const found = await this.UserRep.findByUsername(usu_username);
        const valid = await verifyPassword(password, found?.usu_hash_password ?? DUMMY_HASH);

        if (!found || !valid || !found.usu_active) {
            throw new AppException('Usuario o contraseña incorrectos', 'INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
        }

        const user = EUser.fromModel(found).toResponse();
        const payload: JwtPayload = { sub: user.usu_id, rol: user.rol_name };
        const access_token = await this.jwt.signAsync(payload);
        const { exp } = this.jwt.decode<JwtPayload>(access_token);

        await this.UserRep.touchLastLogin(user.usu_id);

        return { access_token, expires_at: new Date((exp ?? 0) * 1000).toISOString(), user };
    }
}
