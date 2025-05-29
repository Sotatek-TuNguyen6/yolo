import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { setupSwagger } from './config/swagger';
import { QueryParserMiddleware } from './middleware/parser.middleware';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure request body size limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS
  app.enableCors();

  // Áp dụng global interceptor và filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use((req, res, next) => new QueryParserMiddleware().use(req, res, next));
  const port = configService.get<number>('PORT');
  const apiPrefix = configService.get<string>('API_PREFIX');
  const apiVersion = configService.get<string>('API_VERSION');

  if (apiPrefix && apiVersion) {
    app.setGlobalPrefix(`${apiPrefix}/v${apiVersion}`);
  }

  setupSwagger(app);

  await app.listen(port || 4000);
  // console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap()
  .then(() => {
    console.log(`Application is running on`);
  })
  .catch((error) => {
    console.log(error);
  });
