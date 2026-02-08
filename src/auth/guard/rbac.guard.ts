import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // 해당 유저의 Role이 있는지 확인
  canActivate(context: ExecutionContext): boolean {
    // 여기서 RBACGuard가 적용된 엔드포인트 기준으로 @RBAC에 적용된 모든 값을 가지고 올 수 있다.
    const role = this.reflector.get<Role>(RBAC, context.getHandler());

    // 이 코드는 말 그대로 라우터 엔드포인트에   @RBAC()가 붙어있나 아닌가 확인하는 코드
    // return ture라는 것은 @RBAC()가 엔드 포인트에 안붙어있으니 이 엔드포인트는 검사 안 하고 통과! 이런 뜻이다.
    // 어떻게 그런 뜻이 되는거냐? role이 @RBAC의 값을 뜻하는데 @RBAC를 안붙이면 이거는 undefined가 된다.
    // 그러면 false가 되고 조건문에서 true만 return 값으로 빠지니까 false를 true로 만들기 위해서 "!"를 붙이는 것이다.

    // “role 값이 Role enum 안에 있는 값이야?” 를 확인하는 코드야.
    // Role Enum에 해당되는 값이 @에 들어갔는지 확인하기!

    // Object.values(Role) =  Role에 있는 모든 값을 다 가져온다.
    // .includes(role) = 그 중에 role이 있는지 확인한다.
    if (!Object.values(Role).includes(role)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // 선행으로 Auth에서 Public이 아닌 애들을 전역적으로 검사하니까 = 토큰이 있는지 확인하고
    // 무조건 RBACGuard가 적용된 애들은 user를 가지고 있다.
    // 만약 가지고 있지 않은데 들어왔다면 이건 오류이기 때문에 false를 해야한다.
    if (!user) {
      return false;
    }

    // JWT에 Role을 넣어놨으니까 여기서 꺼낼 수 있다.
    // 여기서 <= role은 enum 값은 기본 0,1,2인데 더 높은 권한 일 수록 설계 당시 앞에 적어놨기 때문에
    // master = 0, admin =1, user = 2 이렇게여서 내가 제한을 두고 싶은 권한만 되게끔 하려고 <=를 한 것이다.
    return user.role <= role;
  }
}
