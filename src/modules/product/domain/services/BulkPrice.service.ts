import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { BulkPriceDto } from '../../dto/Product.dto';
import { ProductRep } from '../../repositories/Product.repository';
import { EProduct } from '../entities/Product.entity';

/**
 * @UseCase Cambio de precio masivo
 * 1. Todos los productos deben existir y estar activos.
 * 2. Ningún precio puede quedar negativo (se valida antes de tocar nada).
 * 3. Se actualiza todo en una transacción: o cambian todos o ninguno.
 */
@Injectable()
export class BulkPriceSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProductRep: ProductRep,
    ) {}

    execute = async ({ prod_ids, mode, value }: BulkPriceDto): Promise<void> => {
        await this.sequelize.transaction(async (t) => {
            const products = (await this.ProductRep.findActiveByIds(prod_ids, t)).map(EProduct.fromModel);
            if (products.length !== prod_ids.length) {
                throw AppException.notFound('Uno o más productos no existen', 'PRODUCT_NOT_FOUND');
            }

            const changes = products.map(p => ({ p, price: EProduct.applyBulkPrice(p.prod_price, mode, value) }));

            const negative = changes.filter(c => c.price < 0).map(c => c.p.prod_name);
            if (negative.length) {
                throw AppException.badRequest(`El precio quedaría negativo en: ${negative.join(', ')}`, 'PRODUCT_NEGATIVE_PRICE');
            }

            for (const { p, price } of changes) {
                await this.ProductRep.updatePrice(p.prod_id, price, t);
            }
        });
    }
}
