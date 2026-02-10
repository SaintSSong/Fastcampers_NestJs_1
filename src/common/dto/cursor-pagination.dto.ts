import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  // id_52, likeCount_20,
  cursor?: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  // id_ASC, id_DESC
  // order = [id_DESC, likeCount_DESC] 이런 식으로 표현 할 것이다.
  // 하지만 꼭 이렇게 할 필요는 없다. 모로가도 서울이기만 하면 된다!
  order: string[] = ['id_DESC']; // id_DESC을 기본 값으로 넣는거다.

  @IsInt()
  @IsOptional()
  take: number = 5; // 몇개를 가지고 올지? // null인 경우 기본으로 20 들어감
}
