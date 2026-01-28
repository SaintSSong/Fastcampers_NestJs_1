import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';

@Injectable()
export class MovieService {
  private movies: Movie[] = [];

  private idCounter = 3;

  constructor() {
    const movie1 = new Movie();

    movie1.id = 1;
    movie1.title = '해리포터';
    movie1.genre = 'fantasy';

    const movie2 = new Movie();
    movie2.id = 2;
    movie2.title = '반지의제왕';
    movie2.genre = 'action';

    this.movies.push(movie1, movie2);
  }

  getManyMovies(title?: string) {
    console.log(this.movies);

    if (!title) {
      return this.movies;
    }

    return this.movies.filter((m) => m.title.startsWith(title)); // startsWith은 ~~로 시작한다.
  }

  getMovieById(id: number) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    return movie;
  }

  createMovie(
    /**title: string, genre: string*/ createMovieDto: CreateMovieDto,
  ) {
    const movie: Movie = {
      id: this.idCounter++,
      ...createMovieDto,
    };

    this.movies.push(movie);

    return movie;
  }

  updateMovie(
    id: number /**title?: string, genre?: string*/,
    updateMovieDto: UpdateMovieDto,
  ) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    // 찾은 영화에 타이틀을 덮어씌우는 코드
    // Object.assign은 Js 문법이다.
    Object.assign(movie, { ...updateMovieDto });

    return movie;
  }

  deleteMovie(id: number) {
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
