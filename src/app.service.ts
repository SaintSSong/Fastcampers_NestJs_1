import { Injectable, NotFoundException } from '@nestjs/common';

export interface Movie {
  id: number;
  title: string;
}

@Injectable()
// @Injectable() <- 이렇게 놓으면 IoC 컨테이너한테 너가 이 class를 IoC 컨테이너에서 알아서 관리해줘 라고 명령하는 거랑 똑같다.
// 그러면 IoC 컨테이너는 AppService를 인스턴스화 해서 내가 다른 곳에서 AppService를 필요로 하는 곳에서 인스턴스화 했으니까 자동으로 넣어줄게! 이러게 된다.
export class AppService {
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
