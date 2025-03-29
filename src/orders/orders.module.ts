import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { HttpModule } from '@nestjs/axios';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [DatabaseModule, HttpModule, MembersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
