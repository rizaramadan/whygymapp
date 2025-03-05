import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { MembersService } from './members/members.service';
import { DatabaseModule } from './database.module';
@Module({
  imports: [AuthModule, UsersModule, MembersModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, MembersService],
})
export class AppModule {}
