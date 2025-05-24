import { Module } from '@nestjs/common';
import { MemberExtendController } from './member-extend.controller';
import { MemberExtendService } from './member-extend.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [MembersModule],
  controllers: [MemberExtendController],
  providers: [MemberExtendService]
})
export class MemberExtendModule {}
