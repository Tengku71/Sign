import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterAdminDto) {
    const exists = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const admin = await this.prisma.admin.create({
      data: { ...dto, password: hashedPassword },
    });

    const { password, ...result } = admin;
    return result;
  }

  async validateCredentials(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid email or password');

    const { password: _, ...result } = admin;
    return result;
  }

  async getProfile(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new UnauthorizedException('Admin not found');

    const { password, ...result } = admin;
    return result;
  }

  async createUser(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('User email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        isVerified: dto.isVerified ?? false,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { password, ...result } = user;
    return result;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailTaken) throw new ConflictException('Email already taken');
    }

    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    } else {
      delete updateData.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
