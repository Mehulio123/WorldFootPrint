import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS - IMPORTANT for production
  /*
  app.enableCors({
  origin: [
    'https://world-foot-print.vercel.app',
    'https://worldfootprint.vercel.app',
    'https://worldfootprint-production.up.railway.app', // rarely needed but safe
  ],
  credentials: true,
});*/
app.enableCors({ origin: true, credentials: true });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();