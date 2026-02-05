import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from 'src/common/entity/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Bearer $token
    const authHeader = req.headers['authorization'];

    // 헤더가 아에 없으면 인증 할 필요 없는 녀석들인 경우
    if (!authHeader) {
      next();
      return;
    }

    try {
      // token을 실제로 넣었을 때
      const token = this.validateBearerToken(authHeader);

      // 검증은 안한다. 만료가 되었는지 secret이 맞는지는 확인 안하고 그냥 풀어본다.
      const decodedPayload = this.jwtService.decode(token);

      if (
        decodedPayload.type !== 'refresh' &&
        decodedPayload.type !== 'access'
      ) {
        throw new UnauthorizedException('잘못된 토큰입니다.');
      }

      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      // 페이로드 검증 시작
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>(secretKey),
      });

      // 일련의 과정이 마치면 user에다가 payload라는 것을 집어 넣는다.
      req.user = payload;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }

      next(); // 에러가 터져도 req.user가 undefinde 상태로 넘겨버린다.
    }
  }

  // 토큰을 검증하는 과정
  validateBearerToken(rawToken: string) {
    // 1) 토큰을 " " 기준으로 스플릿 한 후 토큰 값만 추출하기
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    return token;
  }
}
