import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'temp', // ✅ 타입만 맞추는 용도 (실제로는 signAsync에서 secret을 덮어씀)
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, // passport Strategy 쓸 때 넣어야한다.
  ],
  exports: [AuthService], // passport Strategy 쓸 때 넣어야한다.  AuthService안에 로그인에 필요한 데이터를 다른 곳에서 쓸 수 있도록
})
export class AuthModule {}
