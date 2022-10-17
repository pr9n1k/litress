/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:4200'],
  });
  app.use(cookieParser());
  const port = process.env.PORT_SERVER || 3333;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
