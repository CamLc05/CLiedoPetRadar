import 'dotenv/config';
import * as env from 'env-var';

console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_USER:', process.env.DB_USER);

export const envs = {
  PORT: env.get('PORT').required().asPortNumber(),

  DB_HOST: env.get('DB_HOST').required().asString(),
  DB_NAME: env.get('DB_NAME').required().asString(),
  DB_PORT: env.get('DB_PORT').required().asPortNumber(),
  DB_USER: env.get('DB_USER').required().asString(),
  DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),

  MAILER_EMAIL: env.get('MAILER_EMAIL').required().asString(),
  MAILER_PASSWORD: env.get('MAILER_PASSWORD').required().asString(),
  MAILER_SERVICE: env.get('MAILER_SERVICE').required().asString(),

  MAPBOX_TOKEN: env.get('MAPBOX_TOKEN').required().asString(),
};