import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

// ManyToOne  감독 - >감독은 여러개의 영화를 만들 수 있음.
// OneToOne   무비 디테일 -> 영화는 하나의 상세 내용을 가질 수 있음
// ManyToMany 장르 -> 영화는 여러 개의 장르를 가질 수 있고 장르는 여러 개의 영화에 속 할 수 있음.

@Entity() // Movie라는 클래스를 테이블로 만들기 위해서 @Entity를 꼭 해야한다. 꼭 기억해라.
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies, {
    // cascade: true,
  })
  @JoinTable()
  genres: Genre[];

  @Column({ default: 0 })
  likeCount: number;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // <- cascade: true로 해야지 한번에 생성이 가능하다. 아니면 따로 따로 생성해서 그걸 붙여서 반환해야하는데 그러면 길어진다.
    nullable: false, // null 불가 꼭 잘 확인해야 함.
  }) // 나랑 관계를 맻는 녀석을 작성해줘야한다.
  @JoinColumn() // <- 영화와 영화 상세 둘 중 영화가 가지고 있는게 더 좋다. 사실 상관은 없다. 상대편에 넣어도 된다.
  detail: MovieDetail;

  @Column() // <- 이게 나중에 추가한 칼럼인데 추가하면 당연히 마이그레이션 하지 않은 이상 DB에 데이터가 있다면 에러가 날 것이다. 그때는 개발 중이라면 그냥 DROP한 다음 다시 만들어라
  movieFilePath: string;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;
}
