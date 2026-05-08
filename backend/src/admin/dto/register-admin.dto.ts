import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @IsEmail() email!: string;
  @IsNotEmpty() @MinLength(2) name!: string;
  @IsNotEmpty() @MinLength(8) password!: string;
}
