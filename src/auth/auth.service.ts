import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
import { catchError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService, // 이거 쓸 수 있는 이유? module에서 주입 받았기 때문에
  ) {}

  parseBasicToken(rawToken: string) {
    // 1) 토큰을 " " 기준으로 스플릿 한 후 토큰 값만 추출하기
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    // 2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다.
    // 이거는 공식이니까 그냥 외워
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // "email:password"
    const tokenSplit = decoded.split(':');

    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [email, password] = tokenSplit;

    return { email, password };
  }

  // BearerToken
  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    // 1) 토큰을 " " 기준으로 스플릿 한 후 토큰 값만 추출하기
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });

      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('RefreshToken을 입력해주세요.');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('AccessToken을 입력해주세요.');
        }
      }

      return payload;
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }

  // rawToken -> Basic $token
  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    // 이제 비밀번호 해쉬처리
    const hash = await bcrypt.hash(
      password,
      this.configService.getOrThrow<number>('HASH_ROUNDS'),
    );

    await this.userRepository.save({
      email,
      password: hash,
    });

    return this.userRepository.findOne({
      where: { email },
    });
  }

  // passport 했을 때 진행코드
  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    // password = 암호화 X
    // user.password = 암호화 된 상태
    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    return user;
  }

  async issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const refreshTokenSecret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );

    return this.jwtService.signAsync(
      {
        sub: user.id,
        // email: user.email,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }

  //로그인
  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    // const user = await this.userRepository.findOne({
    //   where: { email },
    // });

    // if (!user) {
    //   throw new BadRequestException('잘못된 로그인 정보입니다.');
    // }

    // // password = 암호화 X
    // // user.password = 암호화 된 상태
    // const passOk = await bcrypt.compare(password, user.password);

    // if (!passOk) {
    //   throw new BadRequestException('잘못된 로그인 정보입니다.');
    // }

    // passport 했을 때 진행코드
    const user = await this.authenticate(email, password);

    // const accessTokenSecret = this.configService.getOrThrow<string>(
    //   'ACCESS_TOKEN_SECRET',
    // );

    // const refreshTokenSecret = this.configService.getOrThrow<string>(
    //   'REFRESH_TOKEN_SECRET',
    // );

    return {
      refreshToken: await this.issueToken(user, true),
      // await this.jwtService.signAsync(
      //   {
      //     sub: user.id,
      //     role: user.role,
      //     type: 'refresh',
      //   },
      //   {
      //     secret: refreshTokenSecret,
      //     expiresIn: '24h',
      //   },
      // )
      accessToken: await this.issueToken(user, false),
      // await this.jwtService.signAsync(
      //   {
      //     sub: user.id,
      //     role: user.role,
      //     type: 'access',
      //   },
      //   {
      //     secret: accessTokenSecret,
      //     expiresIn: 300, //5분
      //   },
      // ),
    };
  }
}
