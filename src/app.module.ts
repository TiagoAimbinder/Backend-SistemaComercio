import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './modules/auth/Auth.module';
import { ProductModule } from './modules/product/Product.module';
import { ProviderModule } from './modules/provider/Provider.module';
import { UserModule } from './modules/user/User.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
            validationSchema: envValidationSchema,
        }),
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: databaseConfig,
        }),

        /** @Features */
        AuthModule,
        UserModule,
        ProviderModule,
        ProductModule,
    ],
})
export class AppModule {}
