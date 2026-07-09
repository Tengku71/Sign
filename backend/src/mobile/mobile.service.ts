import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MobileRegisterDto } from './dto/register.dto';
import { MobileLoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-passwords.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { EmailService } from './email/email.service';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto, GoogleRegisterDto } from './dto/google-auth.dto';

@Injectable()
export class MobileService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid payload');
      return payload;
    } catch (error) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
        );
        if (!response.ok) throw new Error('Token invalid');
        const data = await response.json();
        return {
          email: data.email,
          name: data.name,
          picture: data.picture,
          sub: data.sub,
        };
      } catch (err) {
        throw new UnauthorizedException(
          'Token Google tidak valid atau kedaluwarsa',
        );
      }
    }
  }

  async googleRegister(dto: GoogleRegisterDto) {
    const payload = await this.verifyGoogleToken(dto.idToken);

    if (payload.email.toLowerCase() !== dto.email.toLowerCase()) {
      throw new UnauthorizedException(
        'Email token tidak cocok dengan data yang diberikan',
      );
    }

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email sudah terdaftar');
    }

    await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: null,
        isVerified: false,
        isGoogleUser: true,
        image: payload.picture || null,
      },
    });

    const otp = this.generateOtp();
    await this.saveOtp(dto.email, otp, 'verification');

    try {
      await this.emailService.sendOtpEmail(dto.email, otp, 'verification');
    } catch (error) {
      console.error('Gagal mengirim email OTP:', error);
    }

    return {
      success: true,
      message:
        'Pendaftaran Google berhasil. Silakan periksa email Anda untuk verifikasi OTP.',
    };
  }

  async googleLogin(dto: GoogleLoginDto) {
    const payload = await this.verifyGoogleToken(dto.idToken);

    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
      );
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Harap verifikasi email Anda terlebih dahulu. Periksa kotak masuk email Anda untuk mendapatkan OTP.',
      );
    }

    const jwtPayload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(jwtPayload);

    const { password, ...userData } = user;
    return { access_token, user: userData };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verify(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    const { password, ...userData } = user;
    return { valid: true, user: userData };
  }

  async register(dto: MobileRegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        isVerified: false,
      },
    });

    const otp = this.generateOtp();
    await this.saveOtp(dto.email, otp, 'verification');

    try {
      await this.emailService.sendOtpEmail(dto.email, otp, 'verification');
    } catch (error) {
      console.error('Gagal mengirim email OTP:', error);
    }

    return {
      success: true,
      message:
        'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi OTP.',
    };
  }

  async verifyEmail(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Pengguna tidak ditemukan');
    }

    if (user.isVerified) {
      return { success: true, message: 'Email sudah diverifikasi' };
    }

    const validOtp = await this.validateOtp(dto.email, dto.otp, 'verification');

    if (!validOtp) {
      throw new BadRequestException('OTP tidak valid atau kedaluwarsa');
    }

    await this.markOtpAsUsed(validOtp.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    return { success: true, message: 'Email berhasil diverifikasi' };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Pengguna tidak ditemukan');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email sudah diverifikasi');
    }

    const otp = this.generateOtp();
    await this.saveOtp(email, otp, 'verification');

    await this.emailService.sendOtpEmail(email, otp, 'verification');

    return { success: true, message: 'OTP baru telah dikirim ke email Anda.' };
  }

  async login(dto: MobileLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Kredensial tidak valid');

    if (user.isGoogleUser || !user.password) {
      throw new UnauthorizedException(
        'Akun ini terdaftar menggunakan Google. Silakan login dengan tombol Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Kredensial tidak valid');

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Harap verifikasi email Anda terlebih dahulu. Periksa kotak masuk email Anda untuk mendapatkan OTP.',
      );
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userData } = user;
    return { access_token, user: userData };
  }
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        success: true,
        message: 'Jika email terdaftar, OTP akan dikirimkan.',
      };
    }

    const otp = this.generateOtp();
    await this.saveOtp(dto.email, otp, 'password_reset');

    await this.emailService.sendOtpEmail(dto.email, otp, 'reset');

    return {
      success: true,
      message: 'Jika email terdaftar, OTP akan dikirimkan.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const validOtp = await this.validateOtp(
      dto.email,
      dto.otp,
      'password_reset',
    );

    if (!validOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.markOtpAsUsed(validOtp.id);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  private async saveOtp(email: string, code: string, type: string) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    return this.prisma.otp.create({
      data: {
        email,
        code,
        type,
        expiresAt,
        used: false,
      },
    });
  }

  private async validateOtp(email: string, code: string, type: string) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return otp;
  }

  private async markOtpAsUsed(otpId: number) {
    return this.prisma.otp.update({
      where: { id: otpId },
      data: { used: true },
    });
  }

  async cleanupExpiredOtps() {
    const result = await this.prisma.otp.deleteMany({
      where: {
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    });

    return { deleted: result.count };
  }

  async updateProfile(userId: number, dto: any, imagePath?: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (currentUser?.image && imagePath) {
      const oldImagePath = join(process.cwd(), currentUser.image);
      try {
        await unlink(oldImagePath);
      } catch (err) {
        // console.log(err);
      }
    }

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (imagePath) data.image = imagePath;

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Akun ini tidak memiliki kata sandi. Silakan login menggunakan Google/OAuth.',
      );
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Kata sandi saat ini salah');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
      },
    });
  }
}
