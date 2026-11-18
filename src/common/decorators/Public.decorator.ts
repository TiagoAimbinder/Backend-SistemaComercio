import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public
 * - Todas las rutas requieren token (JwtAuthGuard global). Este decorador marca las excepciones.
 * @example @Public() @Post('login')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
