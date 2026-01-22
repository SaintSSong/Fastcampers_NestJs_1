import { Injectable, NotFoundException } from '@nestjs/common';

export interface Movie {
  id: number;
  title: string;
}

@Injectable()
export class MovieService {
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

  getManyMovies(title?: string) {
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

  createMovie(title: string) {
    const movie: Movie = {
      id: this.idCounter++,
      title: title,
    };

    this.movies.push(movie);

    return movie;
  }

  updateMovie(id: number, title: string) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.'); // NotFoundException는 Nest에서 제공하는 메서드다.
    }

    // 찾은 영화에 타이틀을 덮어씌우는 코드
    // Object.assign은 Js 문법이다.
    Object.assign(movie, { title });

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
