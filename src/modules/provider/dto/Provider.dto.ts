import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { emptyToNull, trim } from '../../../common/utils/transform.util';

/**
 * @DTO Crear / editar proveedor
 * - Email y teléfono opcionales: '' se guarda como NULL.
 */
export class SaveProviderDto {

    @Transform(trim)
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MaxLength(150)
    prov_name: string;

    @Transform(emptyToNull)
    @IsOptional()
    @IsEmail({}, { message: 'El email no es válido' })
    @MaxLength(254)
    prov_email: string | null;

    @Transform(emptyToNull)
    @IsOptional()
    @Matches(/^[\d\s()+-]{6,30}$/, { message: 'El teléfono no es válido' })
    prov_phone: string | null;
}
