import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      return value;
    }

    // 만약에 글자 길이가 2보다 작거나 같으면 에러 던지기!
    if (value.length <= 2) {
      throw new BadRequestException('영화의 제목은 3자 이상 작성해주세요');
    }
    return value;
  }
  // 들어올 값과 반환할 값을 제네릭으로 넣어줘야한다. 제네릭은 타입을 변수처럼 쓰는 것을 말한다.
}
