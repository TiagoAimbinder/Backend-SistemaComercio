import * as Joi from 'joi';

/**
 * @EnvValidation
 * - Valida las variables de entorno al arrancar: si falta algo, la app no levanta.
 */
export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('local', 'dev', 'prod').default('local'),
    PORT: Joi.number().port().default(3000),
    CORS_ORIGIN: Joi.string().default('http://localhost:4200'),

    /** PostgreSQL: URL completa (Render: "External Database URL")... */
    DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).allow(''),
    /** ...o los datos por separado (obligatorios si no hay DATABASE_URL) */
    DB_HOST: Joi.string().when('DATABASE_URL', { is: Joi.string().min(1), then: Joi.optional(), otherwise: Joi.required() }),
    DB_PORT: Joi.number().port().default(5432),
    DB_USER: Joi.string().when('DATABASE_URL', { is: Joi.string().min(1), then: Joi.optional(), otherwise: Joi.required() }),
    DB_PASSWORD: Joi.string().allow('').default(''),
    DB_DATABASE: Joi.string().when('DATABASE_URL', { is: Joi.string().min(1), then: Joi.optional(), otherwise: Joi.required() }),
    /** true para bases remotas (Render la exige); false para un Postgres local */
    DB_SSL: Joi.boolean().default(false),

    /** Clave para firmar los tokens: mínimo 32 caracteres, distinta en cada entorno */
    JWT_SECRET: Joi.string().min(32).required(),
    /** Duración de la sesión (formato ms: '12h', '30m') */
    JWT_EXPIRES_IN: Joi.string().pattern(/^\d+[smhd]$/).default('12h'),
});
