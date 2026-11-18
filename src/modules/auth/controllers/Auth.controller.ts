import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../../../common/decorators/CurrentUser.decorator';
import { Public } from '../../../common/decorators/Public.decorator';
import { ApiResponse } from '../../../common/types/ApiResponse';
import { LoginResponse, LoginSrv } from '../domain/services/Login.service';
import { LoginDto } from '../dto/Login.dto';

/**
 * @Controller /auth
 * - POST /auth/login: pública, limitada a 5 intentos por minuto por IP.
 * - GET  /auth/me:    usuario de la sesión (el front lo usa al recargar para validar el token).
 */
@Controller('auth')
export class AuthCtr {

    constructor(private readonly LoginSrv: LoginSrv) {}

    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto): Promise<ApiResponse<LoginResponse>> {
        const data = await this.LoginSrv.execute(dto);
        return { message: 'Login successful', data };
    }

    @Get('me')
    me(@CurrentUser() user: AuthUser): ApiResponse<AuthUser> {
        return { message: 'Session user', data: user };
    }
}
