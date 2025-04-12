import { Module } from '@nestjs/common';
import { PrivateCoachingService } from './private-coaching.service';
import { MembersModule } from '../members/members.module';
import { DatabaseModule } from '../database.module';
import { PrivateCoachingController } from './private-coaching.controller';
@Module({
  imports: [MembersModule, DatabaseModule],
  controllers: [PrivateCoachingController],
  providers: [PrivateCoachingService],
  exports: [PrivateCoachingService],
})
export class PrivateCoachingModule {}
