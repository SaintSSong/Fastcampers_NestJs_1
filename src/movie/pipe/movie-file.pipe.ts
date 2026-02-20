import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { v4 } from 'uuid';
import { rename } from 'fs/promises'; // 파일 시스템(fs) 프로미스 기반에서 쓸 수 있는 이름 바꿔줄 수 있는 것
import { join } from 'path';

@Injectable()
export class MovieFilePipe implements PipeTransform<
  Express.Multer.File,
  Promise<Express.Multer.File> // 전환하려는 값, 반환하려는 값까지 Express.Multer.File이다.
> {
  constructor(
    private readonly options: {
      // MB로 입력
      maxSize: number;
      mimetype: string;
    },
  ) {}

  async transform(
    value: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 필드는 필수입니다.');
    }

    const byteSize = this.options.maxSize * 1000000;

    if (value.size > byteSize) {
      throw new BadRequestException(
        `${this.options.maxSize}MB 이하의 사이즈만 업로드 가능합니다!`,
      );
    }

    if (value.mimetype !== this.options.mimetype) {
      throw new BadRequestException(
        `${this.options.mimetype} 만 업로드 가능합니다!`,
      );
    }

    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }

    // UUID_DAte.mp4 형태로 될테다.
    const filename = `${v4()}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename); // destination은 파일이 저장 될 or 된 폴더까지가 destination이다.  movie 모듈에 있다.

    await rename(value.path, newPath);

    return {
      ...value,
      filename, // filename을 덮어 씌운다. 새로운 filename으로
      path: newPath,
    };
  }
}
