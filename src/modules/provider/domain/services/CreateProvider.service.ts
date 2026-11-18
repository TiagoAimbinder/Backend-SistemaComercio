import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { SaveProviderDto } from '../../dto/Provider.dto';
import { ProviderRep } from '../../repositories/Provider.repository';
import { EProvider, ProviderResponse } from '../entities/Provider.entity';

/**
 * @UseCase Crear proveedor
 * 1. Si existe uno activo con el mismo nombre -> 409.
 * 2. Si existe uno dado de baja con ese nombre -> se reactiva con los datos nuevos
 *    (prov_name es UNIQUE: no se puede crear otro).
 * 3. Si no existe -> se crea.
 */
@Injectable()
export class CreateProviderSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProviderRep: ProviderRep,
    ) {}

    execute = async (dto: SaveProviderDto): Promise<ProviderResponse> => {
        const ep = new EProvider(dto);

        return this.sequelize.transaction(async (t) => {
            const existing = await this.ProviderRep.findByName(ep.prov_name, t);

            if (existing?.prov_active) {
                throw AppException.conflict(`Ya existe el proveedor "${existing.prov_name}"`, 'PROVIDER_DUPLICATE');
            }

            if (existing) {
                await this.ProviderRep.update(existing.prov_id, { ...ep.dto, prov_active: true }, t);
                return new EProvider({ ...ep.dto, prov_id: existing.prov_id }).toResponse();
            }

            const created = await this.ProviderRep.create(ep.dto, t);
            return EProvider.fromModel(created).toResponse();
        });
    }
}
