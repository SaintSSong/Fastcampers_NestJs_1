import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없어도 작성하면 보여는 지게 하는 것 = true // 보여도 지게 하지 않는 것 = false   기본 false
      forbidNonWhitelisted: true, // whitelist가 true일 때 DTO에 없는 것이 입력되면 바로 에러 뱉게 하는거     // 기본 false
      transformOptions: { enableImplicitConversion: true }, // 우리가 class에 넣은 타입을 기반으로 입력갑이 알아서 변경해라(쿼리 같은거는 숫자인데 문자로 들어오잖아. 그걸 알아서 숫자로 변경해라.)
    }),
  ); // class validation을 쓰기 위해서 필수로 작성해야 하는 코드
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
