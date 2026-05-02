// api/serverless.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
const cookieParser = require('cookie-parser');

let cachedServer: any;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    // Configuración idéntica a tu proyecto exitoso
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: true,
      credentials: true,
    });
    app.use(cookieParser());

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }

  return cachedServer(req, res);
}