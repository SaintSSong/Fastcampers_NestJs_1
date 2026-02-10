import { BadRequestException, Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { stringify } from 'querystring';

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
  async applyCursorPaginationParamsToQb<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, take, order } = dto;

    // 만약 커서가 있다면 다음 페이지에 적합하게 넣어주는 방법은 아래와 같다.
    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8'); // 일반적으로 우리가 보는 문자 String으로 바꾸겠다!

      /**
       * {
       *  values : {
       *       id : 27
       *  },
       * order : ["id_DESC"]
       * }
       *
       * 이런 형식으로 cursorObj가 나온다.
       */
      const cursorObj = JSON.parse(decodedCursor); // 문자 String을 Json 형식으로 다시 바꿔준다.

      order = cursorObj.order;

      const { values } = cursorObj;

      ///

      const columns = Object.keys(values); // id, likeCunt 등등 key들만 모인다.
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>'; // "DESC"로 끝나는 값이 존재하는지 체크

      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `:${c}`).join(',');

      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    // 커서가 없는 상황!

    // 예시 데이터가 이렇게 들어왔다. ["likeCount_DESC", "id_DESC", ]
    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');
      // "_" 기준으로 나눌거니까
      // column에는 "likeCount"가 들어가고 direction에는 "DESC"가 들어가겠다.

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException('Order는 ASC 또는 DESC로 입력해주세요.');
      }

      // i ===0 즉 처음이면
      if (i === 0) {
        // qb.alias = 현재 테이블
        // Movie.likeCount, DESC 형태로 된다.
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        // i가 처음이 아니면 즉 i!==0이면 추가로 넣는 것이기 때문에 addOrderBy다.
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
    }

    qb.take(take);

    const result = await qb.getMany();

    const nextCursor = this.generateNestCursor(result, order);

    return { qb, nextCursor };
  }

  // 커서를 만들어서 보내는 작업을 하자.
  // <T>를 왜 받냐? 쿼리를 실행하고서 응답 받는 실제 데이터 리스트를 우리가 result에 넣어줄거다.
  // 우리가 보내준 마지막 데이터를 기반으로 원래는 PE에서 커서를 만들어줄건데
  // 이번에는 우리가 커서를 만들어 줄 것이기 때문에 우리가 가지고 있어야 한다.
  generateNestCursor<T>(results: T[], order: string[]): string | null {
    // 반환값을 string or null로 못 박는다.
    if (results.length === 0) {
      return null;
    }

    /**
     * {
     *  values : {
     *       id : 27
     *  },
     * order : ["id_DESC"]
     * }
     *
     * 이렇게 result랑 order로 형식을 위처럼 만들면 된다.
     */

    /**
     * results = [                           인덱스     순서
      { id: 10, likeCount: 3, title: 'A' },   0          1
      { id: 11, likeCount: 3, title: 'B' },   1          2
      { id: 12, likeCount: 2, title: 'C' },   2          3
      ];
     */
    const lastItem = results[results.length - 1]; // 마지막 값을 가져온다.
    const values = {};

    // [id_DESC] 이렇게 들어오면

    order.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');
      values[column] = lastItem[column];
    });

    // values가 객체인데 왜 []배열로 받지? => 배열이 아니라 객체에서 key를 변수처럼 사용하려면 [] 형태로 써야함.

    const cusrsorObj = { values, order };

    // string으로 되어 있는 것을 base64로 인코딩한다.
    const nextCursor = Buffer.from(JSON.stringify(cusrsorObj)).toString(
      'base64',
    );

    return nextCursor;
  }
}

//
