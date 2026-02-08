import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  // 페이지 페이지네이션 QB
  applyPagePaginationParamsToQb<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;

    // 3 - 1 = 2 * 4 = 8 이니까 id or 순서가 9번째인것부터가져오겠다.
    const skip = (page - 1) * take;

    qb.take(take);
    qb.skip(skip);
  }

  // 커서 페이지 네이션 QB
  applyCursorPaginationParamsToQb<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { order, take, id } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>' : '<';

      // order -> ASC : movie.id > :id
      // :id는 "id"라는 이름의 변수의 값이 들어올 자리다. 라고 지칭하는 것 id는 {id}를 의미한다.
      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }

    // alias는 우리가 선택한 테이블을 무엇으로 불렀는지가 alias다.
    // ex) Movie 테이블 선택했으면 alias가 Movie 테이블이다.
    qb.orderBy(`${qb.alias}.id`, order);

    qb.take(take);
  }
}
