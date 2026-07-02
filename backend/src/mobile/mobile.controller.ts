import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UseInterceptors,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileRegisterDto } from './dto/register.dto';
import { MobileLoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChangePasswordDto } from './dto/change-passwords.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('register')
  async register(@Body() dto: MobileRegisterDto) {
    return this.mobileService.register(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.mobileService.verifyEmail(dto);
  }

  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    return this.mobileService.resendOtp(email);
  }

  @Post('login')
  async login(@Body() dto: MobileLoginDto) {
    return this.mobileService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.mobileService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.mobileService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verify(@Req() req) {
    return this.mobileService.verify(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async updateProfile(
    @Req() req,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const imagePath = file ? `/uploads/profile/${file.filename}` : undefined;
    return this.mobileService.updateProfile(userId, dto, imagePath);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.mobileService.changePassword(req.user.id, dto);
  }
}
