import dotenv from 'dotenv';
import { z } from 'zod';

// Carrega o arquivo .env apropriado conforme o ambiente
const CURRENT_ENV = process.env.NODE_ENV || 'development';
const ENV_FILE = CURRENT_ENV === 'development' ? '.env' : '.env.production';

dotenv.config({ path: ENV_FILE });

const envSchema = z.object({
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('sports_highlights'),

  PORT: z.coerce.number().int().positive().default(3000),

  RABBITMQ_URL: z.string().optional(),
  DEV_EMAIL: z.string().default('hendriusfelix.dev@gmail.com'),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASS: z.string().default(''),

  JWT_SECRET: z.string()
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  const missing = envResult.error.issues.map((issue: any) => issue.path.join('.'));
  const list = Array.from(new Set(missing)).join(', ');
  throw new Error(
    [
      'Variáveis de ambiente inválidas/ausentes:',
      list,
      `(arquivo carregado: ${ENV_FILE}, NODE_ENV=${CURRENT_ENV})`,
    ].join(' ')
  );
}

const env = envResult.data;

export const config = {
  database: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
  },
  env: CURRENT_ENV,
  port: env.PORT,
  rabbitmqUrl: env.RABBITMQ_URL || '',

  jwtSecret: env.JWT_SECRET,

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASS
  }
}

