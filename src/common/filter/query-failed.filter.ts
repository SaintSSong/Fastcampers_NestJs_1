import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError) // QueryFailedError는 TypeORM에서 불러오는거다. 이 에러가 발생한거를 일괄적으로 처리 할 수 있다.
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // 응답 가져오기
    const response = ctx.getResponse();

    // 요청 가져오기
    const request = ctx.getRequest();

    const status = 400; // 이거는 exception.getStatus();를 못 쓴다. TypeORM에서 가져오는 것이기 때문에 그래서 인의적으로 400이라고 넣는것

    let message = '데이터베이스 에러 발생';

    if (exception.message.includes('중복된 키')) {
      message = '중복 키 에러 발생';
    }

    response.status(status).json({
      statusCode: status,
      // 언제 오류가 발생했는지 언제 응답기 갔는지 구체적으로 작성해달라!
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
