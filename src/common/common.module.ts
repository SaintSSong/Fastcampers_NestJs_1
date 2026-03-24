import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register(
      // register : 저장한다.
      {
        storage: diskStorage({
          // storage : 저장소  / diskStorage: 로컬에다가 저장한다.
          // join은 경로를 탐색 할 때 쓴다.  process.cwd()는 서버가 시작되는 최상단 폴더(root)를 말한다.
          // 거기서에서 부터 이제 ,을 통해서 무한히 들어 갈 수 있다.
          // 현재 우리가 서버를 실행하고 있는 운영체제에 적합한 형태로 패스를 알아서 매칭해준다. = Join()
          destination: join(process.cwd(), 'public', 'temp'), // destination : 목적지  즉 파일을 저장할 폴더를 지정하는 것이다.
          filename: (req, file, callback) => {
            const split = file.originalname.split('.');

            let extension = 'mp4';

            if (split.length > 1) {
              extension = split[split.length - 1];
            }

            callback(null, `${v4()}_${Date.now()}.${extension}`);
          },
        }),
      },
    ),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
