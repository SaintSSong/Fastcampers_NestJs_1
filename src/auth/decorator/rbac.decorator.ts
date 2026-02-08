import { Reflector } from '@nestjs/core';
import { Role } from 'src/user/entities/user.entity';

// @Rbac()를 만드는 코드
export const RBAC = Reflector.createDecorator<Role>();
