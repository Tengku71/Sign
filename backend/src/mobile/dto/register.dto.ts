import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class MobileRegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
