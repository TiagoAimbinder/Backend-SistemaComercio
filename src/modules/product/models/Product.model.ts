import { AutoIncrement, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import { Provider } from '../../provider/models/Provider.model';

export interface ProductAttrs {
    prod_id: number;
    prov_id: number;
    prod_barcode: string | null;
    prod_name: string;
    /** NUMERIC: Postgres lo devuelve como string */
    prod_cost: string | number;
    prod_price: string | number;
    prod_stock: number;
    prod_active: boolean;
    createdAt: Date;
    updatedAt: Date | null;
}

export type ProductCreationAttrs = Pick<ProductAttrs, 'prov_id' | 'prod_barcode' | 'prod_name' | 'prod_cost' | 'prod_price' | 'prod_stock'>;

/** Producto con el nombre del proveedor (JOIN) */
export type ProductWithProvider = ProductAttrs & { provider?: { prov_name: string } | null };

/**
 * @Model Product
 * - El esquema real (CHECKs, índice único filtrado del código de barras) está en database/schema.sql.
 */
@Table({ tableName: 'Product', timestamps: true })
export class Product extends Model<ProductAttrs, ProductCreationAttrs> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare prod_id: number;

    @ForeignKey(() => Provider)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare prov_id: number;

    @Column({ type: DataType.STRING(50), allowNull: true })
    declare prod_barcode: string | null;

    @Column({ type: DataType.STRING(150), allowNull: false })
    declare prod_name: string;

    @Default(0)
    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare prod_cost: string | number;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare prod_price: string | number;

    @Default(0)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare prod_stock: number;

    @Default(true)
    @Column({ type: DataType.BOOLEAN, allowNull: false })
    declare prod_active: boolean;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date | null;

    @BelongsTo(() => Provider, 'prov_id')
    declare provider?: Provider;
}
