import { Module } from '@nestjs/common';

import { MovieModule } from './movie/movie.module';

@Module({
  imports: [MovieModule], // import는 또 다른 모듈(A)을 현재 모듈(app.module / B)로 불러 들일 때 사용한다.
  exports: [], // import에서 불러온 모듈(A) 속의 기능을 현재 B에서 쓰고 싶을 때 그 기능을 export에 적는다.
  controllers: [],
  providers: [], // Inject 해주는 기능이 있는 친구들을 provider에 넣는다.
})
export class AppModule {}
