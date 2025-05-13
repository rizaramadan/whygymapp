import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberPricingService } from './member-pricing.service';
import { DatabaseModule } from '../database.module';
import { HttpModule } from '@nestjs/axios';
import { AppService } from 'src/app.service';
@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [MembersController],
  providers: [MembersService, MemberPricingService, AppService],
  exports: [MembersService, MemberPricingService],
})
export class MembersModule {}
