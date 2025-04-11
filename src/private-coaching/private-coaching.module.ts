import { Module } from '@nestjs/common';
import { PrivateCoachingController } from './private-coaching.controller';
import { PrivateCoachingService } from './private-coaching.service';

@Module({
  controllers: [PrivateCoachingController],
  providers: [PrivateCoachingService],
})
export class PrivateCoachingModule {}
