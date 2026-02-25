import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

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

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('JobLenz API')
    .setDescription('Job management API with AI-powered summaries')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    // Use CDN assets so Swagger UI works in serverless environments (e.g. Vercel)
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
    ],
  });

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
