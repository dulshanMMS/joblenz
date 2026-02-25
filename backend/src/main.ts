import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocsService } from './docs/docs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply DTO validation globally on every request
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // strips any fields not defined in the DTO
      forbidNonWhitelisted: true, // throws error if unknown fields are sent
      transform: true,            // auto-transforms payloads to DTO class instances
    }),
  );

  // Consistent response shape for all successful responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Consistent error shape for all thrown exceptions
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api');

  // Build OpenAPI spec and store it in DocsService so DocsController can serve it
  // The UI is served at /api/docs using CDN assets (works on Vercel serverless)
  const config = new DocumentBuilder()
    .setTitle('JobLenz API')
    .setDescription('Job management API with AI-powered summaries')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.get(DocsService).setDocument(document);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
