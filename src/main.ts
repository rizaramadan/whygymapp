import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as cookieParser from 'cookie-parser';
import { registerHelpers } from './views/helpers/hbs-helpers';
import { ValidationPipe } from '@nestjs/common';
import { UnauthorizedExceptionFilter } from './auth/unauthorized.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  // Serve static files from the public directory
  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');
  app.use(cookieParser());

  // Register Handlebars helpers
  registerHelpers();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
