import { IsIn, IsInt, IsOptional } from 'class-validator';

export class CursorPaginationDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @IsOptional()
  take: number = 5; // 몇개를 가지고 올지? // null인 경우 기본으로 20 들어감
}
