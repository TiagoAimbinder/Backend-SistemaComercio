import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize, ArrayNotEmpty, ArrayUnique, IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional,
    IsString, Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { emptyToNull, trim } from '../../../common/utils/transform.util';
import { BulkPriceMode } from '../domain/entities/Product.entity';

/** Límite de DECIMAL(10,2) */
const MAX_PRICE = 99_999_999.99;
const MAX_IDS = 500;

/**
 * @DTO Crear / editar producto
 */
export class SaveProductDto {

    @Transform(trim)
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MaxLength(150)
    prod_name: string;

    @IsInt()
    @Min(1)
    prov_id: number;

    /** Opcional: '' = sin código (se guarda NULL) */
    @Transform(emptyToNull)
    @IsOptional()
    @Matches(/^[A-Za-z0-9-]{1,50}$/, { message: 'El código de barras no es válido' })
    prod_barcode: string | null;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(MAX_PRICE)
    prod_cost: number = 0;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(MAX_PRICE)
    prod_price: number;

    /** Puede ser negativo: se permite vender sin stock */
    @IsInt()
    prod_stock: number;
}

/**
 * @DTO Baja (lógica) de varios productos
 */
export class RemoveProductsDto {

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(MAX_IDS)
    @ArrayUnique()
    @IsInt({ each: true })
    @Min(1, { each: true })
    prod_ids: number[];
}

/**
 * @DTO Cambio de precio masivo: suma un monto fijo o un porcentaje (puede ser negativo)
 */
export class BulkPriceDto extends RemoveProductsDto {

    @IsIn(['amount', 'percent'])
    mode: BulkPriceMode;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(-MAX_PRICE)
    @Max(MAX_PRICE)
    value: number;
}

export class StockOrderItemDto {

    @IsInt()
    @Min(1)
    prod_id: number;

    @IsInt()
    @Min(1)
    @Max(100_000)
    quantity: number;
}

/**
 * @DTO Ingreso de pedido de proveedor: suma stock
 */
export class StockOrderDto {

    @IsInt()
    @Min(1)
    prov_id: number;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(MAX_IDS)
    @ArrayUnique((i: StockOrderItemDto) => i.prod_id, { message: 'Hay productos repetidos en el pedido' })
    @ValidateNested({ each: true })
    @Type(() => StockOrderItemDto)
    items: StockOrderItemDto[];
}
