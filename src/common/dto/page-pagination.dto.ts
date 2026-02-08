import { IsInt, IsOptional } from 'class-validator';

export class PagePaginationDto {
  @IsInt()
  @IsOptional()
  page: number = 1; // 몇 페이지인지 // null인 경우 기본으로 1 들어감

  @IsInt()
  @IsOptional()
  take: number = 5; // 몇개를 가지고 올지? // null인 경우 기본으로 20 들어감
}
