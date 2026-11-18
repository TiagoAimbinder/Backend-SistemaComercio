import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './User.model';

export interface RoleAttrs {
    rol_id: number;
    rol_name: string;
}

/** @Model Role (catálogo: Gerente, Cajero — ver database/seed.sql) */
@Table({ tableName: 'Role', timestamps: false })
export class Role extends Model<RoleAttrs, Omit<RoleAttrs, 'rol_id'>> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.SMALLINT)
    declare rol_id: number;

    @Column({ type: DataType.STRING(20), allowNull: false })
    declare rol_name: string;

    @HasMany(() => User, 'rol_id')
    declare users?: User[];
}
