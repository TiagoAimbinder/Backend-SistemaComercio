import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

/**
 * @Database
 * - Conexión a PostgreSQL con Sequelize (dialecto postgres / driver pg).
 * - DATABASE_URL (la "External Database URL" de Render) tiene prioridad sobre DB_HOST / DB_USER / ...
 * - DB_SSL=true para conexiones remotas (Render exige SSL desde afuera de su red).
 * - synchronize: false -> el esquema lo define database/schema.sql (columnas calculadas,
 *   índices parciales y CHECKs que Sequelize no maneja). Nunca usar sync().
 * - Los modelos se registran solos desde cada módulo (SequelizeModule.forFeature).
 */
export const databaseConfig = (config: ConfigService): SequelizeModuleOptions => {
    const url = config.get<string>('DATABASE_URL');
    const ssl = config.get<boolean>('DB_SSL', false);

    return {
        dialect: 'postgres',
        ...(url
            ? { uri: url }
            : {
                host: config.getOrThrow<string>('DB_HOST'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.getOrThrow<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD', ''),
                database: config.getOrThrow<string>('DB_DATABASE'),
            }),
        dialectOptions: ssl
            // Render usa certificados que el driver no puede validar contra una CA local:
            // el canal va cifrado igual, pero sin verificar el certificado del servidor.
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
        timezone: '+00:00',
        autoLoadModels: true,
        synchronize: false,
        logging: false,
        define: {
            freezeTableName: true,
            timestamps: false,
        },
        pool: { max: 10, min: 0, idle: 10000 },
    };
};
