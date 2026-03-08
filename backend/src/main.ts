import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env before NestJS instantiates any module.
// Without this, process.env.JWT_SECRET would be undefined when
// auth.module.ts calls JwtModule.register({ secret: ... }).
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);// so this creates the app
  await app.listen(process.env.PORT ?? 3000);// this starts the server on port 3000. the backend server
}
bootstrap();// this is the main entry point of the application. it creates the NestJS application and starts the server on the specified port.

