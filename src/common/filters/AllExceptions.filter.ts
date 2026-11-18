import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, DatabaseError } from 'sequelize';
import { ApiError } from '../types/ApiResponse';

/**
 * @AllExceptionsFilter
 * - Único punto donde se arma la respuesta de error. Formato que espera el front:
 *   { message: string, errCode: string }
 * - Traduce errores de PostgreSQL (UNIQUE, FK, CHECK) a respuestas 4xx en lugar de 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse<Response>();
        const { status, body } = this.resolve(exception);

        if (status >= 500) this.logger.error(exception instanceof Error ? exception.stack : exception);
        res.status(status).json(body);
    }

    private resolve = (exception: unknown): { status: number, body: ApiError } => {
        /** @Http -> AppException, ValidationPipe, NotFound, etc. */
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse() as string | { message?: string | string[], errCode?: string };
            const raw = typeof response === 'string' ? response : response.message;
            const message = Array.isArray(raw) ? raw.join('. ') : raw || exception.message;
            const errCode = typeof response === 'object' && response.errCode ? response.errCode : this.defaultCode(status);
            return { status, body: { message, errCode } };
        }

        /** @Database -> Constraints de PostgreSQL */
        if (exception instanceof UniqueConstraintError) {
            return { status: HttpStatus.CONFLICT, body: { message: 'Ya existe un registro con esos datos', errCode: 'DUPLICATE' } };
        }
        if (exception instanceof ForeignKeyConstraintError) {
            return { status: HttpStatus.BAD_REQUEST, body: { message: 'Referencia a un registro inexistente', errCode: 'INVALID_REFERENCE' } };
        }
        if (exception instanceof DatabaseError && /CHECK constraint/i.test(exception.message)) {
            return { status: HttpStatus.BAD_REQUEST, body: { message: 'Los datos no cumplen las reglas de la base', errCode: 'CHECK_VIOLATION' } };
        }

        return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: { message: 'Internal server error', errCode: 'INTERNAL' } };
    }

    private defaultCode = (status: number): string => ({
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
    } as Record<number, string>)[status] ?? 'ERROR';
}
