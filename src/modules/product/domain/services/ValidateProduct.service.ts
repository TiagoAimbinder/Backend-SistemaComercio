import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { AppException } from '../../../../common/exceptions/App.exception';
import { ProviderRep } from '../../../provider/repositories/Provider.repository';
import { ProductRep } from '../../repositories/Product.repository';

/**
 * @Service Validaciones compartidas por alta y edición de producto
 */
@Injectable()
export class ValidateProductSrv {

    constructor(
        private readonly ProductRep: ProductRep,
        private readonly ProviderRep: ProviderRep,
    ) {}

    /** El proveedor debe existir y estar activo */
    provider = async (prov_id: number, t: Transaction): Promise<void> => {
        const provider = await this.ProviderRep.findById(prov_id, t);
        if (!provider || !provider.prov_active) throw AppException.badRequest('El proveedor no existe', 'PROVIDER_NOT_FOUND');
    }

    /**
     * El código de barras no puede usarlo otro producto activo.
     * Si lo tiene un producto dado de baja, se le libera (queda en NULL) para reutilizarlo:
     * las ventas viejas guardan su propio nombre, así que no se pierde nada.
     */
    barcode = async (prod_barcode: string | null, t: Transaction, own_prod_id?: number): Promise<void> => {
        if (!prod_barcode) return;

        const taken = await this.ProductRep.findByBarcode(prod_barcode, t);
        if (!taken || taken.prod_id === own_prod_id) return;

        if (taken.prod_active) {
            throw AppException.conflict(`El código de barras ya lo usa "${taken.prod_name}"`, 'PRODUCT_BARCODE_DUPLICATE');
        }
        await this.ProductRep.releaseBarcode(taken.prod_id, t);
    }
}
