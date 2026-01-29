import { Module } from '@nestjs/common';

import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Movie } from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-detail.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <- 어떤 모듈에서든 ConfigModule에 등록된 환경 변수를 사용 할 수 있도록 해주는 기능
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),

        DB_TYPE: Joi.string().valid('postgres').required(), // .valid('postgres') 이걸 넣으면 postgresql만 가능하다.
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Movie, MovieDetail], // <=여기 다가는 등록할 엔티티를 넣으면 된다. DB 테이블로 형성한 엔티티를 넣으면 된다.
        synchronize: true, // <- 개발할 때만 true 배포하고 나서는 false로 놔야 한다.
      }),
      inject: [ConfigService],
    }),
    MovieModule,
  ],
})
export class AppModule {}

// 사실 nest에서는 process.env 이걸 잘 안쓴다.
// nest에서는 IOC 컨테이너에 넣어서 사용하는 방법을 사용한다.

// TypeOrmModule.forRoot({
//   type: process.env.DB_TYPE as 'postgres',
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT ?? '5432', 10),
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   entities: [], // <=여기다가는 등록할 엔티티를 넣으면 된다. DB 테이블로 형성한 엔티티를 넣으면 된다.
//   synchronize: true, // <- 개발할 때만 true 배포하고 나서는 false로 놔야 한다.
// }), // 우리가 연결하고싶은 DB의 정보를 넣으면 된다.
// MovieModule,
