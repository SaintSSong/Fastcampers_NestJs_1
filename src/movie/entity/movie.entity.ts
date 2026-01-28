import { Exclude, Expose, Transform } from 'class-transformer';

export class Movie {
  id: number;
  title: string;

  @Transform(
    ({ value }) => 'code factory',
    // ({ value }) => value.toString().toUpperCase(),
  )
  genre: string;
}
