import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProviderCtr } from './controllers/Provider.controller';
import { CreateProviderSrv } from './domain/services/CreateProvider.service';
import { GetProvidersSrv } from './domain/services/GetProviders.service';
import { RemoveProviderSrv } from './domain/services/RemoveProvider.service';
import { UpdateProviderSrv } from './domain/services/UpdateProvider.service';
import { Product } from '../product/models/Product.model';
import { Provider } from './models/Provider.model';
import { ProviderRep } from './repositories/Provider.repository';

/**
 * @Module Provider
 * - Reemplaza al Container/Services.index de Express: Nest instancia e inyecta todo.
 * - Exporta el repositorio para que otros módulos (Product, Caja) validen proveedores.
 */
@Module({
    imports: [SequelizeModule.forFeature([Provider, Product])],
    controllers: [ProviderCtr],
    providers: [
        ProviderRep,
        GetProvidersSrv,
        CreateProviderSrv,
        UpdateProviderSrv,
        RemoveProviderSrv,
    ],
    exports: [ProviderRep],
})
export class ProviderModule {}
