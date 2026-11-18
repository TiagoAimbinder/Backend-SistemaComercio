import { TransformFnParams } from 'class-transformer';

/**
 * @Transforms para DTOs (class-transformer)
 * - trim: recorta espacios en strings.
 * - emptyToNull: '' / '   ' / undefined -> null. En la base "no tiene" es NULL, no ''.
 */
export const trim = ({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value;

export const emptyToNull = ({ value }: TransformFnParams) => {
    if (value === undefined || value === null) return null;
    const v = String(value).trim();
    return v === '' ? null : v;
};

/** NUMERIC de Postgres llega como string ("1300.00") -> number */
export const toNumber = (value: unknown): number => Number(value ?? 0) || 0;
