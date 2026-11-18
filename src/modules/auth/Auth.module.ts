import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/JwtAuth.guard';
import { UserModule } from '../user/User.module';
import { AuthCtr } from './controllers/Auth.controller';
import { LoginSrv } from './domain/services/Login.service';

/**
 * @Module Auth
 * - Registra JwtAuthGuard como guard GLOBAL: toda ruta exige token salvo las marcadas con @Public().
 * - ThrottlerModule: límite de intentos (se aplica solo donde se usa ThrottlerGuard, hoy el login).
 */
@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '12h') as `${number}h` },
            }),
        }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ],
    controllers: [AuthCtr],
    providers: [
        LoginSrv,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AuthModule {}
