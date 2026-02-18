import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { response } from 'express';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // 요청을 가져와라
    const request = context.switchToHttp().getRequest();

    // GET /movie  <= 이게 캐쉬의 key 값으로 정하게 됨
    const key = `${request.method}-${request.path}`;

    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return next.handle().pipe(tap((response) => this.cache.set(key, response)));
  }
}

// 근데 이 캐시는 실제로는 안쓸거다. 주로 레디스를 쓰기 때문에 이런 기능도 있다 정도로 알고 있어라
