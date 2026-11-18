import { AuthUser } from '../../../../common/decorators/CurrentUser.decorator';
import { UserWithRole } from '../../models/User.model';

export type UserResponse = AuthUser;
export type UserWithCashResponse = UserResponse & { hasOpenCash: boolean };

/**
 * @Entity User
 * - Arma la respuesta hacia el front SIN el hash de la contraseña.
 */
export class EUser {

    constructor(private readonly data: UserWithRole) {}

    static fromModel = (m: UserWithRole) => new EUser(m);

    get usu_id() { return this.data.usu_id; }
    get isActive() { return this.data.usu_active; }
    get passwordHash() { return this.data.usu_hash_password; }

    toResponse = (): UserResponse => ({
        usu_id: this.data.usu_id,
        usu_name: this.data.usu_name,
        usu_username: this.data.usu_username,
        rol_name: this.data.role?.rol_name ?? '',
    });
}
