import { IsBoolean, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsBoolean()
  isVerified?: boolean;
}
