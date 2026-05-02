import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';

let cachedServer: any;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedServer) {
      console.log('⏳ Inicializando NestJS en Vercel...');
      const app = await NestFactory.create(AppModule);
      app.enableCors({
        origin: true,
        credentials: true,
      });
      app.use(cookieParser());
      
      await app.init();
      console.log('✅ NestJS inicializado correctamente.');
      cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer(req, res);
  } catch (error: any) {
    console.error('❌ Error fatal en serverless handler:', error);
    res.status(500).json({
      message: 'Internal Server Error during startup',
      error: error.message,
      stack: error.stack,
    });
  }
}
