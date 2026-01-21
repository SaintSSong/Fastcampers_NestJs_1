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

@Controller('movie') // <- 공통적으로 사용되는 엔드포인트는 여기다가 집어 넣는다.
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('movie') // <- 같은 get이여도 데코레이터(@)에 엔드포인트를 집어 넣으면 해당 엔드포인트로 집결된다.
  @Get() // <- 이게 왜 되냐? 4번 행에서 컨트롤러 속에 "movie"를 넣었기 때문에 기본적으로 엔드포인트가 "movie"가 된다.
  getMovies(@Query('title') title?: string) {
    console.log('여기');
    return this.appService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.appService.getMovieById(+id);
  }

  @Post()
  postMovie(
    @Body('title') // <- body값으로 받을 key를 () 속에 넣는 것이다.
    title: string, // <- body값의 value의 속성을 의미한다.
  ) {
    return this.appService.createMovie(title);
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body('title') title: string) {
    return this.appService.updateMovie(+id, title);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    return this.appService.deleteMovie(+id);
  }
}
