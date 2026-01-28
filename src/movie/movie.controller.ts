import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor) // 클래스 트렌스포머 쓴거를 적용 시키려면 꼭 필요하다.
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  // @Get('movie') // <- 같은 get이여도 데코레이터(@)에 엔드포인트를 집어 넣으면 해당 엔드포인트로 집결된다.
  @Get() // <- 이게 왜 되냐? 4번 행에서 컨트롤러 속에 "movie"를 넣었기 때문에 기본적으로 엔드포인트가 "movie"가 된다.
  getMovies(@Query('title') title?: string) {
    return this.movieService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.movieService.getMovieById(+id);
  }

  @Post()
  postMovie(
    // @Body('title') // <- body값으로 받을 key를 () 속에 넣는 것이다.
    // title: string, // <- body값의 value의 속성을 의미한다.
    // @Body('genre') genre: string,

    @Body() body: CreateMovieDto,
  ) {
    return this.movieService.createMovie(body);
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body() body: UpdateMovieDto) {
    return this.movieService.updateMovie(+id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    return this.movieService.deleteMovie(+id);
  }
}
