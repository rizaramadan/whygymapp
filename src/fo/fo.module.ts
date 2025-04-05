import { Module } from '@nestjs/common';
import { FoController } from './fo.controller';
import { FoService } from './fo.service';
import { DatabaseModule } from 'src/database.module';
import { HttpModule } from '@nestjs/axios';
import { MembersModule } from 'src/members/members.module';
@Module({
  imports: [DatabaseModule, HttpModule, MembersModule],
  controllers: [FoController],
  providers: [FoService],
  exports: [FoService],
})
export class FoModule {}
