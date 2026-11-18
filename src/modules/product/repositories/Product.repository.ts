import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { Provider } from '../../provider/models/Provider.model';
import { Product, ProductAttrs, ProductCreationAttrs, ProductWithProvider } from '../models/Product.model';

/**
 * @Repository Product
 * - Único lugar que habla con la tabla Product. Devuelve objetos planos.
 */
@Injectable()
export class ProductRep {

    constructor(@InjectModel(Product) private readonly model: typeof Product) {}

    /** JOIN con Provider para devolver prov_name */
    private readonly withProvider = { model: Provider, attributes: ['prov_name'] };

    findAllActive = async (transaction?: Transaction): Promise<ProductWithProvider[]> => {
        const rows = await this.model.findAll({
            where: { prod_active: true },
            include: [this.withProvider],
            order: [['prod_name', 'ASC']],
            transaction,
        });
        return rows.map(r => r.get({ plain: true }));
    }

    findByIdWithProvider = async (prod_id: number, transaction?: Transaction): Promise<ProductWithProvider | null> => {
        const row = await this.model.findByPk(prod_id, { include: [this.withProvider], transaction });
        return row ? row.get({ plain: true }) : null;
    }

    findById = async (prod_id: number, transaction?: Transaction): Promise<ProductAttrs | null> => {
        return this.model.findByPk(prod_id, { raw: true, transaction });
    }

    findActiveByIds = async (prod_ids: number[], transaction?: Transaction): Promise<ProductAttrs[]> => {
        return this.model.findAll({
            where: { prod_id: { [Op.in]: prod_ids }, prod_active: true },
            raw: true,
            transaction,
        });
    }

    /** Incluye productos dados de baja: el índice único del código de barras también los cubre */
    findByBarcode = async (prod_barcode: string, transaction?: Transaction): Promise<ProductAttrs | null> => {
        return this.model.findOne({ where: { prod_barcode }, raw: true, transaction });
    }

    create = async (data: ProductCreationAttrs, transaction?: Transaction): Promise<ProductAttrs> => {
        const created = await this.model.create(data, { transaction });
        return created.get({ plain: true });
    }

    update = async (prod_id: number, data: Partial<ProductCreationAttrs>, transaction?: Transaction): Promise<void> => {
        await this.model.update(data, { where: { prod_id }, transaction });
    }

    updatePrice = async (prod_id: number, prod_price: number, transaction?: Transaction): Promise<void> => {
        await this.model.update({ prod_price }, { where: { prod_id }, transaction });
    }

    /** Libera el código de barras de un producto dado de baja para poder reutilizarlo */
    releaseBarcode = async (prod_id: number, transaction?: Transaction): Promise<void> => {
        await this.model.update({ prod_barcode: null }, { where: { prod_id, prod_active: false }, transaction });
    }

    deactivate = async (prod_ids: number[], transaction?: Transaction): Promise<number> => {
        const [affected] = await this.model.update(
            { prod_active: false },
            { where: { prod_id: { [Op.in]: prod_ids }, prod_active: true }, transaction },
        );
        return affected;
    }

    /** Suma stock de forma atómica (UPDATE ... SET prod_stock = prod_stock + n) */
    incrementStock = async (prod_id: number, quantity: number, transaction?: Transaction): Promise<void> => {
        await this.model.increment('prod_stock', { by: quantity, where: { prod_id }, transaction });
    }
}
