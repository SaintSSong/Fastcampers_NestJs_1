import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';

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
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  // 영화 전체 조회
  async findAll(dto: GetMoviesDto) {
    // 페이지 버전
    // const { title, take, page } = dto;

    // 커서 버전
    const { title } = dto;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title Like :title', { title: `%${title}%` });
    }

    // // 페이지 기반 페이지 네이션 시 take와 page 가져오는 방법
    // if (take && page) {
    //   this.commonService.applyPagePaginationParamsToQb(qb, dto);
    // }

    // 커서 기반 페이지 네이션 시 take와 page 가져오는 방법
    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    // count는 조건에 맞는 전체 갯수를 보내준다. 그래야지 현재목록 + 전체 갯수를 알 수 있으니까!
    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      nextCursor,
      count,
    };

    // if (!title) {
    //   return [
    //     await this.movieRepository.find({
    //       relations: ['director', 'genres'],
    //     }),
    //     await this.movieRepository.count(), //<- count 왜 하냐? 200만개 이렇게 있으면 총 몇개 있는지 바로 알 수 있고 나중에 페이지네이션 걸면 되니까 그렇다.
    //   ];
    // }
    // return await this.movieRepository.findAndCount({
    //   where: {
    //     title: Like(`%${title}%`), // 이렇게 넣어주면 꼭 그것만 아니여도 가져 올 수 있다.
    //   },
    //   relations: ['director', 'genres'],
    // });
  }

  // 영화 상세 조회
  async findOne(id: number) {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .where('movie.id = :id', { id })
      .getOne();

    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail', 'director', 'genres'],
    // });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    return movie;
  }

  // 영화 생성
  async create(createMovieDto: CreateMovieDto) {
    // console.log('✅ create() 실행됨'); // <- 이게 서버 켜자마자 찍히면 "부팅 중 호출" 확정
    // 트랜잭션을 사용할때 꼭 이렇게 해야 한다. 쿼리 러너로 해야한다.
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 감독 조회
      // const director = await this.directorRepository.findOne({
      const director = await qr.manager.findOne(Director, {
        where: {
          id: createMovieDto.directorId,
        },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
      }

      // 장르 조회
      // const genres = await this.genreRepository.find({
      const genres = await qr.manager.find(Genre, {
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

      // 쿼리 빌더의 단점: ManyToMany가 연결이 안된다. 나머지는 됨 쟤만 그냥 안됨...
      // 한번에 동시 생성이 안되어서 따로 따로 생성 시켜줘야 함.
      // save가 굉장히 비효율적으로 작성됨 = 줄이 많아짐

      // const movieDetail = await this.movieDetailRepository
      const movieDetail = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({
          detail: createMovieDto.detail,
        })
        .execute();

      // throw new NotFoundException('일부러 에러');

      const movieDetailId = movieDetail.identifiers[0].id;

      // const movie = await this.movieRepository
      const movie = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: createMovieDto.title,
          detail: {
            id: movieDetailId,
          },
          director,
        })
        .execute();

      const movieId = movie.identifiers[0].id;

      // await this.movieRepository
      await qr.manager
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map((genres) => genres.id));

      // const movie = await this.movieRepository.save({
      //   title: createMovieDto.title,
      //   detail: {
      //     detail: createMovieDto.detail,
      //   },
      //   genres,
      //   director,
      // });

      await qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: {
          id: movieId,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();

      throw e;
    } finally {
      await qr.release();
    }
  }

  // 영화 수정
  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // const movie = await this.movieRepository.findOne({
      const movie = await qr.manager.findOne(Movie, {
        where: {
          id,
        },
        relations: ['detail', 'genres'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 영화입니다.');
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      // null 값으로 일단은 생성해둔다.
      let newDirector;

      if (directorId) {
        // const director = await this.directorRepository.findOne({
        const director = await qr.manager.findOne(Director, {
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
        // const genres = await this.genreRepository.find({
        const genres = await qr.manager.find(Genre, {
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

      // await this.movieRepository
      await qr.manager
        .createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id = :id', { id })
        .execute();

      // throw new NotFoundException('일부러 에러 던짐');

      // 업데이트 진행
      // await this.movieRepository.update(
      //   {
      //     id,
      //   },
      //   movieUpdateFields,
      // );

      if (detail) {
        // await this.movieDetailRepository
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({ detail })
          .where('id = :id', { id: movie.detail.id })
          .execute();

        // await this.movieDetailRepository.update(
        //   {
        //     id: movie.detail.id,
        //   },
        //   { detail }, // 객체가 없기 때문에 객체로 감싼다.
        // );
      }

      if (newGenres) {
        // await this.movieRepository
        await qr.manager
          .createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(
            newGenres.map((genre) => genre.id), // 새로 추가 할 장르 id를 리스트에 넣는다.
            movie.genres.map((genre) => genre.id), // 이미 존재하던 삭제 할 장르 id를 리스트에 넣는다.
          );
      }

      // const newMovie = await this.movieRepository.findOne({
      //   where: {
      //     id,
      //   },
      //   relations: ['detail', 'director'],
      // });

      // if (newMovie) {
      //   newMovie.genres = newGenres;

      //   await this.movieRepository.save(newMovie);
      // }

      await qr.commitTransaction();

      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
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

    // await this.movieRepository.delete(id);

    await this.movieRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }
}
