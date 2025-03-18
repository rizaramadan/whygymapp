import { Module } from '@nestjs/common';
import { FoController } from './fo.controller';
import { FoService } from './fo.service';
import { DatabaseModule } from 'src/database.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [FoController],
  providers: [FoService],
  exports: [FoService],
})
export class FoModule {}
