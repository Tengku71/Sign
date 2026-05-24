import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MobileRegisterDto } from './dto/register.dto';
import { MobileLoginDto } from './dto/login.dto';

@Injectable()
export class MobileService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: MobileRegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
    });

    // const user = await this.prisma.user.create({
    //   data: {
    //     email: dto.email,
    //     name: dto.name,
    //     password: hashedPassword,
    //   },
    // });

    // const { password, ...userData } = user;
    return { success: 'User Create' };
  }

  async login(dto: MobileLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userData } = user;
    return { access_token, user: userData };
  }
}
