import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.id)
  movie: Movie;
}
