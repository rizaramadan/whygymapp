import { Module } from '@nestjs/common';
import { PrivateCoachingController } from './private-coaching.controller';
import { PrivateCoachingService } from './private-coaching.service';
import { DatabaseModule } from 'src/database.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [PrivateCoachingController],
  providers: [PrivateCoachingService],
  exports: [PrivateCoachingService],
})
export class PrivateCoachingModule {}
