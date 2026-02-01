import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Module({
  // <우리가 쓰고 싶은 곳의 모듈로 가서 import 한다.
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, Director, Genre]), // <- Repo를 만들기 위해서 여기다가는 사용하고 싶은 엔티티를 넣어주면 된다.
    // 여기에 엔티티를 넣으면 typeORM에서 우리가 해달라고하면 자동으로 넣은 엔티티의 Repo를 만들어서 IOC 컨테이너에 넣는다.
    // 해달라고하는것은 뭐다? service의 constructer에 "@InjectRepository(Movie) private readonly MovieRepository: Repository<Movie>" 이렇게 넣는 것을 말한다.
    // @InjectRepository(Movie) = 레포지토리를 주입한다 Movie라는
    // private readonly MovieRepository: Repository<Movie> 읽기만 가능한 레포지토리다. <Movie>라는 엔티티의 Repository타입이다.
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
