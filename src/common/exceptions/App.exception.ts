import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * @AppException
 * - Error de negocio con código propio. Reemplaza el `throw { statusCode, message, errCode }`
 *   de los backends Express: el filtro global lo convierte en { message, errCode }.
 */
export class AppException extends HttpException {
    constructor(
        message: string,
        public readonly errCode: string,
        status: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        super({ message, errCode }, status);
    }

    static notFound = (message: string, errCode = 'NOT_FOUND') => new AppException(message, errCode, HttpStatus.NOT_FOUND);
    static conflict = (message: string, errCode = 'CONFLICT') => new AppException(message, errCode, HttpStatus.CONFLICT);
    static badRequest = (message: string, errCode = 'BAD_REQUEST') => new AppException(message, errCode, HttpStatus.BAD_REQUEST);
}
