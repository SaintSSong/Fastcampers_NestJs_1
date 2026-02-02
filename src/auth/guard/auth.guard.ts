import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 요청에서 user 객체가 존재하는지 확인
    const request = context.switchToHttp().getRequest();

    // console.log('request.user', request.user);
    // console.log(' request.user.type', request.user.type);

    if (!request.user || request.user.type !== 'access') {
      return false;
    }

    return true;
  }
}
