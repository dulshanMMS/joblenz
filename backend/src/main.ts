import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply DTO validation globally on every request
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strips any fields not defined in the DTO
      forbidNonWhitelisted: true, // throws error if unknown fields are sent
      transform: true,       // auto-transforms payloads to DTO class instances
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
