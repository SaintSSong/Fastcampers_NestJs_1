import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

// 데코레이터 만들 때 "createParamDecorator" 이거 하나면 끝!

// ExecutionContext 효과 다시 한번 알아보기
export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    // console.log('request', request);
    console.log('request.user', request.user);
    console.log('request.user.sub', request.user.sub);

    if (!request || !request.user || !request.user.sub) {
      throw new UnauthorizedException(`사용자 정보를 찾을 수 없습니다.!!!!`);
    }

    return request.user.sub;
  },
);
