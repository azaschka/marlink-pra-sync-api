import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import helmet from 'helmet';
import { description, name, version } from '../package.json';
import { AppModule } from './app.module';
import { LogService } from './log/services/log.service';
import { AllExceptionsFilter } from './shared/filters';
// import { TimeoutInterceptor } from './shared/interceptors';

/**
 * Setup global error handlers to prevent uncaught exceptions from crashing the pod
 * This is critical for Kubernetes deployments where pod restarts should be avoided
 */
function setupGlobalErrorHandlers() {
    process.on('uncaughtException', (error: Error) => {
        console.error('🚨 UNCAUGHT EXCEPTION - Process will continue:', error);
        console.error('Stack trace:', error.stack);
        // Log to external monitoring if available
        // Don't exit - let health checks handle unhealthy state
    });

    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
        console.error('🚨 UNHANDLED REJECTION - Promise:', promise);
        console.error('Reason:', reason);
        if (reason instanceof Error) {
            console.error('Stack trace:', reason.stack);
        }
        // Log to external monitoring if available
        // Don't exit - let health checks handle unhealthy state
    });

    process.on('SIGTERM', () => {
        console.log('📡 SIGTERM signal received: closing HTTP server gracefully');
        // Graceful shutdown will be handled by NestJS shutdown hooks
    });

    process.on('SIGINT', () => {
        console.log('📡 SIGINT signal received: closing HTTP server gracefully');
        // Graceful shutdown will be handled by NestJS shutdown hooks
    });

    // Log memory usage periodically to detect leaks
    // setInterval(() => {
    //     const used = process.memoryUsage();
    //     console.log('💾 Memory usage:', {
    //         rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    //         heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    //         heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    //         external: `${Math.round(used.external / 1024 / 1024)} MB`,
    //     });
    // }, 300000); // Every 5 minutes
}

function configureOpenApi(app: INestApplication<unknown>) {
    const options = new DocumentBuilder()
        .setTitle(name)
        .setDescription(description)
        .setVersion(version)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('open-api', app, document);
}

async function bootstrap() {
    // Setup global error handlers BEFORE creating the app
    setupGlobalErrorHandlers();

    try {
        const app = await NestFactory.create(AppModule, {
            logger: ['error', 'warn', 'log'],
            abortOnError: false, // Don't exit on startup errors, let health checks catch issues
        });

        // Enable HTTP security headers
        app.use(helmet());
        // Parse JSON requests with a limit of 5MB
        app.use(json({ limit: '5mb' }));
        // Setup logging and error handling interceptors
        // app.useGlobalInterceptors(new TimeoutInterceptor(180_000));
        // app.useGlobalInterceptors(new LoggingInterceptor(app.get(LogService)), new TimeoutInterceptor(180_000));
        // Setup global exception filter
        app.useGlobalFilters(new AllExceptionsFilter(app.get(LogService)));
        // Enable CORS
        app.enableCors({
            origin: true,
            allowedHeaders: 'Content-Type, X-Api-Key, Authorization',
            exposedHeaders: [],
            credentials: false,
            methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            maxAge: 3600,
            optionsSuccessStatus: 204,
        });
        // Enable global prefix for API routes
        // TODO: Enable global prefix and versioning with API version 1.0.0+
        // app.setGlobalPrefix('api/v1');

        configureOpenApi(app);

        await app.startAllMicroservices();
        // Enable shutdown hooks for graceful shutdown on k8s or process termination
        // This is important for cleaning up resources and connections properly
        app.enableShutdownHooks();

        const listeningPort = process.env.PORT || 3000;
        await app.listen(listeningPort);
        console.log(`✅ Application successfully started on PORT: ${listeningPort}`);
        // console.log(`📊 Health check available at: http://localhost:${listeningPort}/health`);
        // console.log(`📚 OpenAPI documentation at: http://localhost:${listeningPort}/open-api`);
    } catch (error) {
        console.error('🚨 FATAL: Error during application bootstrap:', error);
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack);
        }
        // Give time for logs to flush before exiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
        process.exit(1);
    }
}

void bootstrap();
