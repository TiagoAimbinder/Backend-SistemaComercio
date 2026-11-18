import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { StockOrderDto } from '../../dto/Product.dto';
import { ProductRep } from '../../repositories/Product.repository';
import { ValidateProductSrv } from './ValidateProduct.service';

/**
 * @UseCase Ingreso de pedido de proveedor (suma stock)
 * 1. Proveedor activo.
 * 2. Todos los productos existen, están activos y son de ese proveedor.
 * 3. Suma atómica de stock en una transacción.
 */
@Injectable()
export class StockOrderSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProductRep: ProductRep,
        private readonly ValidateProductSrv: ValidateProductSrv,
    ) {}

    execute = async ({ prov_id, items }: StockOrderDto): Promise<void> => {
        await this.sequelize.transaction(async (t) => {
            await this.ValidateProductSrv.provider(prov_id, t);

            const ids = items.map(i => i.prod_id);
            const products = await this.ProductRep.findActiveByIds(ids, t);
            if (products.length !== ids.length) {
                throw AppException.notFound('Uno o más productos no existen', 'PRODUCT_NOT_FOUND');
            }

            const foreign = products.filter(p => p.prov_id !== prov_id).map(p => p.prod_name);
            if (foreign.length) {
                throw AppException.badRequest(`No son de este proveedor: ${foreign.join(', ')}`, 'PRODUCT_PROVIDER_MISMATCH');
            }

            for (const { prod_id, quantity } of items) {
                await this.ProductRep.incrementStock(prod_id, quantity, t);
            }
        });
    }
}
