import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SaveProductDto } from '../../dto/Product.dto';
import { ProductRep } from '../../repositories/Product.repository';
import { EProduct, ProductResponse } from '../entities/Product.entity';
import { ValidateProductSrv } from './ValidateProduct.service';

/**
 * @UseCase Crear producto
 * 1. Proveedor activo.
 * 2. Código de barras libre (o liberado de un producto dado de baja).
 * 3. Crear y devolver con prov_name.
 */
@Injectable()
export class CreateProductSrv {

    constructor(
        private readonly sequelize: Sequelize,
        private readonly ProductRep: ProductRep,
        private readonly ValidateProductSrv: ValidateProductSrv,
    ) {}

    execute = async (dto: SaveProductDto): Promise<ProductResponse> => {
        return this.sequelize.transaction(async (t) => {
            await this.ValidateProductSrv.provider(dto.prov_id, t);
            await this.ValidateProductSrv.barcode(dto.prod_barcode, t);

            const created = await this.ProductRep.create({
                prov_id: dto.prov_id,
                prod_barcode: dto.prod_barcode,
                prod_name: dto.prod_name,
                prod_cost: dto.prod_cost,
                prod_price: dto.prod_price,
                prod_stock: dto.prod_stock,
            }, t);

            const product = await this.ProductRep.findByIdWithProvider(created.prod_id, t);
            return EProduct.fromModel(product!).toResponse();
        });
    }
}
