import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import * as express from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));

  // Cấu hình rate limit
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    }),
  );

  // Cấu hình middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());

  // Cấu hình global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Cấu hình prefix API
  app.setGlobalPrefix('api/v1');
  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('NFC API')
    .setDescription('API documentation for NFC backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 8888);
}
bootstrap();
