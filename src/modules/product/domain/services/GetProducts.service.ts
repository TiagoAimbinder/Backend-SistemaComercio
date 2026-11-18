import { Injectable } from '@nestjs/common';
import { ProductRep } from '../../repositories/Product.repository';
import { EProduct, ProductResponse } from '../entities/Product.entity';

/**
 * @UseCase Listar productos activos con el nombre del proveedor
 */
@Injectable()
export class GetProductsSrv {

    constructor(private readonly ProductRep: ProductRep) {}

    execute = async (): Promise<ProductResponse[]> => {
        const products = await this.ProductRep.findAllActive();
        return products.map(p => EProduct.fromModel(p).toResponse());
    }
}
