import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
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

  constructor(private readonly appService: AppService) {}

  // @Get('movie') // <- 같은 get이여도 데코레이터(@)에 엔드포인트를 집어 넣으면 해당 엔드포인트로 집결된다.
  @Get() // <- 이게 왜 되냐? 4번 행에서 컨트롤러 속에 "movie"를 넣었기 때문에 기본적으로 엔드포인트가 "movie"가 된다.
  getMovies() {
    return this.movies;
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
  postMovie() {
    return {
      id: 3,
      name: '어벤져스',
      character: ['아이언맨, 캡틴 아메리카'],
    };
  }

  @Patch(':id')
  patchMovie() {
    return {
      id: 3,
      name: '어벤져스',
      character: ['아이언맨, 블랙 위도우'],
    };
  }

  @Delete(':id')
  deleteMovie() {
    return 3;
  }
}
