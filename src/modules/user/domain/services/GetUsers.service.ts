import { Injectable } from '@nestjs/common';
import { UserWithCashResponse } from '../entities/User.entity';
import { UserRep } from '../../repositories/User.repository';

/**
 * @UseCase Listar usuarios activos (con hasOpenCash para el modal de abrir caja)
 */
@Injectable()
export class GetUsersSrv {

    constructor(private readonly UserRep: UserRep) {}

    execute = async (): Promise<UserWithCashResponse[]> => this.UserRep.findAllActiveWithOpenCash();
}
