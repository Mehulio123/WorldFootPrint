import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
  ) {
    return this.authService.signup(email, name, password);
    //                              ↑     ↑     ↑
    //                            Correct order now!
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}