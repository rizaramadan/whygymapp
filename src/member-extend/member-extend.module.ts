import { Module } from '@nestjs/common';
import { MemberExtendController } from './member-extend.controller';
import { MemberExtendService } from './member-extend.service';

@Module({
  controllers: [MemberExtendController],
  providers: [MemberExtendService]
})
export class MemberExtendModule {}
