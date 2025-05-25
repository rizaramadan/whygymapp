import { Module } from '@nestjs/common';
import { MemberExtendController } from './member-extend.controller';
import { MemberExtendService } from './member-extend.service';
import { MembersModule } from '../members/members.module';
import { DatabaseModule } from '../database.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [MembersModule, DatabaseModule, OrdersModule],
  controllers: [MemberExtendController],
  providers: [
    MemberExtendService
  ]
})
export class MemberExtendModule {}
