import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin:
      configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription(
      'A REST API for managing todos, built with NestJS, TypeORM, and PostgreSQL.',
    )
    .setVersion('1.0')
    .addTag('todos')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`Application is running on port ${port}`);
}
void bootstrap();
