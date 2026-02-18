import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    // 이 qr은 dataSource로 부터 가져와야한다.
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    // 미들웨어 처럼 req에다가 qr을 담아서 보낸다.
    req.queryRunner = qr;

    return next.handle().pipe(
      // 만약 에러가 터지면? 롤백을 해야지? 그걸 여기서 한다.
      catchError(async (e) => {
        await qr.rollbackTransaction();
        await qr.release();
        throw e;
      }),
      // 트랜잭션이 잘 실행되었다? 그러면 커밋하고 트랜잭션을 풀어줘야지
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
