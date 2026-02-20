import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  // 여기다가는 우리가 받고 싶은 값을 선언을 한다.
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {}, // <= IsNumber의 고유 값인데 빈칸 놔도 무방
    {
      each: true, // 배열 안에 모든 값들을 각각 검증하는 기술 = 모두 다 숫자여야한다.
    },
  )
  @Type(() => Number) // 이걸 하는 이유는 Multer에서 폼 데이터는 string으로 밖에 안넘어와서 여기서 변신시켜주는거다.
  genreIds: number[];
}
