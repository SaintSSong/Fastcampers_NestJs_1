import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitie/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  // 영화 전체 조회
  async findAll(title?: string) {
    if (!title) {
      return [
        await this.movieRepository.find({
          relations: ['director', 'genres'],
        }),
        await this.movieRepository.count(), //<- count 왜 하냐? 200만개 이렇게 있으면 총 몇개 있는지 바로 알 수 있고 나중에 페이지네이션 걸면 되니까 그렇다.
      ];
    }

    return await this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`), // 이렇게 넣어주면 꼭 그것만 아니여도 가져 올 수 있다.
      },
      relations: ['director', 'genres'],
    });
  }

  // 영화 상세 조회
  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    return movie;
  }

  // 영화 생성
  async create(createMovieDto: CreateMovieDto) {
    // 감독 조회
    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    // 장르 조회
    const genres = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds), // In은 []의 리스트 중 들어있는지 없는지 확인하는 문법이다.
      },
    });

    // 찾아낸 장르의 갯수와 DTO를 통해서 넣은 장르의 갯수가 맞지 않다? 잘못된거다.
    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않는 장르가 있습니다. 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
      );
    }

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      detail: {
        detail: createMovieDto.detail,
      },
      genres,
      director,
    });

    return movie; //
  }

  // 영화 수정
  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    // null 값으로 일단은 생성해둔다.
    let newDirector;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {
          id: directorId,
        },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 영화 감독입니다.');
      }

      newDirector = directorId;
    }

    let newGenres;

    if (genreIds) {
      const genres = await this.genreRepository.find({
        where: {
          id: In(genreIds),
        },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 있습니다. 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
        );
      }

      newGenres = genres;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }), // 해석 newDirector가 존재하면 { } 내용이 스프레드(...)되어서 들어간다.
    };

    // 업데이트 진행
    await this.movieRepository.update(
      {
        id,
      },
      movieUpdateFields,
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
      relations: ['detail', 'director'],
    });

    if (newMovie) {
      newMovie.genres = newGenres;

      await this.movieRepository.save(newMovie);
    }

    return this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres'],
    });
  }

  // 영화 삭제
  async remove(id: number) {
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
