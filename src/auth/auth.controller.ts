import { Body, Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { SignUpDto } from 'src/users/dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Request() req: any) {
    const user = req.user;
    return this.authService.login(user.username, user.userId);
  }

  @Post(`signup`)
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto.username, signUpDto.password, signUpDto.firstname, signUpDto.lastname, signUpDto.email, signUpDto.phone);
  }
}
