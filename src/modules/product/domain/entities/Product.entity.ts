import { toNumber } from '../../../../common/utils/transform.util';
import { ProductWithProvider } from '../../models/Product.model';

export type BulkPriceMode = 'amount' | 'percent';

export type ProductResponse = {
    prod_id: number;
    prov_id: number;
    prov_name: string | null;
    prod_barcode: string | null;
    prod_name: string;
    prod_cost: number;
    prod_price: number;
    prod_stock: number;
    prod_active: boolean;
};

/**
 * @Entity Product
 * - Convierte los DECIMAL (string) a number y arma la respuesta hacia el front.
 * - Contiene las reglas de precio (cambio masivo) para que sean iguales en front y back.
 */
export class EProduct {

    constructor(private readonly data: ProductWithProvider) {}

    static fromModel = (m: ProductWithProvider) => new EProduct(m);

    get prod_id() { return this.data.prod_id; }
    get prod_name() { return this.data.prod_name; }
    get prod_price() { return toNumber(this.data.prod_price); }

    /**
     * Precio nuevo según el cambio masivo, redondeado a 2 decimales.
     * Misma fórmula que `applyBulkPrice` del front.
     */
    static applyBulkPrice = (price: number, mode: BulkPriceMode, value: number): number => {
        const next = mode === 'percent' ? price * (1 + value / 100) : price + value;
        return Math.round((next + Number.EPSILON) * 100) / 100;
    }

    toResponse = (): ProductResponse => ({
        prod_id: this.data.prod_id,
        prov_id: this.data.prov_id,
        prov_name: this.data.provider?.prov_name ?? null,
        prod_barcode: this.data.prod_barcode,
        prod_name: this.data.prod_name,
        prod_cost: toNumber(this.data.prod_cost),
        prod_price: toNumber(this.data.prod_price),
        prod_stock: this.data.prod_stock,
        prod_active: this.data.prod_active,
    });
}
