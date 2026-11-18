import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Usuario autenticado que el JwtAuthGuard deja en la request */
export type AuthUser = {
    usu_id: number;
    usu_name: string;
    usu_username: string;
    rol_name: string;
};

export type AuthRequest = Request & { user?: AuthUser };

/**
 * @CurrentUser
 * - Inyecta el usuario logueado en el controller.
 * @example getMe(@CurrentUser() user: AuthUser)
 */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<AuthRequest>().user as AuthUser);
