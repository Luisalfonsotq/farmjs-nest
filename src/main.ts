import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend local corriendo en puerto ${port}`);
}

bootstrap();