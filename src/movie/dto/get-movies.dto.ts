import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
// import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';

// // 페이지 페이지네이션 기반 영화 목록 조회 DTO
// export class GetMoviesDto extends PagePaginationDto {
//   @IsString()
//   @IsOptional()
//   title?: string;
// }

// 커서 페이지네이션 기반 영화 목록 조회 DTO
export class GetMoviesDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
