import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없어도 작성하면 보여는 지게 하는 것 = true // 보여도 지게 하지 않는 것 = false   기본 false
      forbidNonWhitelisted: true, // whitelist가 true일 때 DTO에 없는 것이 입력되면 바로 에러 뱉게 하는거     // 기본 false
    }),
  ); // class validation을 쓰기 위해서 필수로 작성해야 하는 코드
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
