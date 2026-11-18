import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { SaveProviderDto } from '../../dto/Provider.dto';
import { ProviderRep } from '../../repositories/Provider.repository';
import { EProvider, ProviderResponse } from '../entities/Provider.entity';

/**
 * @UseCase Editar proveedor
 * 1. Debe existir y estar activo.
 * 2. El nombre nuevo no puede ser de otro proveedor (activo o no, por el UNIQUE).
 */
@Injectable()
export class UpdateProviderSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProviderRep: ProviderRep,
    ) {}

    execute = async (prov_id: number, dto: SaveProviderDto): Promise<ProviderResponse> => {
        const ep = new EProvider({ ...dto, prov_id });

        return this.sequelize.transaction(async (t) => {
            const current = await this.ProviderRep.findById(prov_id, t);
            if (!current || !current.prov_active) throw AppException.notFound('El proveedor no existe', 'PROVIDER_NOT_FOUND');

            const sameName = await this.ProviderRep.findByName(ep.prov_name, t);
            if (sameName && sameName.prov_id !== prov_id) {
                throw AppException.conflict(`Ya existe el proveedor "${sameName.prov_name}"`, 'PROVIDER_DUPLICATE');
            }

            await this.ProviderRep.update(prov_id, ep.dto, t);
            return ep.toResponse();
        });
    }
}
