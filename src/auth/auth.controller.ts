import { Controller, Post, Headers, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // authorization: Basic $token
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  // authorization: Basic $token
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  // @UseGuards(AuthGuard('samuelCode'))
  @UseGuards(LocalAuthGuard) // 오타 대비 이렇게 export한 class로 만들어서 쓸 수 있다.
  @Post('login/passport')
  loginUserPassport(@Request() req) {
    // local.strategy.ts 속 validate의 user가 req.user이다.
    return req.user;
  }
}
