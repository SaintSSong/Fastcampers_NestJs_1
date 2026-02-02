import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

export class LocalAuthGuard extends AuthGuard('samuelCode') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'samuelCode') {
  constructor(private readonly authService: AuthService) {
    //  모든 Strategy는 super 컨스트럭터 불러줘야한다.
    super({
      usernameField: 'email',
    });
  }

  // 실제로 존재하는 사용자인지 검증을 해줘야한다.
  /**
   * lacalStrategy는 아에 정해져있다.
   *
   * validate : username, password
   *
   * return -> Request()
   */
  async validate(email: string, password: string) {
    const user = await this.authService.authenticate(email, password);

    return user;
  }
}
