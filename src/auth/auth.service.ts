import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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

    const [_, token] = basicSplit;

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

    console.log('user', user);

    const accessTokenSecret = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_SECRET',
    );

    const refreshTokenSecret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );

    return {
      refreshToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          role: user.role,
          type: 'refresh',
        },
        {
          secret: refreshTokenSecret,
          expiresIn: '24h',
        },
      ),

      accessToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          role: user.role,
          type: 'access',
        },
        {
          secret: accessTokenSecret,
          expiresIn: 300, //5분
        },
      ),
    };
  }
}
