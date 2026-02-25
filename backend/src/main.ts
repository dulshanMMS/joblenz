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

  // Serve the OpenAPI JSON spec (used by the UI below)
  const express = app.getHttpAdapter().getInstance();
  express.get('/api/docs-json', (_req: unknown, res: { json: (d: unknown) => void }) => res.json(document));

  // Serve Swagger UI using CDN assets — works in serverless environments (e.g. Vercel)
  // where local static files from node_modules are not accessible
  const specJson = JSON.stringify(document);
  express.get('/api/docs', (_req: unknown, res: { setHeader: (k: string, v: string) => void; send: (b: string) => void }) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JobLenz API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
<script>
window.onload = function () {
  SwaggerUIBundle({
    spec: ${specJson},
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
  });
};
</script>
</body>
</html>`);
  });

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
