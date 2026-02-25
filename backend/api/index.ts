import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { DocsService } from '../src/docs/docs.service';
import type { INestApplication } from '@nestjs/common';

// Cache the app instance across warm invocations (serverless cold start optimisation)
let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
    if (!app) {
        app = await NestFactory.create(AppModule);

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        app.useGlobalInterceptors(new ResponseInterceptor());
        app.useGlobalFilters(new GlobalExceptionFilter());
        app.setGlobalPrefix('api');

        const config = new DocumentBuilder()
            .setTitle('JobLenz API')
            .setDescription('Job management API with AI-powered summaries')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        app.get(DocsService).setDocument(document);

        app.enableCors();
        await app.init();
    }

    return app;
}

// Vercel serverless handler — called on every request
export default async (req: Request, res: Response) => {
    const server = await bootstrap();
    server.getHttpAdapter().getInstance()(req, res);
};
