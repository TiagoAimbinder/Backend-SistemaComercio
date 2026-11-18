import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../exceptions/App.exception';
import { AuthRequest } from '../decorators/CurrentUser.decorator';
import { IS_PUBLIC_KEY } from '../decorators/Public.decorator';
import { UserRep } from '../../modules/user/repositories/User.repository';

export type JwtPayload = { sub: number; rol: string; iat?: number; exp?: number };

/**
 * @Guard global de autenticación
 * 1. Rutas con @Public() pasan sin token.
 * 2. Exige "Authorization: Bearer <token>" válido y no vencido.
 * 3. Verifica en la base que el usuario siga existiendo y activo
 *    (dar de baja a alguien le corta el acceso al instante, sin esperar a que venza el token).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        private readonly jwt: JwtService,
        private readonly UserRep: UserRep,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
        if (isPublic) return true;

        const req = ctx.switchToHttp().getRequest<AuthRequest>();
        const [scheme, token] = (req.headers.authorization ?? '').split(' ');
        if (scheme !== 'Bearer' || !token) throw this.unauthorized('Iniciá sesión para continuar', 'AUTH_REQUIRED');

        let payload: JwtPayload;
        try {
            payload = await this.jwt.verifyAsync<JwtPayload>(token);
        } catch {
            throw this.unauthorized('La sesión venció, volvé a iniciar sesión', 'AUTH_EXPIRED');
        }

        const user = await this.UserRep.findActiveById(Number(payload.sub));
        if (!user) throw this.unauthorized('El usuario no existe o fue dado de baja', 'AUTH_USER_INACTIVE');

        req.user = user;
        return true;
    }

    private unauthorized = (message: string, errCode: string) => new AppException(message, errCode, HttpStatus.UNAUTHORIZED);
}
