import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ) {}

  // 영화 전체 조회
  async getManyMovies(title?: string) {
    // 나중에 title 필터 기능 추가하기

    if (!title) {
      return [
        await this.movieRepository.find(),
        await this.movieRepository.count(), //<- count 왜 하냐? 200만개 이렇게 있으면 총 몇개 있는지 바로 알 수 있고 나중에 페이지네이션 걸면 되니까 그렇다.
      ];
    }

    return await this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`), // 이렇게 넣어주면 꼭 그것만 아니여도 가져 올 수 있다.
      },
    });
  }

  // 영화 상세 조회
  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    return movie;
  }

  // 영화 생성
  async createMovie(createMovieDto: CreateMovieDto) {
    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        detail: createMovieDto.detail,
      },
    });

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
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    const { detail, ...movieRest } = updateMovieDto;

    await this.movieRepository.update(
      {
        id,
      },
      movieRest, // 이미 객체 형태니까 {}를 안 감싼다.
    );

    if (detail) {
      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        { detail }, // 객체가 없기 때문에 객체로 감싼다.
      );
    }

    const newMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    return newMovie;
  }

  // 영화 삭제
  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }
}
