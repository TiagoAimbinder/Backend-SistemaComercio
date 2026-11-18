import { Injectable } from '@nestjs/common';
import { ProviderRep } from '../../repositories/Provider.repository';
import { EProvider, ProviderResponse } from '../entities/Provider.entity';

/**
 * @UseCase Listar proveedores activos (ordenados por nombre)
 */
@Injectable()
export class GetProvidersSrv {

    constructor(private readonly ProviderRep: ProviderRep) {}

    execute = async (): Promise<ProviderResponse[]> => {
        const providers = await this.ProviderRep.findAllActive();
        return providers.map(p => EProvider.fromModel(p).toResponse());
    }
}
