import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as cookieParser from 'cookie-parser';
import { registerHelpers } from './views/helpers/hbs-helpers';
import { ValidationPipe } from '@nestjs/common';
import { UnauthorizedExceptionFilter } from './auth/unauthorized.filter';
import { NeedSignUpExceptionFilter } from './auth/filters/need-signup.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new UnauthorizedExceptionFilter(),
    new NeedSignUpExceptionFilter(),
  );

  // Serve static files from the public directory
  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');
  app.use(cookieParser());

  // Register Handlebars helpers
  registerHelpers();
  const port = process.env.PORT ?? 3000;
  console.log(`Server is running on port ${port}`);

  await app.listen(port);
}
bootstrap();
