import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database.module';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, HttpModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
