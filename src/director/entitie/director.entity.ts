import { BaseTable } from 'src/common/entity/base-table.entity';
import { Movie } from 'src/movie/entity/movie.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Director extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dob: Date;

  @Column()
  nationality: string;

  @OneToMany(
    // 항상 나의 입장을 먼저 생각하면 쉽다. 감독이 먼저니까 One
    () => Movie,
    (movie) => movie.director,
  )
  movies: Movie[];
}

// 감독이 여러개의 영화를 가지는 것인가?
// 영화가 여러개의 감독을 가지는 것인가? 꼭 생각하기
