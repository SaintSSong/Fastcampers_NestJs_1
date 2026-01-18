import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';

interface Movie {
  id: number;
  title: string;
}

@Controller('movie') // <- 공통적으로 사용되는 엔드포인트는 여기다가 집어 넣는다.
export class AppController {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의 제왕',
    },
  ];

  private idCounter = 3;

  constructor(private readonly appService: AppService) {}

  // @Get('movie') // <- 같은 get이여도 데코레이터(@)에 엔드포인트를 집어 넣으면 해당 엔드포인트로 집결된다.
  @Get() // <- 이게 왜 되냐? 4번 행에서 컨트롤러 속에 "movie"를 넣었기 때문에 기본적으로 엔드포인트가 "movie"가 된다.
  getMovies(@Query('title') title?: string) {
    if (!title) {
      return this.movies;
    }

    return this.movies.filter((m) => m.title.startsWith(title)); // startsWith은 ~~로 시작한다.
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    return movie;
  }

  @Post()
  postMovie(
    @Body('title') // <- body값으로 받을 key를 () 속에 넣는 것이다.
    title: string, // <- body값의 value의 속성을 의미한다.
  ) {
    const movie: Movie = {
      id: this.idCounter++,
      title: title,
    };

    this.movies.push(movie);

    return movie;
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body('title') title: string) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    // 찾은 영화에 타이틀을 덮어씌우는 코드
    // Object.assign은 Js 문법이다.
    Object.assign(movie, { title });

    return movie;
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    const movieIndex = this.movies.findIndex((m) => m.id === +id);

    if (movieIndex === -1) {
      // <- !movieIndex는 id가 0이 나올 수 있으니까 안된다. findIndex는 positive만 나오기 때문에 -1로 넣어야한다.
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    // 배열에서 빼는 함수 사용해야한다.
    this.movies.splice(movieIndex, 1);

    return id;
  }
}
