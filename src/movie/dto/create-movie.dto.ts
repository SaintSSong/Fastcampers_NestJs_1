import { IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  // 여기다가는 우리가 받고 싶은 값을 선언을 한다.
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  genre: string;
}
