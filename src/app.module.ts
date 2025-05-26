import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { MembersService } from './members/members.service';
import { DatabaseModule } from './database.module';
import { FoModule } from './fo/fo.module';
import { HttpModule } from '@nestjs/axios';
import { OrdersModule } from './orders/orders.module';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { PrivateCoachingModule } from './private-coaching/private-coaching.module';
import { MemberExtendModule } from './member-extend/member-extend.module';
import { DevToolsController } from './common/controllers/devtools.controller';

@Module({
  imports: [
    SentryModule.forRoot(),
    AuthModule,
    UsersModule,
    MembersModule,
    DatabaseModule,
    FoModule,
    HttpModule,
    OrdersModule,
    PrivateCoachingModule,
    MemberExtendModule,
  ],
  controllers: [AppController, DevToolsController],
  providers: [
    AppService,
    MembersService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
