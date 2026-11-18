import { AutoIncrement, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Product } from '../../product/models/Product.model';

export interface ProviderAttrs {
    prov_id: number;
    prov_name: string;
    prov_email: string | null;
    prov_phone: string | null;
    prov_active: boolean;
}

export type ProviderCreationAttrs = Omit<ProviderAttrs, 'prov_id' | 'prov_active'> & { prov_active?: boolean };

/**
 * @Model Provider
 * - Mapeo de la tabla. El esquema real (constraints, índices) está en database/schema.sql.
 * - `declare` evita que los campos de clase pisen los getters de Sequelize.
 */
@Table({ tableName: 'Provider', timestamps: false })
export class Provider extends Model<ProviderAttrs, ProviderCreationAttrs> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare prov_id: number;

    @Column({ type: DataType.STRING(150), allowNull: false })
    declare prov_name: string;

    @Column({ type: DataType.STRING(254), allowNull: true })
    declare prov_email: string | null;

    @Column({ type: DataType.STRING(30), allowNull: true })
    declare prov_phone: string | null;

    @Default(true)
    @Column({ type: DataType.BOOLEAN, allowNull: false })
    declare prov_active: boolean;

    @HasMany(() => Product, 'prov_id')
    declare products?: Product[];
}
