import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiResponse } from '../../../common/types/ApiResponse';
import { CreateProviderSrv } from '../domain/services/CreateProvider.service';
import { GetProvidersSrv } from '../domain/services/GetProviders.service';
import { RemoveProviderSrv } from '../domain/services/RemoveProvider.service';
import { UpdateProviderSrv } from '../domain/services/UpdateProvider.service';
import { ProviderResponse } from '../domain/entities/Provider.entity';
import { SaveProviderDto } from '../dto/Provider.dto';

/**
 * @Controller /providers
 * - Solo recibe, delega en el caso de uso y arma { message, data }.
 * - La validación la hace el ValidationPipe global con los DTOs; los errores, el filtro global.
 */
@Controller('providers')
export class ProviderCtr {

    constructor(
        private readonly GetProvidersSrv: GetProvidersSrv,
        private readonly CreateProviderSrv: CreateProviderSrv,
        private readonly UpdateProviderSrv: UpdateProviderSrv,
        private readonly RemoveProviderSrv: RemoveProviderSrv,
    ) {}

    @Get()
    async getAll(): Promise<ApiResponse<ProviderResponse[]>> {
        const data = await this.GetProvidersSrv.execute();
        return { message: 'Providers obtained successfully', data };
    }

    @Post()
    async create(@Body() dto: SaveProviderDto): Promise<ApiResponse<ProviderResponse>> {
        const data = await this.CreateProviderSrv.execute(dto);
        return { message: 'Provider created successfully', data };
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) prov_id: number, @Body() dto: SaveProviderDto): Promise<ApiResponse<ProviderResponse>> {
        const data = await this.UpdateProviderSrv.execute(prov_id, dto);
        return { message: 'Provider updated successfully', data };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) prov_id: number): Promise<ApiResponse> {
        await this.RemoveProviderSrv.execute(prov_id);
        return { message: 'Provider removed successfully' };
    }
}
