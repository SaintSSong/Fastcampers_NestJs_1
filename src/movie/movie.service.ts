import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // 영화 전체 조회
  getManyMovies(title?: string) {
    // 나중에 title 필터 기능 추가하기

    return this.movieRepository.find();

    // if (!title) {
    //   return this.movies;
    // }

    // return this.movies.filter((m) => m.title.startsWith(title)); // startsWith은 ~~로 시작한다.
  }

  // 영화 상세 조회
  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    return movie;
  }

  // 영화 생성
  async createMovie(
    /**title: string, genre: string*/ createMovieDto: CreateMovieDto,
  ) {
    const movie = await this.movieRepository.save(
      // title: createMovieDto.title,
      // genre: createMovieDto.genre,

      createMovieDto,
    );

    return movie;
  }

  // 영화 수정
  async updateMovie(
    id: number /**title?: string, genre?: string*/,
    updateMovieDto: UpdateMovieDto,
  ) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    await this.movieRepository.update(
      {
        id,
      },
      updateMovieDto,
    );

    const newMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    return newMovie;
  }

  // 영화 삭제
  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    this.movieRepository.delete(id);

    return id;
  }
}
