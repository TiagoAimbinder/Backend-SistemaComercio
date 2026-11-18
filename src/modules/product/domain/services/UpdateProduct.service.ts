import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppException } from '../../../../common/exceptions/App.exception';
import { SaveProductDto } from '../../dto/Product.dto';
import { ProductRep } from '../../repositories/Product.repository';
import { EProduct, ProductResponse } from '../entities/Product.entity';
import { ValidateProductSrv } from './ValidateProduct.service';

/**
 * @UseCase Editar producto
 * 1. Debe existir y estar activo.
 * 2. Proveedor activo y código de barras libre (salvo que sea el propio).
 */
@Injectable()
export class UpdateProductSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProductRep: ProductRep,
        private readonly ValidateProductSrv: ValidateProductSrv,
    ) {}

    execute = async (prod_id: number, dto: SaveProductDto): Promise<ProductResponse> => {
        return this.sequelize.transaction(async (t) => {
            const current = await this.ProductRep.findById(prod_id, t);
            if (!current || !current.prod_active) throw AppException.notFound('El producto no existe', 'PRODUCT_NOT_FOUND');

            await this.ValidateProductSrv.provider(dto.prov_id, t);
            await this.ValidateProductSrv.barcode(dto.prod_barcode, t, prod_id);

            await this.ProductRep.update(prod_id, {
                prov_id: dto.prov_id,
                prod_barcode: dto.prod_barcode,
                prod_name: dto.prod_name,
                prod_cost: dto.prod_cost,
                prod_price: dto.prod_price,
                prod_stock: dto.prod_stock,
            }, t);

            const product = await this.ProductRep.findByIdWithProvider(prod_id, t);
            return EProduct.fromModel(product!).toResponse();
        });
    }
}
