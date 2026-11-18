import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { literal, Transaction } from 'sequelize';
import { AuthUser } from '../../../common/decorators/CurrentUser.decorator';
import { EUser, UserWithCashResponse } from '../domain/entities/User.entity';
import { Role } from '../models/Role.model';
import { User, UserAttrs, UserCreationAttrs, UserWithRole } from '../models/User.model';

/**
 * @Repository User
 * - Único acceso a "User" y Role. El hash solo se lee en findByUsername (login).
 */
@Injectable()
export class UserRep {

    constructor(
        @InjectModel(User) private readonly model: typeof User,
        @InjectModel(Role) private readonly roleModel: typeof Role,
    ) {}

    private readonly withRole = { model: Role, attributes: ['rol_name'] };

    /** Para el login: incluye el hash */
    findByUsername = async (usu_username: string, transaction?: Transaction): Promise<UserWithRole | null> => {
        const row = await this.model.findOne({ where: { usu_username }, include: [this.withRole], transaction });
        return row ? row.get({ plain: true }) : null;
    }

    /** Para el guard: usuario activo, sin el hash */
    findActiveById = async (usu_id: number): Promise<AuthUser | null> => {
        if (!Number.isInteger(usu_id) || usu_id <= 0) return null;
        const row = await this.model.findOne({
            where: { usu_id, usu_active: true },
            attributes: { exclude: ['usu_hash_password'] },
            include: [this.withRole],
        });
        return row ? EUser.fromModel(row.get({ plain: true })).toResponse() : null;
    }

    /** Usuarios activos + si tienen una caja abierta (para elegir encargado al abrir caja) */
    findAllActiveWithOpenCash = async (): Promise<UserWithCashResponse[]> => {
        const rows = await this.model.findAll({
            where: { usu_active: true },
            attributes: {
                exclude: ['usu_hash_password'],
                include: [[literal(`CASE WHEN EXISTS (
                    SELECT 1 FROM "CashRegister" c WHERE c.user_id = "User".usu_id AND c.cash_closed_at IS NULL
                ) THEN 1 ELSE 0 END`), 'hasOpenCash']],
            },
            include: [this.withRole],
            order: [['usu_name', 'ASC']],
        });
        return rows.map(r => {
            const plain = r.get({ plain: true }) as UserWithRole & { hasOpenCash: number };
            return { ...EUser.fromModel(plain).toResponse(), hasOpenCash: Boolean(plain.hasOpenCash) };
        });
    }

    findRoleByName = async (rol_name: string, transaction?: Transaction) => {
        const row = await this.roleModel.findOne({ where: { rol_name }, raw: true, transaction });
        return row ?? null;
    }

    create = async (data: UserCreationAttrs, transaction?: Transaction): Promise<UserAttrs> => {
        const created = await this.model.create(data, { transaction });
        return created.get({ plain: true });
    }

    updatePassword = async (usu_id: number, usu_hash_password: string, transaction?: Transaction): Promise<void> => {
        await this.model.update({ usu_hash_password, usu_active: true }, { where: { usu_id }, transaction });
    }

    touchLastLogin = async (usu_id: number): Promise<void> => {
        await this.model.update({ usu_last_login_at: new Date() }, { where: { usu_id }, silent: true });
    }
}
