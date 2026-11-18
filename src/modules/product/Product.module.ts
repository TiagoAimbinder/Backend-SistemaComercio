import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProviderModule } from '../provider/Provider.module';
import { ProductCtr } from './controllers/Product.controller';
import { BulkPriceSrv } from './domain/services/BulkPrice.service';
import { CreateProductSrv } from './domain/services/CreateProduct.service';
import { GetProductsSrv } from './domain/services/GetProducts.service';
import { RemoveProductsSrv } from './domain/services/RemoveProducts.service';
import { StockOrderSrv } from './domain/services/StockOrder.service';
import { UpdateProductSrv } from './domain/services/UpdateProduct.service';
import { ValidateProductSrv } from './domain/services/ValidateProduct.service';
import { Product } from './models/Product.model';
import { ProductRep } from './repositories/Product.repository';

/**
 * @Module Product
 * - Importa ProviderModule para validar proveedores (usa su ProviderRep exportado).
 * - Exporta ProductRep para Venta (descuento de stock, copia de nombre y precio).
 */
@Module({
    imports: [SequelizeModule.forFeature([Product]), ProviderModule],
    controllers: [ProductCtr],
    providers: [
        ProductRep,
        ValidateProductSrv,
        GetProductsSrv,
        CreateProductSrv,
        UpdateProductSrv,
        RemoveProductsSrv,
        BulkPriceSrv,
        StockOrderSrv,
    ],
    exports: [ProductRep],
})
export class ProductModule {}
