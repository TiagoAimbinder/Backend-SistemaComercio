import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Transaction, where } from 'sequelize';
import { Product } from '../../product/models/Product.model';
import { Provider, ProviderAttrs, ProviderCreationAttrs } from '../models/Provider.model';

/**
 * @Repository Provider
 * - Único lugar que habla con la tabla Provider. Devuelve objetos planos (no instancias de Sequelize).
 */
@Injectable()
export class ProviderRep {

    constructor(
        @InjectModel(Provider) private readonly model: typeof Provider,
        @InjectModel(Product) private readonly productModel: typeof Product,
    ) {}

    findAllActive = async (transaction?: Transaction): Promise<ProviderAttrs[]> => {
        return this.model.findAll({
            where: { prov_active: true },
            order: [['prov_name', 'ASC']],
            raw: true,
            transaction,
        });
    }

    findById = async (prov_id: number, transaction?: Transaction): Promise<ProviderAttrs | null> => {
        return this.model.findByPk(prov_id, { raw: true, transaction });
    }

    /** Sin distinguir mayúsculas: "Arcor" = "ARCOR" (igual que el índice único lower(prov_name)) */
    findByName = async (prov_name: string, transaction?: Transaction): Promise<ProviderAttrs | null> => {
        return this.model.findOne({
            where: where(fn('lower', col('prov_name')), prov_name.toLowerCase()),
            raw: true,
            transaction,
        });
    }

    create = async (data: ProviderCreationAttrs, transaction?: Transaction): Promise<ProviderAttrs> => {
        const created = await this.model.create(data, { transaction });
        return created.get({ plain: true });
    }

    update = async (prov_id: number, data: Partial<ProviderCreationAttrs>, transaction?: Transaction): Promise<void> => {
        await this.model.update(data, { where: { prov_id }, transaction });
    }

    setActive = async (prov_id: number, prov_active: boolean, transaction?: Transaction): Promise<void> => {
        await this.model.update({ prov_active }, { where: { prov_id }, transaction });
    }

    countActiveProducts = async (prov_id: number, transaction?: Transaction): Promise<number> => {
        return this.productModel.count({ where: { prov_id, prod_active: true }, transaction });
    }
}
