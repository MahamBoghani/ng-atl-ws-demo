import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {WsAdapter} from '@nestjs/websockets';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app.getHttpServer()));
  await app.listen(3000);
}
bootstrap();
