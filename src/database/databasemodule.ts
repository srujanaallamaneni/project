import { Module } from '@nestjs/common';
import { DatabaseService } from './databaseservice';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
