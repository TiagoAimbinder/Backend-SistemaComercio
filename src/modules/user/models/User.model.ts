import { AutoIncrement, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import { Role } from './Role.model';

export interface UserAttrs {
    usu_id: number;
    rol_id: number;
    usu_name: string;
    usu_username: string;
    usu_hash_password: string;
    usu_active: boolean;
    usu_last_login_at: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
}

export type UserCreationAttrs = Pick<UserAttrs, 'rol_id' | 'usu_name' | 'usu_username' | 'usu_hash_password'>;

/** Usuario con el nombre del rol (JOIN) */
export type UserWithRole = UserAttrs & { role?: { rol_name: string } | null };

/**
 * @Model User
 * - La tabla se llama "User" (palabra reservada en Postgres): Sequelize la comilla solo.
 * - usu_hash_password NUNCA sale de la API (ver EUser.toResponse).
 */
@Table({ tableName: 'User', timestamps: true })
export class User extends Model<UserAttrs, UserCreationAttrs> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare usu_id: number;

    @ForeignKey(() => Role)
    @Column({ type: DataType.SMALLINT, allowNull: false })
    declare rol_id: number;

    @Column({ type: DataType.STRING(100), allowNull: false })
    declare usu_name: string;

    @Column({ type: DataType.STRING(50), allowNull: false })
    declare usu_username: string;

    @Column({ type: DataType.STRING(255), allowNull: false })
    declare usu_hash_password: string;

    @Default(true)
    @Column({ type: DataType.BOOLEAN, allowNull: false })
    declare usu_active: boolean;

    @Column({ type: DataType.DATE, allowNull: true })
    declare usu_last_login_at: Date | null;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date | null;

    @BelongsTo(() => Role, 'rol_id')
    declare role?: Role;
}
