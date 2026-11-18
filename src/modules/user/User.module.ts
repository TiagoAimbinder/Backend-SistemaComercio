import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserCtr } from './controllers/User.controller';
import { GetUsersSrv } from './domain/services/GetUsers.service';
import { Role } from './models/Role.model';
import { User } from './models/User.model';
import { UserRep } from './repositories/User.repository';

/**
 * @Module User
 * - Exporta UserRep para Auth (login y guard) y a futuro para Caja.
 */
@Module({
    imports: [SequelizeModule.forFeature([User, Role])],
    controllers: [UserCtr],
    providers: [UserRep, GetUsersSrv],
    exports: [UserRep],
})
export class UserModule {}
