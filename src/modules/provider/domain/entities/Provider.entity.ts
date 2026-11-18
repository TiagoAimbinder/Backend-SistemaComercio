import { ProviderAttrs } from '../../models/Provider.model';

export type ProviderResponse = {
    prov_id: number;
    prov_name: string;
    prov_email: string | null;
    prov_phone: string | null;
    prov_active: boolean;
};

/**
 * @Entity Provider
 * - Normaliza los datos (trim, '' -> null) y arma la respuesta hacia el front.
 */
export class EProvider {

    readonly prov_id: number | null;
    readonly prov_name: string;
    readonly prov_email: string | null;
    readonly prov_phone: string | null;
    readonly prov_active: boolean;

    constructor(data: Partial<ProviderAttrs> & { prov_name: string }) {
        this.prov_id = data.prov_id ?? null;
        this.prov_name = data.prov_name.trim();
        this.prov_email = data.prov_email?.trim().toLowerCase() || null;
        this.prov_phone = data.prov_phone?.trim() || null;
        this.prov_active = data.prov_active ?? true;
    }

    static fromModel = (m: ProviderAttrs) => new EProvider(m);

    /** Datos para insertar / actualizar */
    get dto() {
        return {
            prov_name: this.prov_name,
            prov_email: this.prov_email,
            prov_phone: this.prov_phone,
        };
    }

    toResponse = (): ProviderResponse => ({
        prov_id: this.prov_id as number,
        prov_name: this.prov_name,
        prov_email: this.prov_email,
        prov_phone: this.prov_phone,
        prov_active: this.prov_active,
    });
}
