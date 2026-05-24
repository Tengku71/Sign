import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileRegisterDto } from './dto/register.dto';
import { MobileLoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('register')
  async register(@Body() dto: MobileRegisterDto) {
    return this.mobileService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: MobileLoginDto) {
    return this.mobileService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verify(@Req() req: Request) {
    return {
      valid: true,
      user: req['user'],
    };
  }
}
