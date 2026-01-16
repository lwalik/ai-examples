import { Controller, Get, Query } from '@nestjs/common';
import { FitnessClass } from '@text2rest/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(@Query() filters: Partial<FitnessClass>) {
    return this.appService.getData(filters);
  }
}
