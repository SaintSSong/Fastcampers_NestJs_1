import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // 응답 가져오기
    const response = ctx.getResponse();

    // 요청 가져오기
    const request = ctx.getRequest();

    const status = exception.getStatus();

    console.log(`[권한 오류] ${request.method} ${request.path}`);

    response.status(status).json({
      statusCode: status,
      // 언제 오류가 발생했는지 언제 응답기 갔는지 구체적으로 작성해달라!
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '권한이 없습니다!!!',
    });
  }
}
