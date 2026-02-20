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
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Request,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptior';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MovieFilePipe } from './pipe/movie-file.pipe';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor) // 클래스 트렌스포머 쓴거를 적용 시키려면 꼭 필요하다.
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  // @Get('movie') // <- 같은 get이여도 데코레이터(@)에 엔드포인트를 집어 넣으면 해당 엔드포인트로 집결된다.

  @Get() // <- 이게 왜 되냐? @Controller('movie') 속에 "movie"를 넣었기 때문에 기본적으로 엔드포인트가 "movie"가 된다.
  @Public()
  // @UseInterceptors(CacheInterceptor)
  getMovies(@Query() dto: GetMoviesDto) {
    return this.movieService.findAll(dto);
  }

  @Get(':id')
  @Public()
  getMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(error) {
          throw new BadRequestException('숫자를 입력해주세요.');
        },
      }),
    )
    id: number,
  ) {
    console.log('id', typeof id);
    return this.movieService.findOne(id);
  }

  // 영화 생성 //
  @Post()
  @RBAC(Role.paidUser)
  @UseGuards(AuthGuard) // <- 이게 있기에 자격이 증명된 사용자만 사용 가능하다.
  @UseInterceptors(TransactionInterceptor)
  // @UseInterceptors(FilesInterceptor('movies')) // FileInterceptor는 한 개 FilesInterceptor는 여러 개
  @UseInterceptors(
    FileInterceptor('movie', {
      limits: {
        fileSize: 20000000, // 20mb
      },
      fileFilter(req, file, callback) {
        console.log('fileFilter', file);

        if (file.mimetype !== 'video/mp4') {
          return callback(
            new BadRequestException('MP4 타입만 업로드 가능합니다.'),
            false,
          );
        }

        return callback(null, true); // true 대신 false 하면 파일 저장이 안된다.  // null은 에러 넣는 위치로 해당 위치에 에러를 넣으면 에러 발생!
      },
    }),
  ) // FileInterceptor는 한 개 FilesInterceptor는 여러 개
  postMovie(
    @Body() body: CreateMovieDto,
    @Request() req,
    // @UploadedFiles() files: Express.Multer.File[], // 복수에서 s를 붙이냐 안붙이냐로 실수가 엄청 많이 난다. 조심!
    @UploadedFile(
      new MovieFilePipe({
        maxSize: 20,
        mimetype: 'video/mp4',
      }),
    )
    movie: Express.Multer.File,
  ) {
    console.log('--------------------------------');
    console.log('movie', movie);

    return this.movieService.create(body, req.queryRunner);
  }

  // 영화 수정
  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(error) {
          throw new BadRequestException('숫자를 입력해주세요.');
        },
      }),
    )
    id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(error) {
          throw new BadRequestException('숫자를 입력해주세요.');
        },
      }),
    )
    id: string,
  ) {
    return this.movieService.remove(+id);
  }
}
