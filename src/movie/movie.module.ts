import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { join } from 'path';
import { v4 } from 'uuid';

@Module({
  // <우리가 쓰고 싶은 곳의 모듈로 가서 import 한다.
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, Director, Genre]), // <- Repo를 만들기 위해서 여기다가는 사용하고 싶은 엔티티를 넣어주면 된다.
    // 여기에 엔티티를 넣으면 typeORM에서 우리가 해달라고하면 자동으로 넣은 엔티티의 Repo를 만들어서 IOC 컨테이너에 넣는다.
    // 해달라고하는것은 뭐다? service의 constructer에 "@InjectRepository(Movie) private readonly MovieRepository: Repository<Movie>" 이렇게 넣는 것을 말한다.
    // @InjectRepository(Movie) = 레포지토리를 주입한다 Movie라는
    // private readonly MovieRepository: Repository<Movie> 읽기만 가능한 레포지토리다. <Movie>라는 엔티티의 Repository타입이다.
    CommonModule,
    MulterModule.register(
      // register : 저장한다.
      {
        storage: diskStorage({
          // storage : 저장소  / diskStorage: 로컬에다가 저장한다.
          // join은 경로를 탐색 할 때 쓴다.  process.cwd()는 서버가 시작되는 최상단 폴더(root)를 말한다.
          // 거기서에서 부터 이제 ,을 통해서 무한히 들어 갈 수 있다.
          // 현재 우리가 서버를 실행하고 있는 운영체제에 적합한 형태로 패스를 알아서 매칭해준다. = Join()
          destination: join(process.cwd(), 'public', 'movie'), // destination : 목적지  즉 파일을 저장할 폴더를 지정하는 것이다.
          // filename: (req, file, callback) => {
          //   const split = file.originalname.split('.');

          //   let extension = 'mp4';

          //   if (split.length > 1) {
          //     extension = split[split.length - 1];
          //   }

          //   callback(null, `${v4()}_${Date.now()}.${extension}`);
          // },
        }),
      },
    ),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
