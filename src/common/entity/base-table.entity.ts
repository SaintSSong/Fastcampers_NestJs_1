import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

// 항상 쓸거를 모아놓는다. 중복해서 가져다가 쓸 수 있는 것
export class BaseTable {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
