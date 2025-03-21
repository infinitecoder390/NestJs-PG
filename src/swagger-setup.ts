import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

const SWAGGER_PATH = '/api/docs';

export const setupSwagger = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD');
  const swaggerUser = configService.get<string>('SWAGGER_USERNAME');

  //   if (process.env.NODE_ENV !== 'development') {
  // app.use(
  //   [SWAGGER_PATH, `${SWAGGER_PATH}-json`],
  //   basicAuth({
  //     challenge: true,
  //     users: {
  //       [swaggerUser]: swaggerPassword,
  //     },
  //   }),
  // );
  //   }

  const docConfig = new DocumentBuilder()
    .setTitle('Boiler')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, document);
};
