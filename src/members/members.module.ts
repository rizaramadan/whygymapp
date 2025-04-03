import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberPricingService } from './member-pricing.service';
import { DatabaseModule } from 'src/database.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [MembersController],
  providers: [MembersService, MemberPricingService],
  exports: [MembersService, MemberPricingService],
})
export class MembersModule {}
