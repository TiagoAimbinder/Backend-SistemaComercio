import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { ProductRep } from '../../repositories/Product.repository';

/**
 * @UseCase Dar de baja productos (baja lógica)
 * - Las ventas referencian productos: nunca se borran físicamente.
 * - Si alguno no existe o ya estaba de baja, no se da de baja ninguno.
 */
@Injectable()
export class RemoveProductsSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProductRep: ProductRep,
    ) {}

    execute = async (prod_ids: number[]): Promise<void> => {
        await this.sequelize.transaction(async (t) => {
            const affected = await this.ProductRep.deactivate(prod_ids, t);
            if (affected !== prod_ids.length) {
                throw AppException.notFound('Uno o más productos no existen', 'PRODUCT_NOT_FOUND');
            }
        });
    }
}
