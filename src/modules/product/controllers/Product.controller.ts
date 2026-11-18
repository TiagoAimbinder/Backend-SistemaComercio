import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiResponse } from '../../../common/types/ApiResponse';
import { ProductResponse } from '../domain/entities/Product.entity';
import { BulkPriceSrv } from '../domain/services/BulkPrice.service';
import { CreateProductSrv } from '../domain/services/CreateProduct.service';
import { GetProductsSrv } from '../domain/services/GetProducts.service';
import { RemoveProductsSrv } from '../domain/services/RemoveProducts.service';
import { StockOrderSrv } from '../domain/services/StockOrder.service';
import { UpdateProductSrv } from '../domain/services/UpdateProduct.service';
import { BulkPriceDto, RemoveProductsDto, SaveProductDto, StockOrderDto } from '../dto/Product.dto';

/**
 * @Controller /products
 * - Rutas según endpoints.library.ts del front.
 * - Las rutas fijas (bulk-price, stock-order, delete) van antes que :id.
 */
@Controller('products')
export class ProductCtr {

    constructor(
        private readonly GetProductsSrv: GetProductsSrv,
        private readonly CreateProductSrv: CreateProductSrv,
        private readonly UpdateProductSrv: UpdateProductSrv,
        private readonly RemoveProductsSrv: RemoveProductsSrv,
        private readonly BulkPriceSrv: BulkPriceSrv,
        private readonly StockOrderSrv: StockOrderSrv,
    ) {}

    @Get()
    async getAll(): Promise<ApiResponse<ProductResponse[]>> {
        const data = await this.GetProductsSrv.execute();
        return { message: 'Products obtained successfully', data };
    }

    @Post()
    async create(@Body() dto: SaveProductDto): Promise<ApiResponse<ProductResponse>> {
        const data = await this.CreateProductSrv.execute(dto);
        return { message: 'Product created successfully', data };
    }

    @Put('bulk-price')
    async bulkPrice(@Body() dto: BulkPriceDto): Promise<ApiResponse> {
        await this.BulkPriceSrv.execute(dto);
        return { message: 'Prices updated successfully' };
    }

    @Post('stock-order')
    @HttpCode(HttpStatus.OK)
    async stockOrder(@Body() dto: StockOrderDto): Promise<ApiResponse> {
        await this.StockOrderSrv.execute(dto);
        return { message: 'Stock updated successfully' };
    }

    @Post('delete')
    @HttpCode(HttpStatus.OK)
    async remove(@Body() dto: RemoveProductsDto): Promise<ApiResponse> {
        await this.RemoveProductsSrv.execute(dto.prod_ids);
        return { message: 'Products removed successfully' };
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) prod_id: number, @Body() dto: SaveProductDto): Promise<ApiResponse<ProductResponse>> {
        const data = await this.UpdateProductSrv.execute(prod_id, dto);
        return { message: 'Product updated successfully', data };
    }
}
