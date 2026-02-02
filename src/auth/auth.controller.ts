import {
  Controller,
  Post,
  Headers,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // authorization: Basic $token
  registerUser(@Headers('authorization') token: string) {
    console.log('2. token', token);
    return this.authService.register(token);
  }

  @Post('login')
  // authorization: Basic $token
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  // accessToken 재발급
  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  // @UseGuards(AuthGuard('samuelCode'))
  @UseGuards(LocalAuthGuard) // 오타 대비 이렇게 export한 class로 만들어서 쓸 수 있다.
  @Post('login/passport')
  async loginUserPassport(@Request() req) {
    // local.strategy.ts 속 validate의 user가 req.user이다.
    // return req.user;

    // Jwt.strategy
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    // console.log('req', req.user);
    return req.user;
  }
}
