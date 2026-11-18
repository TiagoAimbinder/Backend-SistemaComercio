import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { ProviderRep } from '../../repositories/Provider.repository';

/**
 * @UseCase Dar de baja un proveedor (baja lógica)
 * - No se puede si tiene productos activos: primero hay que reasignarlos o darlos de baja.
 */
@Injectable()
export class RemoveProviderSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProviderRep: ProviderRep,
    ) {}

    execute = async (prov_id: number): Promise<void> => {
        await this.sequelize.transaction(async (t) => {
            const current = await this.ProviderRep.findById(prov_id, t);
            if (!current || !current.prov_active) throw AppException.notFound('El proveedor no existe', 'PROVIDER_NOT_FOUND');

            const products = await this.ProviderRep.countActiveProducts(prov_id, t);
            if (products > 0) {
                throw AppException.conflict(`El proveedor tiene ${products} producto(s) activo(s)`, 'PROVIDER_HAS_PRODUCTS');
            }

            await this.ProviderRep.setActive(prov_id, false, t);
        });
    }
}
