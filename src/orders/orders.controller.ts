import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  Request,
  Body,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MembersService } from '../members/members.service';
import { User } from '../users/users.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly membersService: MembersService,
  ) {}

  @Get("/")
  test() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }
}