import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateModeDto {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  timeLimit!: number;
}
