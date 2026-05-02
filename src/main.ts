import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: true, // Permitir en desarrollo y prod, o especifica tu dominio
      credentials: true,
    });

    app.use(cookieParser());

    console.log('⏳ Llamando a app.init()...');
    await app.init();
    console.log('✅ app.init() finalizado con éxito.');
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

// En Vercel, NODE_ENV se define como 'production' en vercel.json.
// Por lo tanto, esto solo se ejecutará en tu máquina local.
if (process.env.NODE_ENV !== 'production') {
  async function startLocal() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });
    app.use(cookieParser());
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend local corriendo en puerto ${port}`);
  }
  startLocal();
}

// Exportamos el handler para Vercel (Serverless Function)
export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  server(req, res);
}