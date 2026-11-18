import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/AllExceptions.filter';

/**
 * @BootApplication
 * Orden: Config -> DB -> Módulos (models, repos, servicios, controllers) -> Pipes/Filtros -> Server
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    app.use(helmet());
    app.enableCors({
        origin: config.get<string>('CORS_ORIGIN', 'http://localhost:4200').split(',').map(o => o.trim()),
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
        credentials: true,
    });

    /**
     * @Validation
     * - whitelist + forbidNonWhitelisted: rechaza campos que no estén en el DTO (modo estricto).
     * - transform: convierte tipos ("12" -> 12) y aplica los @Transform de los DTOs.
     */
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableShutdownHooks();

    const port = config.get<number>('PORT', 3000);
    await app.listen(port);
    Logger.log(`✅ | Nest Server | PORT: ${port}`, 'Bootstrap');
}

bootstrap();
