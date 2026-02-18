import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { delay, Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext, // Guard 에서 봤던 거랑 똑같은 것이다.
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const reqTime = Date.now();

    // 엔드포인트 전
    // --------------------------------------------------------------------
    // 엔드포인트 후

    return next.handle().pipe(
      // delay(1000),
      tap(() => {
        const respTime = Date.now();
        const diff = respTime - reqTime;

        if (diff > 1000) {
          console.log(`!!!TimeOut!!! [${req.method} ${req.path}] ${diff}ms`);

          throw new InternalServerErrorException(
            '시간이 너무 오래 걸렸습니다.',
          );
        } else {
          console.log(`[${req.method} ${req.path}] ${diff}ms`);
        }
      }),
    );
  }
}
