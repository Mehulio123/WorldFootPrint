import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {//handles http requests, interesting
  constructor(private readonly appService: AppService) {}//inject services

  @Get()//handles GET requests to the root URL ("/"). when a GET request is made to the root URL, this method will be called.
  async getHello() {
    return await this.appService.getHello();//calls service
  }
}
