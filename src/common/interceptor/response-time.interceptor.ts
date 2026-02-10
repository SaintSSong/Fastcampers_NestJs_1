import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

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
      tap(() => {
        const respTime = Date.now();
        const diff = respTime - reqTime;

        console.log(`[${req.method} ${req.path}] ${diff}ms`);
      }),
    );
  }
}
