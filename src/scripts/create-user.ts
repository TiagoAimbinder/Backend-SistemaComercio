/**
 * @Script Alta (o reseteo de contraseña) de un usuario desde la consola.
 *
 *   npm run build
 *   npm run user:create
 *
 * - Pregunta usuario, nombre, rol y contraseña por consola (la contraseña no se muestra
 *   y no queda en el historial ni en archivos).
 * - También acepta los datos por parámetro, ejecutándolo directo con node
 *   (PowerShell + npm se come los "--" y las comillas, por eso no se usan con npm run):
 *     node dist/scripts/create-user.js --username admin --name "Pintó Express Admin" --role Gerente
 * - Si el usuario ya existe, le cambia la contraseña y lo reactiva.
 * - Usa la misma conexión y el mismo hash que la API.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createInterface } from 'readline';
import { Writable } from 'stream';
import { AppModule } from '../app.module';
import { hashPassword, PASSWORD_MIN_LENGTH } from '../common/utils/password.util';
import { UserRep } from '../modules/user/repositories/User.repository';

const arg = (name: string): string | undefined => {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
};

/** Lee una línea (visible) */
const ask = (question: string): Promise<string> => new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
});

/** Lee una línea sin mostrar lo que se escribe */
const askHidden = (question: string): Promise<string> => new Promise(resolve => {
    let muted = false;
    const output = new Writable({ write: (chunk, _enc, cb) => { if (!muted) process.stdout.write(chunk); cb(); } });
    const rl = createInterface({ input: process.stdin, output, terminal: true });
    rl.question(question, answer => { rl.close(); process.stdout.write('\n'); resolve(answer); });
    muted = true;
});

async function main() {
    const username = (arg('username') ?? await ask('Usuario (para el login): ')).trim().toLowerCase();

    if (!username || !/^[a-z0-9._-]{3,50}$/.test(username)) throw new Error('--username: 3 a 50 caracteres (letras, números, . _ -)');

    // Nombre y rol solo hacen falta si el usuario es nuevo: se preguntan después de conectar
    const password = await askHidden(`Contraseña para "${username}": `);
    if (password.length < PASSWORD_MIN_LENGTH) throw new Error(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
    const repeat = await askHidden('Repetir contraseña: ');
    if (password !== repeat) throw new Error('Las contraseñas no coinciden');

    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
    try {
        const users = app.get(UserRep);
        const hash = await hashPassword(password);
        const existing = await users.findByUsername(username);

        if (existing) {
            await users.updatePassword(existing.usu_id, hash);
            Logger.log(`✅ Contraseña actualizada para "${username}" (id ${existing.usu_id})`, 'CreateUser');
            return;
        }

        const name = (arg('name') ?? await ask('Nombre para mostrar (ej. Pintó Express Admin): ')).trim();
        if (!name || name.length > 100) throw new Error('El nombre es obligatorio (máximo 100 caracteres)');
        const roleInput = (arg('role') ?? await ask('Rol [Gerente/Cajero] (Enter = Cajero): ')).trim() || 'Cajero';
        const role = roleInput.charAt(0).toUpperCase() + roleInput.slice(1).toLowerCase();
        const rol = await users.findRoleByName(role);
        if (!rol) throw new Error(`El rol "${role}" no existe (¿corriste database/seed.sql?)`);

        const created = await users.create({ rol_id: rol.rol_id, usu_name: name, usu_username: username, usu_hash_password: hash });
        Logger.log(`✅ Usuario "${username}" creado (id ${created.usu_id}, ${role})`, 'CreateUser');
    } finally {
        await app.close();
    }
}

main().catch(err => {
    Logger.error(err instanceof Error ? err.message : err, 'CreateUser');
    process.exit(1);
});
