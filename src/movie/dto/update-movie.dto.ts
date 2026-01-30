import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

// 커스텀 방법 1
@ValidatorConstraint() // <- 이걸 해야지 customValidator로 @ 시킬 수 있다.
class PasswordValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return value.length > 3 && value.length < 9;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return '비밀번호는 4 ~ 8자 여야합니다. 입력된 비밀번호($value)';
  }
}

// 커스텀 방법 2
function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor, // target: object.constructor,       propertyName,       options: validationOptions, 는 디폴트로 들어간다.
      propertyName,
      options: validationOptions,
      validator: PasswordValidator,
    });
  };
}

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional() // <- 이거 없으면 옵셔널 성격을 못 준다. ?를 줬어도
  @IsString()
  title?: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsNumber(
    {}, // <= IsNumber의 고유 값인데 빈칸 놔도 무방
    {
      each: true, // 배열 안에 모든 값들을 각각 검증하는 기술 = 모두 다 숫자여야한다.
    },
  )
  genreIds?: number[];

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  detail?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  directorId?: number;
}
