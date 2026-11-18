import { randomBytes, scrypt as scryptCb, ScryptOptions, timingSafeEqual } from 'crypto';

/**
 * @Password
 * - Hash con scrypt (incluido en Node, sin dependencias nativas como bcrypt).
 * - Formato guardado en usu_hash_password:  scrypt$N$r$p$salt(base64)$hash(base64)
 *   Los parámetros viajan con el hash: se pueden subir en el futuro sin invalidar los viejos.
 */
const N = 16384, R = 8, P = 1, KEYLEN = 64, SALT_BYTES = 16;

const scrypt = (password: string, salt: Buffer, keylen: number, opts: ScryptOptions) =>
    new Promise<Buffer>((resolve, reject) =>
        scryptCb(password, salt, keylen, opts, (err, key) => err ? reject(err) : resolve(key)));

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(SALT_BYTES);
    const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P });
    return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
};

/** Compara en tiempo constante. Devuelve false ante cualquier formato inválido. */
export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
    const [algo, n, r, p, saltB64, hashB64] = (stored ?? '').split('$');
    if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;

    const expected = Buffer.from(hashB64, 'base64');
    const key = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
        N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
    });
    return key.length === expected.length && timingSafeEqual(key, expected);
};

/** Reglas mínimas de contraseña (las mismas en el script de alta y a futuro en la pantalla de usuarios) */
export const PASSWORD_MIN_LENGTH = 8;
