import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../../../common/types/ApiResponse';
import { UserWithCashResponse } from '../domain/entities/User.entity';
import { GetUsersSrv } from '../domain/services/GetUsers.service';

/**
 * @Controller /users
 * - Requiere sesión (guard global). El alta/baja de usuarios llega con la pantalla de Usuarios.
 */
@Controller('users')
export class UserCtr {

    constructor(private readonly GetUsersSrv: GetUsersSrv) {}

    @Get()
    async getAll(): Promise<ApiResponse<UserWithCashResponse[]>> {
        const data = await this.GetUsersSrv.execute();
        return { message: 'Users obtained successfully', data };
    }
}
