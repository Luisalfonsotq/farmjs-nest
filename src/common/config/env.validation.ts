// src/common/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    // Entorno
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3001),
    //VERCEL: Joi.number().default(0),

    // Base de Datos (Separadas como sugeriste)
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').default(''),
    DB_DATABASE: Joi.string().required(),

    // Seguridad
    JWT_SECRET: Joi.string().required(),
});