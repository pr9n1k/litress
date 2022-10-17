import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  setUser(@Body() dto: { name: string }) {
    return this.appService.setUser(dto);
  }

  @Get()
  getUser() {
    return this.appService.getUser();
  }
}
